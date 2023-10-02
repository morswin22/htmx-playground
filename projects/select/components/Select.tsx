import { Router } from "express";
import * as elements from "typed-html";
import { Fragment } from "@fw/components/Fragment";
import { createContext } from "@fw/utils/context";

// TODO (feature) Add "search" option to select
// TODO (feature) Add "create new" option to select

// TODO (idea) Select may as well use https://htmx.org/attributes/hx-vals/ to store options and selected values, maybe all the state

type SelectProps = {
  options: { key: number, value: string }[];
  selected: number[];
  isOptionsOpen: "open" | "close";
  prompt: string;
  name: string | null;
}

const [pushSelectContext/*, PopSelectContext*/, useSelectContext] = createContext<SelectProps>();

function serializeOptions(options: SelectProps["options"]) {
  return options.length > 0 ? options.map(({ key, value }) => `${key}:${value}`).join(",") : "none";
}

function deserializeOptions(options: string) {
  return options === "none" ? [] : options.split(",").map((option) => {
    const [key, value] = option.split(":");
    return { key: parseInt(key), value };
  });
}

function serializeSelected(selected: SelectProps["selected"]) {
  return selected.length > 0 ? selected.join(",") : "none";
}

function deserializeSelected(selected: string) {
  return selected === "none" ? [] : selected.split(",").map((selected) => parseInt(selected));
}

// serialization of isOptionsOpen is a noop

function deserializeIsOptionsOpen(isOptionsOpen: string) {
  return isOptionsOpen === "open" ? "open" : "close";
}

// TODO (idea) maybe a small serialize/deserialize helper lib would be nice

function serializeNullish<T>(value: T | null) {
  return value === null ? "null" : value;
}

function deserializeNullish<T>(value: string, transform: (value: string) => T = (value) => value as T) {
  return value === "null" ? null : transform(value);
}

function buildSelectUrl(changed: Partial<SelectProps>) {
  const { options, selected, isOptionsOpen, prompt, name } = { ...useSelectContext(), ...changed };
  return `/select/${serializeOptions(options)}/${serializeSelected(selected)}/${isOptionsOpen}/${prompt}/${serializeNullish(name)}`;
}

function SelectWrapper({ children }: elements.Attributes) {
  return (
    <div class="selectWrapper relative inline-block text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 py-2 border border-gray-100 dark:border-gray-700 rounded w-full sm:w-96">
      {children}
    </div>
  );
}

function SelectedOptions() {
  const { options, selected, prompt } = useSelectContext();
  return (
    <div class="flex gap-2">
      {options.filter(({ key }) => selected.includes(key)).map(({ key, value }) => (
        // TODO (bug) intercept click on the outer span, do not propagate
        <span class="bg-pink-400 text-gray-800 font-semibold px-1 rounded inline-flex gap-1 items-center cursor-auto">
          <span class="truncate">{value}</span>
          <i 
            class="fa fa-times cursor-pointer"
            hx-get={buildSelectUrl({selected: selected.filter((selectedKey) => selectedKey !== key)})}
            hx-trigger="click consume"
            hx-target="closest .selectWrapper"
            hx-swap="outerHTML"
            // hx-confirm="Are you sure?"
          />
        </span>
      ))}
      {selected.length > 0 ? null : (
        <span class="text-gray-600 dark:text-gray-400">{prompt}</span>
      )}
    </div>
  );
}

function SelectHeader() {
  const { isOptionsOpen } = useSelectContext();
  return (
    <div
      class="flex justify-between items-center gap-2 px-3 cursor-pointer"
      hx-get={buildSelectUrl({isOptionsOpen: isOptionsOpen === "open" ? "close" : "open"})}
      hx-trigger="click"
      hx-target="closest .selectWrapper"
      hx-swap="outerHTML"
    >
      <SelectedOptions />
      <i class={`fa fa-chevron-${isOptionsOpen === "open" ? "up" : "down"}`}/>
    </div>
  );
}

