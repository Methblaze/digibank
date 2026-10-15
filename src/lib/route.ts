import { useEffect, useState } from "react";

// Hash routes, so deep links work on GitHub Pages without a 404 fallback.
export type Route = "home" | "wallet" | "piggy" | "send";
const routes: Route[] = ["home", "wallet", "piggy", "send"];

function read(): Route {
  const r = window.location.hash.replace(/^#\/?/, "") as Route;
  return routes.includes(r) ? r : "home";
}

export function useRoute() {
  const [route, setRoute] = useState<Route>(read);
  useEffect(() => {
    const on = () => setRoute(read());
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);
  return route;
}

export const go = (r: Route) => {
  window.location.hash = r === "home" ? "/" : `/${r}`;
};
