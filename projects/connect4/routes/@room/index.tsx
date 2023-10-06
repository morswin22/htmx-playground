import { Handler, Request, Response } from "express";
import { CenteredLayout } from "@fw/components/CenteredLayout";
import * as elements from "typed-html";
import { Fragment } from "@fw/components/Fragment";
import crypto from "crypto";
import { merge } from "@fw/utils/tailwind";
import { updateClients } from "./updates";
import { uuidToName } from "../list";

// temporary
export type Player = string;

export const boardSize = 7;
const playerColors = ["yellow", "blue"] as const; // TODO (bug:production) separate this into playerColorsText and playersColorsBackground for tailwind to be able to see that i use this in classnames

export type Room = {
  name: string;
  players: [Player, Player] | [Player];
  board: (0 | 1 | null)[][];
  turn: 0 | 1;
  state: "waiting" | "playing" | "finished";
  winner: 0 | 1 | null;
  stats: [number, number];
  rematchConfirmations: [boolean, boolean];
}

export const rooms: Room[] = [];

export function createBoard() {
  return Array.from({ length: boardSize }, () => Array.from({ length: boardSize }, () => null));
}

export function createRoom(player: Player) {
  const name = crypto.randomUUID();
  rooms.push({
    name,
    players: [player],
    board: createBoard(),
    turn: 0,
    state: "waiting",
    winner: null,
    stats: [0, 0],
    rematchConfirmations: [false, false],
  });
  return name;
}

export function joinRoom(room: Room, player: Player) {
  if (room.state !== "waiting" || room.players.length !== 1)
    throw new Error("Room is not waiting or is full");

  room.players.push(player);
  if (Math.random() < 0.5) {
    room.players.reverse();
  }
  room.state = "playing";

  updateClients(room, (client, other) => {
    if (other === player) return;
    const res = <Connect4Room room={room} player={other} />;
    client.write(`event: room\ndata: ${res.replace(/\n/g, "")}\n\n`);
  });
}

export function getPlayer(req: Request, res: Response) {
  let player = req.signedCookies["connect4/player"] as ReturnType<typeof crypto.randomUUID>;
  if (player === undefined) {
    player = crypto.randomUUID();
    res.cookie("connect4/player", player, { signed: true });
  }
  return player;
}

const circleBase = "w-full aspect-square rounded-full";

export function Board({ room, myTurn }: { room: Room, myTurn: boolean }) {
  return (
    <div class={`bg-gray-700 p-3 rounded grid grid-cols-${boardSize} gap-2`} id="board">
      {room.board.map((row) => row.map((cell, column) => (
        <div class="aspect-square w-10 sm:w-16">
          {cell === null ? (
            myTurn && room.state === "playing" ? (
              <div
                class={merge(circleBase, "bg-gray-800 cursor-pointer")}
                hx-get={`/${room.name}/play/${column}`}
                hx-swap="outerHTML"
                hx-target="#board"
              /> 
            ) : (
              <div class={merge(circleBase, "bg-gray-800")} /> 
            )
          ) : (
            <div class={merge(circleBase, `bg-${playerColors[cell]}-500`)} /> 
          )}
        </div>
      ))).flat()}
    </div>
  );
}

function RemoteUpdates({ room }: { room: Room }) {
  return (
    <div hx-ext="sse" sse-connect={`/${room.name}/updates`} class="hidden">
      <div sse-swap="room" hx-target="main" hx-swap="innerHTML" />
      <div sse-swap="board" hx-target="#board" hx-swap="outerHTML" />
    </div>
  );
}

export function PlayerStatus({ room, player }: { room: Room, player: Player }) {
  const isPlaying = room.players.includes(player);
  const playerIndex = room.players.indexOf(player);
  const playerColor = playerColors[playerIndex];
  return (
    <div class="bg-gray-700 p-3 rounded mt-3">
      {isPlaying ? 
        room.state === "waiting" ? (
          <p>You are <span class="font-semibold">waiting</span></p>
        ) : (
          <p>You are <span class={`text-${playerColor}-500 capitalize font-semibold`}><i class="fa fa-sold fa-circle fa-sm" /> {playerColor}</span></p>
        ) : (
          <p>
            You are
            <span class="font-semibold">spectating</span>
            {room.state === "waiting" ? `(but you can ${<a hx-boost="true" href={`/${room.name}/join`} class="underline">join</a>})` : null}
          </p>
        )}
    </div>
  );
}

