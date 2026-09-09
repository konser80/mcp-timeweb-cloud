import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { TimewebCloudClient } from "../api/client.js";
import { handleToolError } from "../utils/errors.js";
import {
  buildPersonBody,
  missingPersonFields,
  personInputShape,
} from "../schemas/person.js";

export function registerCreatePerson(server: McpServer, client: TimewebCloudClient): void {
  server.tool(
    "timeweb_create_person",
    [
      "Create a domain admin (person) — the registrant a domain is registered to.",
      "Required by timeweb_create_domain_request, which takes the resulting `person_id`.",
      "Required fields depend on `type`:",
      "`person` — name, is_resident, postcode, mailing_address, phone, email, birthdate, passport_series, passport_number, passport_date, passport_place;",
      "`ip` — the same plus inn;",
      "`org` — name, is_resident, postcode, mailing_address, phone, email, contact_name, inn, legal_address (kpp optional).",
      "Non-residents (is_resident: false) must also pass country_code. Fields that do not belong to the chosen type are dropped before the request.",
      "This registrant data is submitted to the domain registrar — make sure it is accurate.",
    ].join(" "),
    personInputShape,
    async (input) => {
      try {
        const missing = missingPersonFields(input);
        if (missing.length > 0) {
          return {
            content: [
              {
                type: "text",
                text: `Missing required field(s) for type "${input.type}": ${missing.join(", ")}`,
              },
            ],
            isError: true,
          };
        }
        const data = await client.createPerson(buildPersonBody(input));
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (e) {
        return handleToolError(e);
      }
    }
  );
}
