import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { TimewebCloudClient } from "../api/client.js";
import { handleToolError } from "../utils/errors.js";
import { personIdSchema } from "../schemas/common.js";

export function registerListDomainRequests(
  server: McpServer,
  client: TimewebCloudClient
): void {
  server.tool(
    "timeweb_list_domain_requests",
    "List domain registration/prolongation/transfer requests, including unpaid ones. Optionally filter by domain admin.",
    { person_id: personIdSchema.optional().describe("Filter by domain admin ID") },
    async ({ person_id }) => {
      try {
        const data = await client.listDomainRequests(person_id);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (e) {
        return handleToolError(e);
      }
    }
  );
}
