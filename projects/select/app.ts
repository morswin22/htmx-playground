import { createApp } from "@fw/app";
import { handleRoutes } from "@fw/render";
import { handleSelect } from "@select/components/Select";
import CenteredLayout from "@fw/layouts/centered";

createApp().then((app) => {
  app.start([
    handleRoutes({
      FallbackLayout: CenteredLayout,
    }),
    handleSelect(),
  ]);
});
