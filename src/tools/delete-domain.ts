import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { TimewebCloudClient } from "../api/client.js";
import { handleToolError } from "../utils/errors.js";
import { fqdnSchema } from "../schemas/common.js";

export function registerDeleteDomain(server: McpServer, client: TimewebCloudClient): void {
  server.tool(
    "timeweb_delete_domain",
    "Detach (remove) a domain from the Timeweb Cloud account.",
    { fqdn: fqdnSchema },
    async ({ fqdn }) => {
      try {
        await client.deleteDomain(fqdn);
        return { content: [{ type: "text", text: `Deleted ${fqdn}` }] };
      } catch (e) {
        return handleToolError(e);
      }
    }
  );
}
