import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { TimewebCloudClient } from "../api/client.js";
import { handleToolError } from "../utils/errors.js";
import { personIdSchema } from "../schemas/common.js";

export function registerGetPerson(server: McpServer, client: TimewebCloudClient): void {
  server.tool(
    "timeweb_get_person",
    "Get a single domain admin (person) by ID.",
    { person_id: personIdSchema },
    async ({ person_id }) => {
      try {
        const data = await client.getPerson(person_id);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (e) {
        return handleToolError(e);
      }
    }
  );
}
