import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { TimewebCloudClient } from "../api/client.js";
import { handleToolError } from "../utils/errors.js";
import { fqdnSchema, subdomainFqdnSchema } from "../schemas/common.js";

export function registerAddSubdomain(server: McpServer, client: TimewebCloudClient): void {
  server.tool(
    "timeweb_add_subdomain",
    "Create a subdomain entity. Pass the parent zone FQDN and the full subdomain FQDN (including the parent zone), e.g. fqdn=example.com, subdomain_fqdn=www.example.com.",
    {
      fqdn: fqdnSchema,
      subdomain_fqdn: subdomainFqdnSchema,
    },
    async ({ fqdn, subdomain_fqdn }) => {
      try {
        await client.addSubdomain(fqdn, subdomain_fqdn);
        return { content: [{ type: "text", text: `Created ${subdomain_fqdn}` }] };
      } catch (e) {
        return handleToolError(e);
      }
    }
  );
}
