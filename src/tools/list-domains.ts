import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { TimewebCloudClient } from "../api/client.js";
import { handleToolError } from "../utils/errors.js";
import { limitSchema, offsetSchema } from "../schemas/common.js";

export function registerListDomains(server: McpServer, client: TimewebCloudClient): void {
  server.tool(
    "timeweb_list_domains",
    "List all domains attached to the Timeweb Cloud account. Supports pagination and filtering.",
    {
      limit: limitSchema,
      offset: offsetSchema,
      idn_name: z.string().min(1).optional().describe("Filter by IDN name (e.g. xn--e1afmkfd.xn--p1ai)"),
      linked_ip: z.string().min(1).optional().describe("Filter by linked IP address"),
      sort: z.string().min(1).optional().describe("Sort field, e.g. idn_name"),
      order: z.enum(["asc", "desc"]).optional().describe("Sort order"),
    },
    async (args) => {
      try {
        const data = await client.listDomains(args);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (e) {
        return handleToolError(e);
      }
    }
  );
}