function SelectOptions() {
  const { options, selected, isOptionsOpen } = useSelectContext();
  if (isOptionsOpen === "close")
    return null;
  return (
    <Fragment>
      {options.filter(({ key }) => !selected.includes(key)).map(({ value, key }) => (
        <div
          class="hover:bg-gray-200 dark:hover:bg-gray-700 px-3 cursor-pointer mt-2"
          hx-get={buildSelectUrl({selected: [...selected, key]})}
          hx-trigger="click"
          hx-target="closest .selectWrapper"
          hx-swap="outerHTML"
        >
          {value}
        </div>
      ))}
    </Fragment>
  );
}

function SelectOutput() {
  const { name, selected, options } = useSelectContext();
  if (name === null)
    return null;
  return (
    <input
      type="hidden"
      name={name}
      value={serializeOptions(options.filter(({ key }) => selected.includes(key)))}
    />
  );
}

// TODO (refactor) try to not rerender SelectWrapper, maybe have a "_isWrapped = false" prop?
export function Select({ options = [], selected = [], isOptionsOpen = "close", prompt = "Select", name = null }: Partial<SelectProps>) {
  pushSelectContext({ options, selected, isOptionsOpen, prompt, name });
  return (
    // <PopSelectContext>
    <SelectWrapper>
      <SelectHeader />
      <SelectOptions />
      <SelectOutput />
    </SelectWrapper>
    // </PopSelectContext>
  );
}

export function handleSelect() {
  const router = Router();

  // TODO (idea) might as well use hx-vals for this
  router.get("/select/:options/:selected/:isOptionsOpen/:prompt/:name", (req, res) => {
    res.send((
      <Select
        options={deserializeOptions(req.params.options)}
        selected={deserializeSelected(req.params.selected)}
        isOptionsOpen={deserializeIsOptionsOpen(req.params.isOptionsOpen)}
        prompt={req.params.prompt}
        name={deserializeNullish(req.params.name)}
      />
    ));
  });

  return router;
}

// ** something is wrong
// import { Router } from "express";
// import * as elements from "typed-html";
// import { Fragment } from "./Fragment";

// // TODO (feature) Add "prompt" option to select (like "Select a value")
// // TODO (feature) Add name to select so that it can work in forms
// // TODO (feature) Add "search" option to select
// // TODO (feature) Add "create new" option to select

// // TODO (idea) Select may as well use https://htmx.org/attributes/hx-vals/ to store options and selected values, maybe all the state

// type SelectData = {
//   options: { key: number, value: string }[];
//   selected: number[];
//   isOptionsOpen: "open" | "close";
//   prompt: string | null;
// }

// export type SelectProps = Partial<SelectData>;

// function serializeOptions(options: SelectData["options"]) {
//   return options.length > 0 ? options.map(({ key, value }) => `${key}:${value}`).join(",") : "none";
// }

// function deserializeOptions(options: string) {
//   return options === "none" ? [] : options.split(",").map((option) => {
//     const [key, value] = option.split(":");
//     return { key: parseInt(key), value };
//   });
// }

// function serializeSelected(selected: SelectData["selected"]) {
//   return selected.length > 0 ? selected.join(",") : "none";
// }

// function deserializeSelected(selected: string) {
//   return selected === "none" ? [] : selected.split(",").map((selected) => parseInt(selected));
// }

// // serialization of isOptionsOpen is a noop

// function deserializeIsOptionsOpen(isOptionsOpen: string) {
//   return isOptionsOpen === "open" ? "open" : "close";
// }

// function serializePrompt(prompt: SelectData["prompt"]) {
//   return prompt === null ? "null" : prompt;
// }

// function deserializePrompt(prompt: string) {
//   return prompt === "null" ? null : prompt;
// }

// function buildSelectUrl(data: SelectData) {
//   return `/select/${serializeOptions(data.options)}/${serializeSelected(data.selected)}/${data.isOptionsOpen}`;
// }

// function buildVals(data: SelectData) {
//   return JSON.stringify({
//     options: serializeOptions(data.options),
//     selected: serializeSelected(data.selected),
//     isOptionsOpen: data.isOptionsOpen,
//     prompt: serializePrompt(data.prompt)
//   });
// }

