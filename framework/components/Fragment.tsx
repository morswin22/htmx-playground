import { Attributes } from "typed-html";

// TODO (feature) include this in the typed elements namespace

export function Fragment({ children }: Attributes) {
  if (typeof children === "object") {
    if (Array.isArray(children)) {
      return children.flat().join("\n");
    }
    return Object.values(children).join("\n");
  } else {
    console.info("Fragment children is not an object");
    console.info(typeof children);
    console.info(children);
    return children.toString();
  }
}