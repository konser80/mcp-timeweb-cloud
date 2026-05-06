import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { TimewebCloudClient } from "../api/client.js";
import { handleToolError } from "../utils/errors.js";
import { fqdnSchema } from "../schemas/common.js";

export function registerGetNameServers(server: McpServer, client: TimewebCloudClient): void {
  server.tool(
    "timeweb_get_name_servers",
    "Get the list of name-servers configured for a domain.",
    { fqdn: fqdnSchema },
    async ({ fqdn }) => {
      try {
        const data = await client.getNameServers(fqdn);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (e) {
        return handleToolError(e);
      }
    }
  );
}
