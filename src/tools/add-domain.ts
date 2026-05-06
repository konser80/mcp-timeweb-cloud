import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { TimewebCloudClient } from "../api/client.js";
import { handleToolError } from "../utils/errors.js";
import { fqdnSchema } from "../schemas/common.js";

export function registerAddDomain(server: McpServer, client: TimewebCloudClient): void {
  server.tool(
    "timeweb_add_domain",
    "Attach an existing (already-registered) domain to the Timeweb Cloud account. Does not register a new domain.",
    { fqdn: fqdnSchema },
    async ({ fqdn }) => {
      try {
        const data = await client.addDomain(fqdn);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (e) {
        return handleToolError(e);
      }
    }
  );
}
