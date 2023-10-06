import * as elements from "typed-html";
import { RootLayout } from "./RootLayout";

export function CenteredLayout({ children, "hx-swap-oob": hxSwapOob }: elements.Attributes) {
  return (
    <RootLayout>
      {/* TODO make the hx-swap-oob not rendered if not used */}
      {/* TODO but the bigger question is, is it really needed? */}
      <main class="flex flex-col gap-2 flex-1 place-items-center place-content-center px-2 sm:px-0" hx-swap-oob={hxSwapOob || ""}>
        {children}
      </main>
    </RootLayout>
  );
}