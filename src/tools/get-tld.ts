import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { TimewebCloudClient } from "../api/client.js";
import { handleToolError } from "../utils/errors.js";
import { tldIdSchema } from "../schemas/common.js";

export function registerGetTld(server: McpServer, client: TimewebCloudClient): void {
  server.tool(
    "timeweb_get_tld",
    "Get a single domain zone (TLD) by ID, including prices and allowed registration periods.",
    { tld_id: tldIdSchema },
    async ({ tld_id }) => {
      try {
        const data = await client.getTld(tld_id);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (e) {
        return handleToolError(e);
      }
    }
  );
}
