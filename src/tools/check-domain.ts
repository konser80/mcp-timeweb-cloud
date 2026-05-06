import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { TimewebCloudClient } from "../api/client.js";
import { handleToolError } from "../utils/errors.js";
import { fqdnSchema } from "../schemas/common.js";

export function registerCheckDomain(server: McpServer, client: TimewebCloudClient): void {
  server.tool(
    "timeweb_check_domain",
    "Check whether an FQDN is available for registration through Timeweb.",
    { fqdn: fqdnSchema },
    async ({ fqdn }) => {
      try {
        const data = await client.checkDomain(fqdn);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (e) {
        return handleToolError(e);
      }
    }
  );
}
