import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { TimewebCloudClient } from "../api/client.js";
import { handleToolError } from "../utils/errors.js";
import { fqdnSchema, subdomainFqdnSchema } from "../schemas/common.js";

export function registerDeleteSubdomain(
  server: McpServer,
  client: TimewebCloudClient
): void {
  server.tool(
    "timeweb_delete_subdomain",
    "Delete a subdomain entity by parent zone FQDN and full subdomain FQDN.",
    {
      fqdn: fqdnSchema,
      subdomain_fqdn: subdomainFqdnSchema,
    },
    async ({ fqdn, subdomain_fqdn }) => {
      try {
        await client.deleteSubdomain(fqdn, subdomain_fqdn);
        return { content: [{ type: "text", text: `Deleted ${subdomain_fqdn}` }] };
      } catch (e) {
        return handleToolError(e);
      }
    }
  );
}
