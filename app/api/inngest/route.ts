import { serve } from "inngest/next";
import { inngest } from "@/server/inngest/client";
import { sendReminder } from "@/server/inngest/functions/sendReminder";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [sendReminder],
});
