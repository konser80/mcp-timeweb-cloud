import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { TimewebCloudClient } from "../api/client.js";
import { handleToolError } from "../utils/errors.js";
import { personIdSchema, requestIdSchema } from "../schemas/common.js";

export function registerPayDomainRequest(
  server: McpServer,
  client: TimewebCloudClient
): void {
  server.tool(
    "timeweb_pay_domain_request",
    [
      "Pay a domain registration/prolongation/transfer request from the account balance (money_source: `use`).",
      "This SPENDS MONEY and starts the registration at the registrar — confirm with the user before calling.",
      "Registration is asynchronous and takes up to about a minute. The request object never shows progress — check the outcome with timeweb_list_domains (idn_name=<fqdn>): domain_status no_paid -> paid, request_status registration_request -> null.",
    ].join(" "),
    {
      request_id: requestIdSchema,
      person_id: personIdSchema
        .optional()
        .describe("Domain admin to bill/register to; defaults to the one on the request"),
    },
    async ({ request_id, person_id }) => {
      try {
        const data = await client.payDomainRequest(request_id, person_id);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (e) {
        return handleToolError(e);
      }
    }
  );
}
