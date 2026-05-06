import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { TimewebCloudClient } from "../api/client.js";
import { handleToolError } from "../utils/errors.js";
import { fqdnSchema } from "../schemas/common.js";

export function registerGetDomain(server: McpServer, client: TimewebCloudClient): void {
  server.tool(
    "timeweb_get_domain",
    "Get full info about a single domain by its FQDN: status, expiration, linked IP, auto-prolongation, etc.",
    { fqdn: fqdnSchema },
    async ({ fqdn }) => {
      try {
        const data = await client.getDomain(fqdn);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (e) {
        return handleToolError(e);
      }
    }
  );
}
