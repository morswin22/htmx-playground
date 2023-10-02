import * as elements from "typed-html";

export function Card({ children, ...rest }: elements.Attributes) {
  return (
    <section class="bg-white dark:bg-gray-700 shadow-md rounded px-8 pt-6 pb-8 mb-4 container" {...rest}>
      {children}
    </section>
  );
}