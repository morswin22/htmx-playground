import { Router } from "express";
import * as elements from "typed-html";

export function IncrementingButton({ value = 0 }: { value?: number }) {
  return (
    <button
      hx-post={`/increment/${value}`}
      hx-swap="outerHTML"
      hx-target="this"
      class="bg-blue-400 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded"
    >
      Increment {value}
    </button>
  );
}

export function handleIncrementingButton() {
  const router = Router();

  router.post("/increment/:value", (req, res) => {
    const value = parseInt(req.params.value) + 1;
    res.send((
      <IncrementingButton value={value} />
    ));
  });

  return router;
}
