import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { TimewebCloudClient } from "../api/client.js";
import { handleToolError } from "../utils/errors.js";
import {
  dnsTypeSchema,
  fqdnSchema,
  prioritySchema,
  recordIdSchema,
  subdomainLabelSchema,
  ttlSchema,
} from "../schemas/common.js";

export function registerUpdateDnsRecord(
  server: McpServer,
  client: TimewebCloudClient
): void {
  server.tool(
    "timeweb_update_dns_record",
    "Update an existing DNS record by id. Same body shape as create. IMPORTANT: pass the FQDN at which the record actually lives — for records on a subdomain that is the full subdomain FQDN (e.g. www.example.com), not the parent zone. Using the wrong FQDN returns 404.",
    {
      fqdn: fqdnSchema,
      record_id: recordIdSchema,
      type: dnsTypeSchema,
      value: z.string().min(1),
      subdomain: subdomainLabelSchema.optional(),
      priority: prioritySchema,
      ttl: ttlSchema,
    },
    async ({ fqdn, record_id, type, value, subdomain, priority, ttl }) => {
      try {
        const data = await client.updateDnsRecord(fqdn, record_id, {
          type,
          value,
          subdomain,
          priority,
          ttl,
        });
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (e) {
        return handleToolError(e);
      }
    }
  );
}
