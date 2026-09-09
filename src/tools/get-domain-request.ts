import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { TimewebCloudClient } from "../api/client.js";
import { handleToolError } from "../utils/errors.js";
import { requestIdSchema } from "../schemas/common.js";

export function registerGetDomainRequest(
  server: McpServer,
  client: TimewebCloudClient
): void {
  server.tool(
    "timeweb_get_domain_request",
    [
      "Get a domain registration/prolongation/transfer request by ID.",
      "The request object carries NO progress status — it only shows what was ordered plus `money_source` (null until paid, `use` once paid) and `message`/`error_code_transfer` for failures, and it does not change as the registrar works.",
      "Do NOT poll this tool for the outcome. Poll `timeweb_list_domains` with idn_name=<fqdn> instead: `domain_status` goes no_paid -> paid and `request_status` goes registration_request -> null when registration completes (usually under a minute).",
    ].join(" "),
    { request_id: requestIdSchema },
    async ({ request_id }) => {
      try {
        const data = await client.getDomainRequest(request_id);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (e) {
        return handleToolError(e);
      }
    }
  );
}
