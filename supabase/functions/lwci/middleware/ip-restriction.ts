import type { MiddlewareHandler } from "hono";
import { getConnInfo } from "hono/cloudflare-workers";
import { ipRestriction } from "hono/ip-restriction";
import { linnworksIPList } from "../data/linnworks-ip-list.ts";

export const ipRestrictionz: MiddlewareHandler = ipRestriction(
  getConnInfo,
  {
    allowList: linnworksIPList,
  },
  async (remote, c) => {
    console.log(`[ip-block] ip: ${remote.addr} type: ${remote.type}`);
    return c.json({ Error: "Forbidden" }, 403);
  },
);