// function SelectedOptions(data: SelectData) {
//   return (
//     <div class="flex gap-2">
//       {data.options.filter(({ key }) => data.selected.includes(key)).map(({ key, value }) => (
//         // TODO (bug) intercept click on the outer span, do not propagate
//         <span class="bg-pink-400 text-gray-800 font-semibold px-1 rounded inline-flex gap-1 items-center cursor-auto">
//           <span class="truncate">{value}</span>
//           <i 
//             class="fa fa-times cursor-pointer"
//             hx-post={buildSelectUrl({ ...data, selected: data.selected.filter((selectedKey) => selectedKey !== key) })}
//             hx-trigger="click consume"
//             hx-target="closest .selectWrapper"
//             hx-swap="outerHTML"
//             // hx-confirm="Are you sure?"
//           />
//         </span>
//       ))}
//       {data.prompt ? (
//         <span class={`${data.selected.length > 0 ? "hidden" : "text-gray-600 dark:text-gray-400"}`}>{data.prompt}</span>
//       ) : null}
//     </div>
//   );
// }

// function SelectHeader(data: SelectData) {
//   return (
//     <div
//       class="flex justify-between items-center gap-2 px-3 cursor-pointer"
//       hx-post={buildSelectUrl({ ...data, isOptionsOpen: data.isOptionsOpen === "open" ? "close" : "open" })}
//       hx-trigger="click"
//       hx-target="closest .selectWrapper"
//       hx-swap="outerHTML"
//     >
//       <SelectedOptions {...data} />
//       <i class={`fa fa-chevron-${data.isOptionsOpen === "open" ? "up" : "down"}`}/>
//     </div>
//   );
// }

// function SelectOptions(data: SelectData) {
//   if (data.isOptionsOpen === "close")
//     return null;
//   return (
//     <Fragment>
//       {data.options.filter(({ key }) => !data.selected.includes(key)).map(({ value, key }) => (
//         <div
//           class="hover:bg-gray-200 dark:hover:bg-gray-700 px-3 cursor-pointer mt-2"
//           hx-post={buildSelectUrl({ ...data, selected: [...data.selected, key] })}
//           hx-trigger="click"
//           hx-target="closest .selectWrapper"
//           hx-swap="outerHTML"
//         >
//           {value}
//         </div>
//       ))}
//     </Fragment>
//   );
// }

// const defaultData: SelectData = {
//   options: [],
//   selected: [],
//   isOptionsOpen: "close",
//   prompt: "Select"
// };

// // TODO (refactor) try to not rerender SelectWrapper, maybe have a "_isWrapped = false" prop?
// export function Select(props: SelectProps) {
//   const data = { ...defaultData, ...props };
//   return (
//     <div
//       class="selectWrapper relative inline-block text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 py-2 border border-gray-100 dark:border-gray-700 rounded w-full sm:w-96"
//       hx-vals={buildVals(data)}
//     >
//       <SelectHeader {...data} />
//       <SelectOptions {...data} />
//     </div>
//   );
// }

// export function handleSelect() {
//   const router = Router();

//   // TODO (idea) might as well use hx-vals for this
//   router.post("/select/:options/:selected/:isOptionsOpen", (req, res) => {
//     res.send((
//       <Select
//         options={deserializeOptions(req.body.options)}
//         selected={deserializeSelected(req.body.selected)}
//         isOptionsOpen={deserializeIsOptionsOpen(req.body.isOptionsOpen)}
//         prompt={deserializePrompt(req.body.prompt)}
//       />
//     ));
//   });

//   return router;
// }

// *** CODE BELOW IS DEPRECATED ***

// const STORED_OPTIONS = [{key: 0, value: "React Sucks"}, {key: 1, value: "htmx is great"}];
// const SELECTED_OPTIONS = [0]; // where to store this? in like a session? express session? global state? maybe global state for now
// // i think this just belongs to user's session, so express session

// // Maybe give out ids (or names) to selects, then have something like
// // app.get("/select/:name", (req, res) => { // Default, closed
// // app.get("/select/:name/options", (req, res) => { // Open
// // app.post("/select/:name/select/:key", (req, res) => { // Perform selection, return open
// // app.delete("/select/:name/deselect/:key", (req, res) => { // Perform deselection, return closed

