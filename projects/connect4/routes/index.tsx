import { Fragment } from "@fw/components/Fragment";
import { merge } from "@fw/utils/tailwind";
import * as elements from "typed-html";

// TODO (idea) Do connect4 with settling animations and sse

const base = "bg-purple-800 hover:bg-purple-700 p-4 text-xl rounded select-none text-center cursor-pointer";

function JoinButton() {
  return <a class={merge(base, "col-span-2")} href="/join">Join</a>;
}

function ListButton() {
  return (
    // TODO (idea) make a list show as tooltip/dropdown
    <button
      class={base}
      hx-trigger="click"
      hx-target="#rooms-list"
      hx-get="/list"
      hx-swap="outerHTML"
    >
      List
    </button>
  );
}

function CreateButton() {
  return <a class={base} href="/create">Create</a>;
}

export default function Connect4Lobby() {
  return (
    <Fragment>
      <div class="grid grid-cols-2 gap-3" hx-boost="true">
        <JoinButton />
        <ListButton />
        <CreateButton />
      </div>
      <ul id="rooms-list" />
    </Fragment>
  );
}

// *** DEPRECATED ***

// // temporary
// type Player = string;

// const boardSize = 7;
// const playerColors = ["yellow", "blue"] as const;

// type Room = {
//   name: string;
//   players: [Player, Player] | [Player];
//   board: (0 | 1 | null)[][];
//   turn: 0 | 1;
// }

// const rooms: Room[] = [
//   // TODO (temp) remove
//   {
//     name: "375d76f6-80f4-4219-8774-15e17eb4be83",
//     players: ["83cd10a2-d048-4923-a736-393c9aab2f13"],
//     board: createBoard(),
//     turn: 0,
//   }
// ];

// function createBoard() {
//   return Array.from({ length: boardSize }, () => Array.from({ length: boardSize }, () => null));
// }

// // TODO (mistake) user should only select the column, not the cell (gravity exists)
// // TODO (feature) win detection
// // TODO (feature) game controls

// function Board({ room, myTurn }: { room: Room, myTurn: boolean }) {
//   return (
//     <div class={`bg-gray-700 p-3 rounded grid grid-cols-${boardSize} gap-2`} id="board">
//       {room.board.map((row, y) => row.map((cell, x) => (
//         <div class="w-16 h-16">
//           {cell === null ? (
//             myTurn ? (
//               <i
//                 class="fa fa-sold fa-circle fa-4x text-gray-800 cursor-pointer"
//                 hx-get={`/connect4/${room.name}/play/${x}/${y}`}
//                 hx-swap="outerHTML"
//                 hx-target="#board"
//               /> 
//             ) : (
//               <i class="fa fa-sold fa-circle fa-4x text-gray-800" /> 
//             )
//           ) : (
//             <i class={`fa fa-sold fa-circle fa-4x text-${playerColors[cell]}-500`} /> 
//           )}
//         </div>
//       ))).flat()}
//     </div>
//   );
// }

// function RemoteUpdates({ room }: { room: Room }) {
//   return (
//     <div hx-ext="sse" sse-connect={`/connect4/${room.name}/updates`} sse-swap="message" hx-target="#board" hx-swap="outerHTML" class="hidden" />
//   );
// }

// function Connect4Room({ room, player }: { room: Room, player: Player }) {
//   const isPlaying = room.players.includes(player);
//   const playerIndex = room.players.indexOf(player);
//   const playerColor = playerColors[playerIndex];
//   const myTurn = isPlaying && room.turn === playerIndex;
//   return (
//     <Fragment>
//       <Board room={room} myTurn={myTurn} />
//       <RemoteUpdates room={room} />
//       {/* <div class="bg-gray-700 p-3 rounded">
//         <p>Room: {room.name}</p>
//         <p>Player: {player}</p>
//       </div> */}
//       <div class="bg-gray-700 p-3 rounded mt-3">
//         {isPlaying ? (
//           <p>Your are <span class={`text-${playerColor}-500 capitalize font-semibold`}><i class="fa fa-sold fa-circle fa-sm" /> {playerColor}</span></p>
//         ) : (
//           <p>You are <span class="font-semibold">spectating</span></p>
//         )}
//       </div>
//     </Fragment>
//   );
// }

// function getPlayer(req: Request, res: Response) {
//   let player = req.signedCookies["connect4/player"] as ReturnType<typeof crypto.randomUUID>;
//   if (player === undefined) {
//     player = crypto.randomUUID();
//     res.cookie("connect4/player", player, { signed: true });
//   }
//   return player;
// }

