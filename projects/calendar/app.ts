import { createApp } from "@fw/app";
import { handleRoutes } from "@fw/render";
import { CenteredLayout } from "@fw/components/CenteredLayout";
import { handleCalendar } from "@calendar/components/Calendar";
import { handleIncrementingButton } from "@calendar/components/IncrementingButton";

createApp().then((app) => {
  app.start([
    handleRoutes({
      FallbackLayout: CenteredLayout,
    }),
    handleCalendar(),
    handleIncrementingButton(),
  ]);
});