function GameResult({ room }: { room: Room }) {
  if (room.state !== "finished")
    return null;
  if (room.winner === null) {
    return <p class="text-center">Draw!</p>;
  } else {
    return <p class="text-center"><span class={`capitalize text-${playerColors[room.winner]}-500`}><i class="fa fa-sold fa-circle fa-sm" /> {playerColors[room.winner]}</span> wins!</p>;
  }
}

function RoomName({ room }: { room: Room }) {
  return (
    <p
      class="capitalize cursor-pointer text-center select-none group relative"
      _="on click js navigator.clipboard.writeText(location.href) end add .touched to me add .copied to me wait 1s remove .copied from me"
    >
      {/* TODO (bug) + " " is needed because typed html adds \n or spaces idk in places where there should be nothing (in react) so i would just add a &nbsp; and be done, but because i render via sse (removing \n) thus this is what works */}
      {uuidToName(room.name, " ") + " "}
      <i class="fa-solid fa-arrow-up-right-from-square" />
      <span class="opacity-0 group-[.touched]:transition-opacity group-[.copied]:opacity-100 cursor-auto absolute -top-10 left-1/2 -translate-x-1/2">Copied!</span>
    </p>
  );
}

function RoomScore({ room }: { room: Room }) {
  if (room.stats.every(stat => stat === 0))
    return null;
  return (
    <p class="text-center text-2xl font-bold">{room.stats.map((stat, idx) => <span class={`text-${playerColors[idx]}-500`}>{stat}</span>).join(" : ")}</p>
  );
}

function GameStatus({ room, player }: { room: Room, player: Player }) {
  return (
    <div class="bg-gray-700 p-3 rounded mb-3 flex flex-col gap-3">
      <RoomName room={room} />
      <GameResult room={room} />
      <RoomScore room={room} />
      <GameControls room={room} player={player} />
    </div>
  );
}

function GameControls({ room, player }: { room: Room, player: Player }) {
  if (room.state !== "finished")
    return null;
  return (
    <div class="flex flex-col gap-2">
      {room.rematchConfirmations.some(Boolean) ? (
        room.rematchConfirmations[room.players.indexOf(player)] ? (
          <p class="text-center"><i class="fa-solid fa-spinner animate-spin" />Waiting for other player to confirm rematch</p>
        ) : (
          <Fragment>
            <p class="text-center">Your opponent wants to rematch!</p>
            <button
              class="bg-purple-700 p-2 rounded select-none"
              hx-get={`/${room.name}/rematch`}
              hx-swap="innerHTML"
              hx-target="main"
            >
              <i class="fa fa-check" /> Confirm rematch
            </button>
          </Fragment>
        )
      ) : (
        <button
          class="bg-purple-700 p-2 rounded select-none"
          hx-get={`/${room.name}/rematch`}
          hx-swap="innerHTML"
          hx-target="main"
        >
          Rematch
        </button>
      )}
    </div>
  );
}

export function Connect4Room({ room, player }: { room: Room, player: Player }) {
  const isPlaying = room.players.includes(player);
  const playerIndex = room.players.indexOf(player);
  const myTurn = isPlaying && room.turn === playerIndex;
  return (
    <Fragment>
      <GameStatus room={room} player={player} />
      <Board room={room} myTurn={myTurn} />
      <PlayerStatus room={room} player={player} />
      <RemoteUpdates room={room} />
      {/* <div class="bg-gray-700 p-3 rounded">
        <p>Room: {room.name}</p>
        <p>Player: {player}</p>
      </div> */}
    </Fragment>
  );
}

export const GET: Handler = (req, res) => {
  const room = rooms.find(({ name }) => name === req.params.room);
  if (room === undefined) {
    res.redirect("/");
  } else {
    const player = getPlayer(req, res);
    res.send((
      <CenteredLayout>
        <Connect4Room room={room} player={player} />
      </CenteredLayout>
    ));
  }
};