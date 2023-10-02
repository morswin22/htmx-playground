import { Router } from "express";
import * as elements from "typed-html";
import fs from "fs";

export function Tailwind() {
  return process.env.NODE_ENV === "production" ? (
    // TODO (rework) rework this in the context of the new monorepo structure
    <link href="/styles.css" rel="stylesheet" />
  ) : (
    <script src="https://cdn.tailwindcss.com" />
  );
}

export function handleTailwind() {
  const router = Router();

  if (!fs.existsSync("./dist/styles.css"))
    throw new Error("Build Tailwind before running the server");
  
  const compiled = fs.readFileSync("./dist/styles.css", "utf-8");

  router.get("/styles.css", (req, res) => {
    res.setHeader("Content-Type", "text/css");
    res.send(compiled);
  });

  return router;
}