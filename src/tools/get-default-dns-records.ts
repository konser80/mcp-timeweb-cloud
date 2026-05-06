import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { TimewebCloudClient } from "../api/client.js";
import { handleToolError } from "../utils/errors.js";
import { fqdnSchema } from "../schemas/common.js";

export function registerGetDefaultDnsRecords(
  server: McpServer,
  client: TimewebCloudClient
): void {
  server.tool(
    "timeweb_get_default_dns_records",
    "Get the default (built-in) DNS records of a domain or subdomain — the records Timeweb provides automatically and which are not user-editable.",
    { fqdn: fqdnSchema },
    async ({ fqdn }) => {
      try {
        const data = await client.getDefaultDnsRecords(fqdn);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (e) {
        return handleToolError(e);
      }
    }
  );
}
