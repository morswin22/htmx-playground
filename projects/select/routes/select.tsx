import * as elements from "typed-html";
import { Select } from "@select/components/Select";
import { Fragment } from "@fw/components/Fragment";

export default function SelectPage() {
  return (
    <Fragment>
      <Select
        options={["React sucks", "htmx is great"].map((value, key) => ({ key, value }))}
        selected={[0]}
      />
      <Select
        options={["html", "css", "js"].map((value, key) => ({ key, value }))}
        isOptionsOpen="open"
        name="languages"
      />
    </Fragment>
  );
}