import { Handler } from "express";
import { createRoom, getPlayer } from "./@room";

export const GET: Handler = (req, res) => {
  const player = getPlayer(req, res);
  const name = createRoom(player);
  res.redirect(`/${name}`);
};