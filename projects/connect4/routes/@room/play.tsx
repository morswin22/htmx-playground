import { Router } from "express";
import { updateClients } from "./updates";
import { rooms, boardSize, Room, Board, getPlayer, Connect4Room } from ".";
import * as elements from "typed-html";
import CenteredLayout from "@fw/layouts/centered";

export function handle() {
  const router = Router({ mergeParams: true }); // TODO (idea) this might be needed to set to all the routes

  router.get("/:column", (req, res) => {
    // does room exist?
    const room = rooms.find(({ name }) => name === (req.params as unknown as { room: string }).room); // TODO (fix) fix this because we know that the base route is /connect4/:room/play
    if (room === undefined) {
      res.status(404).end();
      return;
    }

    // is room playing?
    if (room.state !== "playing") {
      res.status(403).end();
      return;
    }

    // is player in room?
    const player = getPlayer(req, res);
    if (!room.players.includes(player)) {
      res.status(403).end();
      return;
    }

    // is it player's turn?
    if (room.turn !== room.players.indexOf(player)) {
      res.status(403).end();
      return;
    }

    const column = parseInt(req.params.column);

    // is column valid?
    if (isNaN(column)) {
      res.status(400).end();
      return;
    }

    if (column < 0 || column >= boardSize) {
      res.status(400).end();
      return;
    }

    // get first empty row
    let y = boardSize - 1;
    while (y >= 0 && room.board[y][column] !== null) {
      y--;
    }

    // is column full?
    if (y < 0) {
      res.status(400).end();
      return;
    }

    room.board[y][column] = room.turn;

    room.turn = ((room.turn + 1) % 2) as Room["turn"];

    // check for win
    const checkWin = (x: number, y: number, dx: number, dy: number) => {
      const player = room.board[y][x];
      if (player === null) return false;
      for (let i = 1; i < 4; i++)
        if (room.board[y + dy * i]?.[x + dx * i] !== player)
          return false;
      return true;
    };

    const checkWinAll = (x: number, y: number) => {
      return checkWin(x, y, 1, 0) || checkWin(x, y, 0, 1) || checkWin(x, y, 1, 1) || checkWin(x, y, 1, -1);
    };

    for (let x = 0; x < boardSize; x++)
      for (let y = 0; y < boardSize; y++)
        if (checkWinAll(x, y)) {
          room.state = "finished";
          room.winner = room.board[y][x];
          room.stats[room.winner]++;
        }

    // check for draw
    if (room.state !== "finished") {
      let draw = true;
      for (let x = 0; x < boardSize; x++)
        if (room.board[0][x] === null) {
          draw = false;
          break;
        }
      if (draw) {
        room.state = "finished";
        room.winner = null;
      }
    }

    // TODO (improvement) i think i could give ids to every cell and only send the oob="outerHTML:#cell-id" to the clients / as response

    updateClients(room, (client, player) => {
      if (room.turn === room.players.indexOf(player) || !room.players.includes(player)) { // TODO (bug) because of this, we don't need to send the board to the player's other clients
        if (room.state === "playing") {
          const board = <Board room={room} myTurn={room.players.includes(player) && room.turn === room.players.indexOf(player)} />;
          client.write(`event: board\ndata: ${board.replace(/\n/g, "")}\n\n`);
        } else if (room.state === "finished") {
          client.write(`event: room\ndata: ${(<Connect4Room room={room} player={player} />).replace(/\n/g, "")}\n\n`);
        }
      }
    });

    if (room.state === "playing") {
      res.send((
        <Board room={room} myTurn={false} />
      ));
    } else if (room.state === "finished") {
      res.send((
        <CenteredLayout hx-swap-oob="outerHTML:main">
          <Connect4Room room={room} player={player} />
        </CenteredLayout>
      ));
      // TODO (improvement) why does this not work?
      // res.send((
      //   <div hx-swap-oob="innerHTML:main">
      //     <Connect4Room room={room} player={player} />
      //   </div>
      // ));
    }
  });

  return router;
}