import * as elements from "typed-html";

// TODO (rework) rework this in the context of the new monorepo structure

const links = [
  { href: "/", text: "Home" },
  { href: "/select", text: "Select" },
  { href: "/connect4", text: "Connect 4" },
] as const;

export function Navbar() {
  return (
    <div hx-boost="true" class="p-3 w-full sm:w-[550px] m-auto flex gap-2 underline">
      {links.map(({ href, text }) => (
        <a href={href}>{text}</a>
      ))}
    </div>
  );
}