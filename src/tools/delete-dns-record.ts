import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { TimewebCloudClient } from "../api/client.js";
import { handleToolError } from "../utils/errors.js";
import { fqdnSchema, recordIdSchema } from "../schemas/common.js";

export function registerDeleteDnsRecord(
  server: McpServer,
  client: TimewebCloudClient
): void {
  server.tool(
    "timeweb_delete_dns_record",
    "Delete a user-defined DNS record by its numeric id.",
    {
      fqdn: fqdnSchema,
      record_id: recordIdSchema,
    },
    async ({ fqdn, record_id }) => {
      try {
        await client.deleteDnsRecord(fqdn, record_id);
        return { content: [{ type: "text", text: `Deleted DNS record ${record_id} on ${fqdn}` }] };
      } catch (e) {
        return handleToolError(e);
      }
    }
  );
}
