import * as elements from "typed-html";
import { Router, Handler, Request } from "express";
import BaseLayout from "@fw/layouts/base";
import fs from "fs";
import { getCaller } from "./utils/stack";
import pathModule from "path";
// import { validateContextsBegin } from "./utils/context";

// TODO (feature) support for async routes (Layout, Page, getParams)

type RendererConfig = {
  indexName: string;
  paramsSymbol: string;
  FallbackLayout: ({ children }: elements.Attributes) => string;
}

type Module = {
  getParams?: (req: Request) => unknown;
  default?: (params: unknown) => string;
  Layout?: ({ children }: elements.Attributes) => string;
  GET?: Handler;
  HEAD?: Handler;
  POST?: Handler;
  PUT?: Handler;
  DELETE?: Handler;
  CONNECT?: Handler;
  OPTIONS?: Handler;
  TRACE?: Handler;
  PATCH?: Handler;
  handle?: () => Router;
}

export function handleRoutes(partialConfig: Partial<RendererConfig>) {
  const config: RendererConfig = {
    indexName: "index",
    paramsSymbol: "@", // ":" is not allowed in filenames
    FallbackLayout: BaseLayout,
    ...partialConfig,
  };

  const router = Router();

  const projectName = pathModule.basename(pathModule.dirname(getCaller().getFileName()));
  const distRoutesPath = pathModule.join(__dirname, "../projects", projectName, "routes");
  const sourceRoutesPath = pathModule.join(__dirname, "../../projects", projectName, "routes");

  const routes = readTreeSync(sourceRoutesPath)
    .filter((file) => file.endsWith(".tsx")) // only .tsx files
    .map((file) => file.slice(0, -4)) // remove .tsx extension
    .sort((a, b) => {
      const aIsParams = a.includes(config.paramsSymbol);
      const bIsParams = b.includes(config.paramsSymbol);
      const aIsIndex = a.endsWith(config.indexName);
      const bIsIndex = b.endsWith(config.indexName);

      if (aIsParams && bIsParams)
        return 0;

      if (aIsParams)
        return 1;

      if (bIsParams)
        return -1;

      if (aIsIndex && bIsIndex)
        return 0;

      if (aIsIndex)
        return -1;

      if (bIsIndex)
        return 1;

      return 0;
    }); // move index files to the top and params files to the bottom

  for (const path of routes) {
    const route = ("/" + (path.split("/").pop() === config.indexName ? path.slice(0, -config.indexName.length) : path)).replace(new RegExp(config.paramsSymbol, "g"), ":");

    const distPath = pathModule.join(distRoutesPath, `${path}.js`);

    if (!fs.existsSync(distPath))
      throw new Error(`Route ${route} is not transpiled`);

    const module = import(distPath) as Promise<Module>;

    // WARNING: this implementation makes it so the order of app.use is not respected (.then callback is called asynchronously)
    module.then((module) => {
      if (module.default) {
        const layout = module.Layout || config.FallbackLayout;
        const page = module.default;
        const getParams = module.getParams || (() => undefined);
        router.get(route, (req, res) => {
          // const validateContextsEnd = validateContextsBegin();
          res.send(layout({ children: page(getParams(req)) }));
          // validateContextsEnd();
        });
      } else if (module.GET) {
        router.get(route, module.GET);
      }

      if (module.HEAD)
        router.head(route, module.HEAD);

      if (module.POST)
        router.post(route, module.POST);

      if (module.PUT)
        router.put(route, module.PUT);

      if (module.DELETE)
        router.delete(route, module.DELETE);

      if (module.CONNECT)
        router.connect(route, module.CONNECT);

      if (module.OPTIONS)
        router.options(route, module.OPTIONS);

      if (module.TRACE)
        router.trace(route, module.TRACE);

      if (module.PATCH)
        router.patch(route, module.PATCH);

      if (module.handle) {
        router.use(route, module.handle());
        console.log(`[render] ${route} has custom router handler`);
      }
    });
  }

  return router;
}

// *** Helper ***

function readTreeSync(path: string, accumulated: string[] = [], prefix: string = ""): string[] {
  const everything = fs.readdirSync(path);
  const directories = everything.filter((file) => fs.lstatSync(path + "/" + file).isDirectory());
  const files = everything.filter((file) => !directories.includes(file)).map((file) => prefix + file);

  accumulated.push(...files);

  for (const directory of directories) {
    readTreeSync(path + "/" + directory, accumulated, prefix + directory + "/");
  }

  return accumulated;
}