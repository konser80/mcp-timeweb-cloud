import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { DomainRequestBody, TimewebCloudClient } from "../api/client.js";
import { handleToolError } from "../utils/errors.js";
import {
  domainPeriodSchema,
  domainPrimeSchema,
  fqdnSchema,
  personIdSchema,
} from "../schemas/common.js";

/** Fields the API accepts per action; anything else is dropped. */
const FIELDS_BY_ACTION = {
  register: [
    "fqdn",
    "person_id",
    "period",
    "is_autoprolong_enabled",
    "is_whois_privacy_enabled",
  ],
  prolong: [
    "fqdn",
    "person_id",
    "period",
    "is_autoprolong_enabled",
    "is_whois_privacy_enabled",
    "is_antispam_enabled",
    "prime",
  ],
  transfer: ["fqdn", "auth_code"],
} as const;

const REQUIRED_BY_ACTION = {
  register: ["person_id"],
  prolong: [],
  transfer: ["auth_code"],
} as const;

export function registerCreateDomainRequest(
  server: McpServer,
  client: TimewebCloudClient
): void {
  server.tool(
    "timeweb_create_domain_request",
    [
      "Create a domain registration, prolongation or transfer request.",
      "This only creates the request — it is NOT paid yet. Pay it with timeweb_pay_domain_request using the returned `request.id`, which is what actually spends money from the account balance.",
      "`register` requires person_id (see timeweb_list_persons / timeweb_create_person); check availability first with timeweb_check_domain.",
      "`transfer` requires auth_code from the losing registrar.",
      "Zone limits: .ru and .рф allow period P1Y–P3Y only and do not support is_whois_privacy_enabled. Verify the period and price with timeweb_list_tlds.",
      "Fields that do not apply to the chosen action are dropped before the request.",
    ].join(" "),
    {
      action: z
        .enum(["register", "prolong", "transfer"])
        .describe("Request type: register a new domain, prolong an existing one, or transfer one in"),
      fqdn: fqdnSchema,
      person_id: personIdSchema
        .optional()
        .describe("Domain admin ID. Required for `register`, optional for `prolong`"),
      period: domainPeriodSchema.optional(),
      is_autoprolong_enabled: z
        .boolean()
        .optional()
        .describe("Enable auto-renewal for the domain. `register`/`prolong`"),
      is_whois_privacy_enabled: z
        .boolean()
        .optional()
        .describe(
          "Hide admin data in WHOIS (paid, see whois_privacy_price). Unavailable for .ru and .рф. `register`/`prolong`"
        ),
      is_antispam_enabled: z
        .boolean()
        .optional()
        .describe("Enable the antispam service. `prolong` only"),
      prime: domainPrimeSchema.optional().describe("Prime tier. `prolong` only"),
      auth_code: z
        .string()
        .min(1)
        .optional()
        .describe("Transfer authorization code from the current registrar. Required for `transfer`"),
    },
    async (input) => {
      try {
        const missing = REQUIRED_BY_ACTION[input.action].filter(
          (f) => (input as Record<string, unknown>)[f] === undefined
        );
        if (missing.length > 0) {
          return {
            content: [
              {
                type: "text",
                text: `Missing required field(s) for action "${input.action}": ${missing.join(", ")}`,
              },
            ],
            isError: true,
          };
        }

        const src = input as Record<string, unknown>;
        const body = { action: input.action } as Record<string, unknown>;
        for (const field of FIELDS_BY_ACTION[input.action]) {
          if (src[field] !== undefined) body[field] = src[field];
        }

        const data = await client.createDomainRequest(body as unknown as DomainRequestBody);
        const enriched = {
          ...(data as object),
          _hint:
            "The request is created but not paid. Call timeweb_pay_domain_request with request_id to pay it from the account balance, then watch timeweb_list_domains with idn_name=<fqdn> until domain_status becomes `paid`.",
        };
        return { content: [{ type: "text", text: JSON.stringify(enriched, null, 2) }] };
      } catch (e) {
        return handleToolError(e);
      }
    }
  );
}
