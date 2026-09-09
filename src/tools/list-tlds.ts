import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { TimewebCloudClient } from "../api/client.js";
import { handleToolError } from "../utils/errors.js";

interface TldsResponse {
  top_level_domains?: Array<{ name?: string }>;
  meta?: Record<string, unknown>;
  [key: string]: unknown;
}

/** ".ru" / "RU" -> "ru" */
function normalize(zone: string): string {
  return zone.trim().replace(/^\./, "").toLowerCase();
}

export function registerListTlds(server: McpServer, client: TimewebCloudClient): void {
  server.tool(
    "timeweb_list_tlds",
    [
      "List domain zones (TLDs) available through Timeweb with registration/prolongation/transfer prices.",
      "Each zone carries `allowed_buy_periods` (valid `period` values with their price) and `is_whois_privacy_enabled`.",
      "Call this before timeweb_create_domain_request to pick a valid period and know the cost.",
      "The account sees ~350 zones, which is far too large to return in one response — always pass `names` (or `search`) to narrow it down, e.g. names: [\"ru\"].",
      "`names`/`search` are applied locally after the API call; the API itself only filters by is_published/is_registered.",
    ].join(" "),
    {
      names: z
        .array(z.string().min(1))
        .min(1)
        .optional()
        .describe('Exact zone names, without the leading dot, e.g. ["ru", "рф"]'),
      search: z
        .string()
        .min(1)
        .optional()
        .describe('Substring match on the zone name, e.g. "shop" — use when the exact zone is unknown'),
      is_published: z.boolean().optional().describe("Filter by published zones"),
      is_registered: z.boolean().optional().describe("Filter by zones open for registration"),
    },
    async ({ names, search, is_published, is_registered }) => {
      try {
        const data = (await client.listTlds({
          is_published,
          is_registered,
        })) as TldsResponse;

        const zones = data.top_level_domains;
        if ((!names && !search) || !Array.isArray(zones)) {
          return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
        }

        const wanted = names?.map(normalize);
        const needle = search ? normalize(search) : undefined;
        const matched = zones.filter((z) => {
          const name = typeof z.name === "string" ? z.name.toLowerCase() : "";
          if (wanted?.includes(name)) return true;
          return needle !== undefined && name.includes(needle);
        });

        const result = {
          ...data,
          top_level_domains: matched,
          meta: {
            ...(data.meta ?? {}),
            matched: matched.length,
            filtered_from: zones.length,
            filter: { names, search },
          },
        };
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (e) {
        return handleToolError(e);
      }
    }
  );
}
