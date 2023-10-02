// TODO (idea) to support nested contexts, we could use a stack of contexts inside of createContext

// This works when not using nested contexts
export function createContext<T>() {
  let data: T | undefined = undefined;

  return [
    function set(newData: T) {
      data = newData;
    },
    function get(): T {
      if (data === undefined)
        throw new Error("Context not set");

      return data;
    }
  ] as const;
}

// TODO (feature) export function createNestedContext<T>() {...}

// import { Fragment } from "@/components/Fragment";
// import * as elements from "typed-html";

// let lastContextId = 0;
// const contexts: Context[] = [];

// export function createContext<T>() {
//   const id = lastContextId++;

//   return [
//     function pushContext(data: T) {
//       contexts.push({ id, data });
//     },
//     function PopContext({ children }: elements.Attributes) {
//       if (id !== contexts.pop().id)
//         throw new Error("Contexts were not closed in the correct order");
//       return (
//         <Fragment>
//           {children}
//         </Fragment>
//       );
//     },
//     function useContext(): T {
//       for (let i = contexts.length - 1; i >= 0; i--) {
//         if (contexts[i].id === id) {
//           return contexts[i].data as T;
//         }
//       }

//       throw new Error(`Context ${id} not found`);
//     }
//   ] as const;
// }

// export function validateContextsBegin() {
//   const currentNumContexts = contexts.length;
//   return function validateContextsEnd() {
//     if (contexts.length !== currentNumContexts) {
//       throw new Error("Contexts were not properly closed");
//     }
//   };
// }