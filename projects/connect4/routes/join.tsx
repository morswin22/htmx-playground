import { Handler } from "express";
import { rooms, Room, getPlayer, joinRoom } from "./@room";

export const GET: Handler = (req, res) => {
  const hasRoom = rooms.find(room => room.players.includes(getPlayer(req, res)));
  if (hasRoom && hasRoom.state !== "finished") {
    res.redirect(`/${hasRoom.name}`);
  } else {
    let bestRoom: Room | undefined = undefined;
    for (const room of rooms) {
      if (room.state === "waiting" && (bestRoom === undefined || room.players.length > bestRoom.players.length)) {
        bestRoom = room;
        if (bestRoom.players.length === 1) break; // there is no better room
      }
    }
    if (bestRoom === undefined) {
      res.redirect("/create");
    } else {
      joinRoom(bestRoom, getPlayer(req, res));
      res.redirect(`/${bestRoom.name}`);
    }
  }
};