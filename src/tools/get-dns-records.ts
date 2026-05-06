import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { TimewebCloudClient } from "../api/client.js";
import { handleToolError } from "../utils/errors.js";
import { fqdnSchema, limitSchema, offsetSchema } from "../schemas/common.js";

export function registerGetDnsRecords(server: McpServer, client: TimewebCloudClient): void {
  server.tool(
    "timeweb_get_dns_records",
    "Get all user-defined DNS records for a domain or subdomain. Pass the FQDN of the zone (or full subdomain FQDN to scope to that subdomain).",
    {
      fqdn: fqdnSchema,
      limit: limitSchema,
      offset: offsetSchema,
    },
    async ({ fqdn, limit, offset }) => {
      try {
        const data = await client.getDnsRecords(fqdn, limit, offset);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (e) {
        return handleToolError(e);
      }
    }
  );
}
