import { Handler } from "express";
import * as elements from "typed-html";
import { Room, rooms } from "./@room";
import fs from "fs";
import fetch from "sync-fetch";
import { merge } from "@fw/utils/tailwind";

const adjectivesUrl = "https://gist.githubusercontent.com/hugsy/8910dc78d208e40de42deb29e62df913/raw/eec99c5597a73f6a9240cab26965a8609fa0f6ea/english-adjectives.txt" as const;
const nounsUrl = "https://gist.githubusercontent.com/hugsy/8910dc78d208e40de42deb29e62df913/raw/eec99c5597a73f6a9240cab26965a8609fa0f6ea/english-nouns.txt" as const;

function getWords(type: "adjectives" | "nouns") {
  const path = `./dist/cached_${type}.txt` as const;
  if (fs.existsSync(path)) {
    return fs.readFileSync(path, "utf-8").split("\n");
  } else {
    const text = fetch(type === "adjectives" ? adjectivesUrl : nounsUrl).text().trim();
    fs.writeFileSync(path, text);
    return text.split("\n");
  }
}

const adjectives = getWords("adjectives");
const nouns = getWords("nouns");

export function uuidToName(uuid: string, separator = "-") {
  return [
    adjectives[parseInt(uuid.slice(0, 8), 16) % adjectives.length],
    nouns[parseInt(uuid.slice(-9, -1), 16) % nouns.length],
  ].join(separator);
}

function ShowState({ state }: { state: Room["state"] }) {
  switch (state) {
  case "waiting":
    return <i class="fa fa-hourglass-start" />;
  case "playing":
    return null;//<i class="fa fa-eye" />;
  case "finished":
    return <i class="fa fa-flag-checkered" />;
  }
}

function ListedRoom({ room }: { room: Room }) {
  return (
    <li class="relative flex justify-between items-center gap-2 w-full">
      {/* TODO (feature) add underline on peer hover */}
      <span class={merge("capitalize", room.state === "finished" && "line-through", room.state !== "waiting" && "text-gray-500")}>{uuidToName(room.name, " ")}</span> 
      <ShowState state={room.state} />
      <a href={`/${room.name}`} class="absolute inset-0" />
    </li>
  );
}

export const GET: Handler = (req, res) => {
  res.send((
    <ul id="rooms-list" hx-boost="true" class="w-full sm:w-96 p-3 m-3 border-2 border-purple-800 rounded flex flex-col gap-1">
      {rooms.length === 0 ? (
        <li class="text-center text-gray-500">No open rooms</li>
      ) : null}
      {[...rooms].sort((a, b) => {
        // sort by state and number of players
        if (a.state !== b.state) {
          if (a.state === "waiting") return -1;
          if (b.state === "waiting") return 1;
          if (a.state === "finished") return 1;
          if (b.state === "finished") return -1;
        }
        return b.players.length - a.players.length;
      }).map(room => ( // TODO (improvement) sort more efficiently
        <ListedRoom room={room} />
      ))}
    </ul>
  ));
};