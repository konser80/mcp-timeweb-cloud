import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { TimewebCloudClient } from "../api/client.js";
import { handleToolError } from "../utils/errors.js";
import { personIdSchema } from "../schemas/common.js";

export function registerDeletePerson(server: McpServer, client: TimewebCloudClient): void {
  server.tool(
    "timeweb_delete_person",
    [
      "Delete a domain admin (person). Irreversible.",
      "An admin that domains are still registered to cannot be deleted — the API returns an error.",
    ].join(" "),
    { person_id: personIdSchema },
    async ({ person_id }) => {
      try {
        const data = await client.deletePerson(person_id);
        const text = data ? JSON.stringify(data, null, 2) : `Person ${person_id} deleted.`;
        return { content: [{ type: "text", text }] };
      } catch (e) {
        return handleToolError(e);
      }
    }
  );
}
