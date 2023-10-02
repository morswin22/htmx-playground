import * as elements from "typed-html";
import crypto from "crypto";
import winston from "winston";
import { Response, Request, Router } from "express";

export function LiveReload() {
  if (process.env.NODE_ENV === "production")
    return null;
  return (
    <div hx-ext="sse" sse-connect="/live-reload" sse-swap="message" class="hidden">
      Connecting...
    </div>
  );
}

export function handleLiveReload() {
  const logger = winston.createLogger({
    transports: [
      new winston.transports.Console()
    ],
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.printf((info) => `${info.level}: [sse] ${info.message}`)
    ),
  });

  const clients: { clientId: string, res: Response }[] = [];

  const router = Router();

  router.get("/live-reload", (req: Request, res: Response) => {
    const headers = {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive", 
    };

    res.writeHead(200, headers);

    const clientId = crypto.randomUUID();
    logger.info(`${clientId} Connection opened`);

    res.write(`data: Connected as ${clientId}\n\n`);

    clients.push({ clientId, res });

    req.on("close", () => {
      logger.info(`${clientId} Connection closed`);
      clients.splice(clients.findIndex(client => client.clientId === clientId), 1);
    });
  });

  process.on("SIGINT", () => {
    logger.info("Sending reload signal to clients");
    const responses = clients.map(client => 
      new Promise<void>(res => client.res.end("data: <script>window.location.reload()</script>\n\n", () => res()))
    );
    Promise.allSettled(responses).then(() => {
      logger.info("All clients notified, exiting");
      process.exit(0);
    });
  });

  return router;
}