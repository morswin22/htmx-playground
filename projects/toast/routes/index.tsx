import * as elements from "typed-html";

export default function Home() {
  return (
    <button class="p-3 border rounded-lg" hx-get="/ping">ping</button>
  );
}