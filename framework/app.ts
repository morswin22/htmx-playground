import express from "express";
import { handleLiveReload } from "@fw/components/LiveReload";
import { errorLogger, routeLogger } from "@fw/logger";
import { handleTailwind } from "@fw/components/Tailwind";
import cookieParser from "cookie-parser";

type AppConfig = {
  port: number;
}

type App = {
  start: (routers?: express.Router[]) => void;
  stop: () => void;
}

export async function createApp(partialConfig?: Partial<AppConfig>): Promise<App> {
  const config: AppConfig = {
    port: 3000,
    ...partialConfig
  };

  const app = express();
  let server: ReturnType<typeof app.listen>;
  const port = config.port;

  app.use(cookieParser("secret")); // TODO (feature) use env var
  // app.use(express.json());
  // app.use(express.urlencoded());

  const start = (routers: express.Router[] = []) => {
    if (process.env.NODE_ENV !== "production") {
      app.use(handleLiveReload());
    }

    app.use(routeLogger);

    if (process.env.NODE_ENV === "production") {
      app.use(handleTailwind());
    }

    for (const router of routers) {
      app.use(router);
    }

    app.use(errorLogger);

    server = app.listen(port, () => {
      return console.log(`🚀 Express is listening at http://localhost:${port}`);
    });
  };

  const stop = () => {
    server.close();
  };

  return {
    start,
    stop,
  };
}

// Example usage
// createApp().then((app) => {
//   initModels(db);

//   const router = express.Router();
//   router.use("/static", express.static(path.resolve(__dirname, "..", "static")));

//   app.start([
//     router,
//     handleRoutes({
//       // indexName: "home",
//       FallbackLayout: CenteredLayout,
//     }),
//     handleSelect(),
//     handleCalendar(),
//     handleIncrementingButton(),
//   ]);
// });
