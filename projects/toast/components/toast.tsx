import { merge } from "@fw/utils/tailwind";
import { Router } from "express";
import * as elements from "typed-html";

// [X] use the hx-swap-oob
// [X] use the HX-Trigger event
// [ ] allow for multiple toasts via HX-Trigger

type ToastConfig = {
  type: "success" | "error" | "info" | "warning",
  title: string | null,
  description: string | null,
  position: "top" | "bottom" | "top-left" | "top-right" | "bottom-left" | "bottom-right",
  closable: boolean,
  duration: number | null,
}

function getTypeStyles(type: ToastConfig["type"]) {
  switch (type) {
  case "success":
    return "text-green-400";
  case "error":
    return "text-red-400";
  case "info":
    return "text-blue-400";
  case "warning":
    return "text-orange-400";
  //   return "text-green-400 border-green-400 shadow-green-400";
  // case "error":
  //   return "text-red-400 border-red-400 shadow-red-400";
  // case "info":
  //   return "text-blue-400 border-blue-400 shadow-blue-400";
  // case "warning":
  //   return "text-orange-400 border-orange-400 shadow-orange-400";
  }
}

function getDurationCloseScript(duration: ToastConfig["duration"]) {
  if (duration === null) return ""; 
  return `wait ${duration}ms send closeToast to me`;
}

function ToastTitle({ title }: { title: ToastConfig["title"] }) {
  if (title === null) return null;
  return (
    <div class="font-semibold">{title}</div>
  );
}

function ToastDescription({ description }: { description: ToastConfig["description"] }) {
  if (description === null) return null;
  return (
    <div>{description}</div>
  );
}

function ToastCloseButton({ closable }: { closable: ToastConfig["closable"] }) {
  if (closable === false) return null;
  return (
    <i
      class="fa fa-xmark cursor-pointer absolute top-2 right-2.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
      _="on click send closeToast to me"
    />
  );
}

function ToastCard(partialConfig: Partial<ToastConfig>) {
  const config: ToastConfig = {
    type: "info",
    title: null,
    description: "Hello, World!",
    position: "bottom",
    closable: true,
    duration: 5000,
    ...partialConfig
  };
  return (
    <div
      class={merge("p-4 rounded-lg shadow-lg overflow-hidden .opacity-0 flex-col w-fit bg-gray-300 dark:bg-gray-700 relative", getTypeStyles(config.type))}
      // class={merge("p-4 rounded-lg .opacity-0 flex-col w-fit bg-white dark:bg-gray-800 shadow-inner", getTypeStyles(config.type))}
      _={`
        on closeToast
          add .opacity-0 to me
          wait 75ms
          add .h-0 to me
          remove .p-4 from me
          wait 150ms
          remove me
        init
          add .transition-all to me
          remove .opacity-0 from me
          wait 150ms
          ${getDurationCloseScript(config.duration)}
      `}
    >
      <ToastTitle title={config.title} />
      <ToastCloseButton closable={config.closable} />
      <ToastDescription description={config.description} />
    </div>
  );
}

export function Toaster() {
  const groupStyles = {
    "top": "top-0 left-1/2 -translate-x-1/2 flex-col-reverse",
    "bottom": "bottom-0 left-1/2 -translate-x-1/2",
    "top-left": "top-0 left-0 flex-col-reverse",
    "top-right": "top-0 right-0 flex-col-reverse",
    "bottom-left": "bottom-0 left-0",
    "bottom-right": "bottom-0 right-0",
  } as const;

  return (
    // <div _={`
    //   on toaster from body
    //     js(event)
    //       return document.getElementById(\`toaster-\${event.detail.position ?? "bottom"}\`);
    //     end
    //     set toasterTarget to it
    //     js(event)
    //       const sanitized = { ...event.detail };
    //       delete sanitized.elt;
    //       return JSON.stringify(sanitized);
    //     end
    //     fetch /toaster as html with method:"POST", body:it
    //     put the result at the end of toasterTarget
    // `}>
    <div hx-trigger="toasterParams" hx-post="/toaster" hx-swap="none" _={`
      init
        set window.toasterParams to []
      on toaster from body
        js(event) window.toasterParams.push(event.detail) end
        send toasterParams to me
      on htmx:configRequest from me
        js return window.toasterParams.pop() end
        set event.detail.parameters to the result
    `}>
      {Object.entries(groupStyles).map(([position, styles]) => (
        <div class={merge("absolute flex flex-col gap-2 p-2 items-center", styles)} id={`toaster-${position}`} />
      ))}
    </div>
  );
}

// export function triggerToast(config: Partial<ToastConfig> | Partial<ToastConfig>[]) {
export function toastHeader(config: Partial<ToastConfig>) {
  return JSON.stringify({ "toaster": config });
}

export function Toast(config: Partial<ToastConfig>) {
  return (
    <div hx-swap-oob={`beforeend:#toaster-${config.position ?? "bottom"}`}>
      <ToastCard {...config} />
    </div>
  );
}

function parseToastEntry(key: string, value: string) {
  switch (key) {
  case "closable":
    return value === "true";
  case "duration":
    return value === "null" ? null : Number(value);
  case "title":
  case "description":
    return value === "null" ? null : value;
  default:
    return value;
  }
}

export function handleToast() {
  const router = Router();

  router.post("/toaster", (req, res) => {
    const params = new URLSearchParams(req.body);
    params.delete("elt"); // htmx artifact
    res.send(<Toast {...([...params.entries()].reduce((acc, [key, value]) => ({ ...acc, [key]: parseToastEntry(key, value) }), {}))} />);
    // res.send(<Toast {...JSON.parse(req.body)} />);
    // const config: Partial<ToastConfig> | Partial<ToastConfig>[] = JSON.parse(req.body);
    // if (Array.isArray(config)) {
    //   res.send((
    //     <Fragment>
    //       {config.map(Toast)}
    //     </Fragment>
    //   ));
    // } else {
    //   res.send(<Toast {...config} />);
    // }
  });

  return router;
}