// // try to not rerender SelectWrapper
// // try to not use id=SelectWrapper, but maybe id=SelectWrapper-{id/name}

// // probably if no name was given, generate uuid() and use that as name 

// function SelectWrapper({ children }: elements.Attributes) {
//   return (
//     <div
//       class="relative inline-block text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 py-2 border border-gray-100 dark:border-gray-700 rounded w-96"
//       id="selectWrapper"
//     >
//       {children}
//     </div>
//   );
// }

// function SelectedOption({ key, value }: { key: number, value: string }) {
//   return (
//     <span
//       class="bg-pink-400 text-gray-800 font-semibold px-1 rounded inline-flex gap-1 items-center"
//     >
//       <span class="truncate">{value}</span>
//       <i 
//         class="fa fa-times cursor-pointer"
//         hx-delete={`/select-remove/${key}`}
//         hx-trigger="click consume"
//         hx-target="#selectWrapper"
//         hx-swap="outerHTML"
//         // hx-confirm="Are you sure?"
//       />
//     </span>
//   );
// }

// function SelectedOptions() {
//   return (
//     <div class="flex gap-2">
//       {SELECTED_OPTIONS.map((selectedKey) => (
//         <SelectedOption key={selectedKey} value={STORED_OPTIONS.find(({ key }) => key === selectedKey).value} />
//       ))}
//     </div>
//   );
// }

// export function removeSelectedOption(key: number) {
//   SELECTED_OPTIONS.splice(SELECTED_OPTIONS.indexOf(key), 1);
// }

// export function addSelectedOption(key: number) {
//   if (SELECTED_OPTIONS.includes(key))
//     return;
//   SELECTED_OPTIONS.push(key);
// }

// // in similar fashion, i could add inserting new options, sync with db is practically already here

// export function Select() {
//   return (
//     <SelectWrapper>
//       <div
//         class="flex justify-between items-center gap-2 px-3"
//         hx-get="/select-options"
//         hx-trigger="click"
//         hx-target="#selectWrapper"
//         hx-swap="outerHTML"
//       >
//         <SelectedOptions/>
//         <span>Select</span>
//         <i class="fa fa-chevron-down"/>
//       </div>
//     </SelectWrapper>
//   );
// }

// export function SelectOptions() {
//   return (
//     <SelectWrapper>
//       <div
//         class="flex justify-between items-center gap-2 px-3"
//         hx-get="/select"
//         hx-trigger="click"
//         hx-target="#selectWrapper"
//         hx-swap="outerHTML"
//       >
//         <SelectedOptions/>
//         <span>Select</span>
//         <i class="fa fa-chevron-up"/>
//       </div>
//       <div id="selectOptions">
//         {STORED_OPTIONS.filter(({ key }) => !SELECTED_OPTIONS.includes(key)).map(({ value, key }) => (
//           <div
//             class="hover:bg-gray-200 dark:hover:bg-gray-700 px-3 cursor-pointer mt-2"
//             hx-post={`/select-add/${key}`}
//             hx-trigger="click"
//             hx-target="#selectWrapper"
//             hx-swap="outerHTML"
//           >
//             {value}
//           </div>
//         ))}
//       </div>
//     </SelectWrapper>
//   );
// }

// export function handleSelect() {
//   const router = Router();

//   router.get("/select", (req, res) => {
//     res.send((
//       <Select />
//     ));
//   });

//   router.get("/select-options", (req, res) => {
//     res.send((
//       <SelectOptions />
//     ));
//   });

//   router.post("/select-add/:key", (req, res) => {
//     const key = parseInt(req.params.key);
//     addSelectedOption(key);
//     res.send((
//       <SelectOptions />
//     ));
//   });

//   router.delete("/select-remove/:key", (req, res) => {
//     const key = parseInt(req.params.key);
//     removeSelectedOption(key);
//     res.send((
//       <Select />
//     ));
//   });

//   return router;
// }