import { redirect } from "next/navigation";

// The events index was removed. Individual events live at /event/[slug] (linked from the homepage).
// Visiting /event just sends you back to ha7ch.com.
export default function EventIndex() {
  redirect("/");
}
