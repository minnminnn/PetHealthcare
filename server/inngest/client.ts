import { Inngest } from "inngest";

export const inngest = new Inngest({
  id: "pethealthcare",
  name: "PetHealthcare Platform",
  eventKey: process.env.INNGEST_EVENT_KEY,
});
