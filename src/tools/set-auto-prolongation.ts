import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { TimewebCloudClient } from "../api/client.js";
import { handleToolError } from "../utils/errors.js";
import { fqdnSchema } from "../schemas/common.js";

export function registerSetAutoProlongation(
  server: McpServer,
  client: TimewebCloudClient
): void {
  server.tool(
    "timeweb_set_auto_prolongation",
    "Enable or disable auto-prolongation (auto-renewal) for a domain.",
    {
      fqdn: fqdnSchema,
      is_autoprolong_enabled: z.boolean().describe("true to enable auto-prolongation, false to disable"),
    },
    async ({ fqdn, is_autoprolong_enabled }) => {
      try {
        const data = await client.setAutoProlongation(fqdn, is_autoprolong_enabled);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (e) {
        return handleToolError(e);
      }
    }
  );
}
