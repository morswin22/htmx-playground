import * as elements from "typed-html";
import BaseLayout from "./base";

export default function Layout({ children, "hx-swap-oob": hxSwapOob }: elements.Attributes) {
  return (
    <BaseLayout>
      {/* TODO make the hx-swap-oob not rendered if not used */}
      <main class="flex flex-col gap-2 flex-1 place-items-center place-content-center px-2 sm:px-0" hx-swap-oob={hxSwapOob || ""}>
        {children}
      </main>
    </BaseLayout>
  );
}