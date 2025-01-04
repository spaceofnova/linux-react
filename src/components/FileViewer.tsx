import fs from "@zenfs/core";

export function loader(_: Route.LoaderArgs) {
  return Response.json({ message: "I handle GET" });
}
