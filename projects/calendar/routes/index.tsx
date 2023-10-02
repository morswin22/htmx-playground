import * as elements from "typed-html";
import { IncrementingButton } from "@calendar/components/IncrementingButton";
import { Calendar } from "@calendar/components/Calendar";
import { Fragment } from "@fw/components/Fragment";

export default function HomePage() {
  return (
    <Fragment>
      <h1 class="text-3xl font-bold mb-5">Hello, World!</h1>
      <IncrementingButton value={0} />
      <Calendar />
    </Fragment>
  );
}


// *** DOCS ***

// import { Request } from "express";
// import * as elements from "typed-html";

// type Params = {
//   ip: string;
// }

// export function getParams(req: Request): Params {
//   return {
//     ip: req.ip,
//   };
// }

// export default function Connect4({ ip }: Params) {
//   return (
//     <p>{ip}</p>
//   );
// }

// Equivalent to:

// import { Handler } from "express";
// import CenteredLayout from "@/layouts/centered";

// export const GET: Handler = function (req, res) {
//   return res.send(
//     <CenteredLayout>
//       <p>{req.ip}</p>
//     </CenteredLayout>
//   );
// };