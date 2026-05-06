import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { TimewebCloudClient } from "../api/client.js";
import { handleToolError } from "../utils/errors.js";
import { fqdnSchema } from "../schemas/common.js";

const TIMEWEB_DEFAULT_NS = [
  { host: "ns1.timeweb.ru" },
  { host: "ns2.timeweb.ru" },
  { host: "ns3.timeweb.org" },
  { host: "ns4.timeweb.org" },
];

export function registerSetDefaultNameServers(
  server: McpServer,
  client: TimewebCloudClient
): void {
  server.tool(
    "timeweb_set_default_name_servers",
    "Reset the domain's name-servers to Timeweb's defaults: ns1.timeweb.ru, ns2.timeweb.ru, ns3.timeweb.org, ns4.timeweb.org. Use this when migrating a domain back onto Timeweb DNS.",
    { fqdn: fqdnSchema },
    async ({ fqdn }) => {
      try {
        const data = await client.updateNameServers(fqdn, TIMEWEB_DEFAULT_NS);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (e) {
        return handleToolError(e);
      }
    }
  );
}
