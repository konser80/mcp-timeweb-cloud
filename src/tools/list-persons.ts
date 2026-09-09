import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { TimewebCloudClient } from "../api/client.js";
import { handleToolError } from "../utils/errors.js";
import { limitSchema, offsetSchema } from "../schemas/common.js";

export function registerListPersons(server: McpServer, client: TimewebCloudClient): void {
  server.tool(
    "timeweb_list_persons",
    [
      "List domain admins (persons) on the account.",
      "A domain registration request needs a `person_id` from here; check `is_blank` — an admin with incomplete data cannot be used.",
    ].join(" "),
    {
      limit: limitSchema,
      offset: offsetSchema,
      is_closed: z.boolean().optional().describe("Filter by closed admins"),
    },
    async (args) => {
      try {
        const data = await client.listPersons(args);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (e) {
        return handleToolError(e);
      }
    }
  );
}
