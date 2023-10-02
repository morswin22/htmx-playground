import * as elements from "typed-html";
import { LiveReload } from "@fw/components/LiveReload";
import { Navbar } from "@fw/components/Navbar";
import { Tailwind } from "@fw/components/Tailwind";

export default function Layout({ children }: elements.Attributes) {
  return (
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>My First Page</title>
        <Tailwind />
        <script src="https://unpkg.com/htmx.org@1.9.5" integrity="sha384-xcuj3WpfgjlKF+FXhSQFQ0ZNr39ln+hwjN3npfM9VBnUskLolQAcN80McRIVOPuO" crossorigin="anonymous"></script>
        <script src="https://unpkg.com/htmx.org/dist/ext/sse.js"></script>
        <script src="https://unpkg.com/hyperscript.org@0.9.11"></script>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css" />
      </head>
      <body class="flex flex-col h-[100svh] bg-gray-50 dark:bg-gray-800 text-black dark:text-white">
        <Navbar />
        {children}
        <LiveReload />
      </body>
    </html>
  );
}