// export function handle() {
//   const router = Router();
  
//   router.get("/list", (req, res) => {
//     res.send((
//       <ul id="rooms-list" hx-boost>
//         {rooms.map(room => (
//           <ListedRoom room={room} />
//         ))}
//       </ul>
//     ));
//   });

//   router.get("/join", (req, res) => {
//     const hasRoom = rooms.find(room => room.players.includes(getPlayer(req, res)));
//     if (hasRoom) {
//       res.redirect(`/connect4/${hasRoom.name}`);
//     } else {
//       let bestRoom: Room | undefined = rooms[0];
//       for (const room of rooms) {
//         if (room.players.length > bestRoom.players.length && room.players.length < 2) {
//           bestRoom = room;
//         }
//       }
//       if (bestRoom === undefined) {
//         res.redirect("/connect4/create");
//       } else {
//         bestRoom.players.push(getPlayer(req, res));
//         res.redirect(`/connect4/${bestRoom.name}`);
//       }
//     }
//     // const url = "/connect4/room325";
//     // res.header("HX-Redirect", url); // TODO (bug) does not work
//     // res.redirect(url);
//     // res.setHeader("HX-Redirect", "/connect4/room325");
//     // res.send("");
//   });

//   router.get("/create", (req, res) => {
//     const name = crypto.randomUUID();
//     rooms.push({
//       name,
//       players: [getPlayer(req, res)],
//       board: createBoard(),
//       turn: 0,
//     });
//     res.redirect(`/connect4/${name}`);
//   });

//   router.get("/:room", (req, res) => {
//     const room = rooms.find(({ name }) => name === req.params.room);
//     if (room === undefined) {
//       res.redirect("/connect4");
//     } else {
//       const player = getPlayer(req, res);
//       res.send((
//         <CenteredLayout>
//           <Connect4Room room={room} player={player} />
//         </CenteredLayout>
//       ));
//     }
//   });

//   const boardUpdateClients = new Map<string, Map<string, Response>>();

//   const updateClients = (room: Room) => {
//     const clients = boardUpdateClients.get(room.name);
//     if (clients === undefined) return;
//     for (const client of clients.values()) {
//       const player = getPlayer(client.req, client);
//       const wasTurn = room.players.includes(player) && room.turn !== room.players.indexOf(player);
//       if (!wasTurn) {
//         const board = <Board room={room} myTurn={room.players.includes(player) && room.turn === room.players.indexOf(player)} />;
//         client.write(`data: ${board.replace(/\n/g, "")}\n\n`);
//       }
//     }
//   };

//   router.get("/:room/updates", (req, res) => {
//     const roomExists = rooms.find(({ name }) => name === req.params.room);
//     if (roomExists === undefined) {
//       res.status(404).end();
//       return;
//     }

//     const headers = {
//       "Content-Type": "text/event-stream",
//       "Cache-Control": "no-cache",
//       "Connection": "keep-alive", 
//     };

//     res.writeHead(200, headers);

//     const clientId = crypto.randomUUID();

//     if (!boardUpdateClients.has(req.params.room)) {
//       boardUpdateClients.set(req.params.room, new Map());
//     }

//     boardUpdateClients.get(req.params.room)!.set(clientId, res);

//     req.on("close", () => {
//       boardUpdateClients.get(req.params.room)!.delete(clientId);
//     });
//   });

//   router.get("/:room/play/:x/:y", (req, res) => {
//     const room = rooms.find(({ name }) => name === req.params.room);
//     if (room === undefined) {
//       res.status(404).end();
//       return;
//     }

//     const player = getPlayer(req, res);
//     if (!room.players.includes(player)) {
//       res.status(403).end();
//       return;
//     }

//     if (room.turn !== room.players.indexOf(player)) {
//       res.status(403).end();
//       return;
//     }

//     const x = parseInt(req.params.x);
//     const y = parseInt(req.params.y);

//     if (isNaN(x) || isNaN(y)) {
//       res.status(400).end();
//       return;
//     }

//     if (x < 0 || x >= boardSize || y < 0 || y >= boardSize) {
//       res.status(400).end();
//       return;
//     }

//     if (room.board[y][x] !== null) {
//       res.status(400).end();
//       return;
//     }
    
//     room.board[y][x] = room.turn;
//     room.turn = ((room.turn + 1) % 2) as Room["turn"];

//     updateClients(room);

//     res.send((
//       <Board room={room} myTurn={false} />
//     ));
//   });

//   return router;
// }