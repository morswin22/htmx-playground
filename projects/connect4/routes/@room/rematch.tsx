import { Handler } from "express";
import { Connect4Room, createBoard, getPlayer, rooms } from ".";
import { updateClients } from "./updates";
import * as elements from "typed-html";

export const GET: Handler = (req, res) => {
  // does room exist?
  const room = rooms.find(({ name }) => name === (req.params as unknown as { room: string }).room); // TODO (fix) fix this because we know that the base route is /connect4/:room/play
  if (room === undefined) {
    res.status(404).end();
    return;
  }

  // is room finished?
  if (room.state !== "finished") {
    res.status(403).end();
    return;
  }

  // is player in room?
  const player = getPlayer(req, res);
  if (!room.players.includes(player)) {
    res.status(403).end();
    return;
  }

  room.rematchConfirmations[room.players.indexOf(player)] = true;

  if (room.rematchConfirmations.every(Boolean)) {
    room.state = "playing";
    room.rematchConfirmations = [false, false];
    room.board = createBoard();
    room.turn = 0;
    room.players.reverse();
    room.stats.reverse();
    room.winner = null;
  }

  updateClients(room, (client, other) => {
    if (other === player) return;
    const res = <Connect4Room room={room} player={other} />;
    client.write(`event: room\ndata: ${res.replace(/\n/g, "")}\n\n`);
  });

  res.send((
    <Connect4Room room={room} player={player} />
  ));
};