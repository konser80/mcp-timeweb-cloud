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
    "Delete a user-defined DNS record by its numeric id. IMPORTANT: pass the FQDN at which the record actually lives — for records on a subdomain that is the full subdomain FQDN (e.g. www.example.com), not the parent zone. Using the wrong FQDN returns 404.",
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
