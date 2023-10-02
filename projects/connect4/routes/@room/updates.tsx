import { Handler, Response } from "express";
import { Board, Player, Room, getPlayer, rooms } from ".";
import * as elements from "typed-html";
import crypto from "crypto";

// TODO (bug) for some reason, when accessing from patrycy.ddns.net, through the nginx proxy, the event stream is either not found (after nginx timeout i suppose) or when it should receive an update, it gets empty data

const boardUpdateClients = new Map<string, Map<Player, Response>>();

export const updateClients = (room: Room, callback: (client: Response, player: Player) => void) => {
  const clients = boardUpdateClients.get(room.name);
  if (clients === undefined) return;
  for (const client of clients.values())
    callback(client, getPlayer(client.req, client));
};

export const GET: Handler = (req, res) => {
  const roomExists = rooms.find(({ name }) => name === req.params.room);
  if (roomExists === undefined) {
    res.status(404).end();
    return;
  }

  const headers = {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    "Connection": "keep-alive", 
  };

  res.writeHead(200, headers);

  const clientId = crypto.randomUUID();

  if (!boardUpdateClients.has(req.params.room)) {
    boardUpdateClients.set(req.params.room, new Map());
  }

  boardUpdateClients.get(req.params.room)!.set(clientId, res);

  req.on("close", () => {
    boardUpdateClients.get(req.params.room)!.delete(clientId);
    // TODO (feature) remove room if no clients and room is finished
  });
};