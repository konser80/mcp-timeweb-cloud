import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { TimewebCloudClient } from "../api/client.js";
import { handleToolError } from "../utils/errors.js";
import {
  dnsTypeSchema,
  fqdnSchema,
  prioritySchema,
  subdomainLabelSchema,
  ttlSchema,
} from "../schemas/common.js";

export function registerCreateDnsRecord(
  server: McpServer,
  client: TimewebCloudClient
): void {
  server.tool(
    "timeweb_create_dns_record",
    [
      "Create a DNS record on a domain or its subdomain.",
      "Set `subdomain` (label only, without the parent zone) to attach the record to a subdomain; omit it for the apex.",
      "`value` semantics by type: A — IPv4; AAAA — IPv6; CNAME/MX — target FQDN; TXT — string; SRV — `weight port target` or full SRV value (priority is passed separately).",
      "`priority` is required for MX and SRV.",
    ].join(" "),
    {
      fqdn: fqdnSchema,
      type: dnsTypeSchema,
      value: z.string().min(1).describe("Record value (see tool description for type-specific format)"),
      subdomain: subdomainLabelSchema.optional(),
      priority: prioritySchema,
      ttl: ttlSchema,
    },
    async ({ fqdn, type, value, subdomain, priority, ttl }) => {
      try {
        const data = await client.createDnsRecord(fqdn, {
          type,
          value,
          subdomain,
          priority,
          ttl,
        });
        const effectiveFqdn = subdomain ? `${subdomain}.${fqdn}` : fqdn;
        const enriched = {
          ...(data as object),
          effective_fqdn: effectiveFqdn,
          _hint: `This record is named ${effectiveFqdn}. Read/update/delete it with fqdn="${effectiveFqdn}"; if that returns nothing, it is stored on the parent zone "${fqdn}" with data.subdomain="${subdomain}" — which is where non-CNAME types end up.`,
        };
        return { content: [{ type: "text", text: JSON.stringify(enriched, null, 2) }] };
      } catch (e) {
        return handleToolError(e);
      }
    }
  );
}
