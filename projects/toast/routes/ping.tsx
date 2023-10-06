import { Handler } from "express";
import { Toast, toastHeader } from "../components/toast";
import { Fragment } from "@fw/components/Fragment";
import * as elements from "typed-html";

export const GET: Handler = (req, res) => {
  res.setHeader("HX-Trigger", toastHeader({ type: "success", title: "Success!", description: "From HX-Trigger", duration: null }));
  res.send((
    <Fragment>
      <Toast type="warning" description="From hx-swap-oob" position="top-right" closable={false} />
      pinged!
    </Fragment>
  ));
};
