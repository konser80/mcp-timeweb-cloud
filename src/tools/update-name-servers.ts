import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { TimewebCloudClient } from "../api/client.js";
import { handleToolError } from "../utils/errors.js";
import { fqdnSchema } from "../schemas/common.js";

const nameServerSchema = z.object({
  host: z.string().min(1).describe("Name-server host, e.g. ns1.example.com"),
  ips: z
    .array(z.string().min(1))
    .optional()
    .describe("Glue records — list of IPs for the name-server (only required for in-bailiwick name-servers)"),
});

export function registerUpdateNameServers(
  server: McpServer,
  client: TimewebCloudClient
): void {
  server.tool(
    "timeweb_update_name_servers",
    "Replace the full list of name-servers for a domain. Pass every NS you want to keep — the API does a full overwrite, not a delta.",
    {
      fqdn: fqdnSchema,
      name_servers: z.array(nameServerSchema).min(1),
    },
    async ({ fqdn, name_servers }) => {
      try {
        const data = await client.updateNameServers(fqdn, name_servers);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (e) {
        return handleToolError(e);
      }
    }
  );
}
