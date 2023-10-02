import { Handler } from "express";
import { rooms, Room, getPlayer, joinRoom } from ".";

export const GET: Handler = (req, res) => {
  // room exists?
  const room = rooms.find(({ name }) => name === req.params.room);
  if (room === undefined) {
    res.status(404).end();
    return;
  }

  // room is waiting?
  if (room.state !== "waiting") {
    res.status(403).end();
    return;
  }

  // player is in room?
  const player = getPlayer(req, res);
  if (room.players.includes(player)) {
    res.status(403).end();
    return;
  }

  // add player to room
  joinRoom(room, player);

  res.redirect(`/${room.name}`);
};