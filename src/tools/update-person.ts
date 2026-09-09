import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { TimewebCloudClient } from "../api/client.js";
import { handleToolError } from "../utils/errors.js";
import { personIdSchema } from "../schemas/common.js";

export function registerUpdatePerson(server: McpServer, client: TimewebCloudClient): void {
  server.tool(
    "timeweb_update_person",
    [
      "Update the contact details of a domain admin (person).",
      "Only these four fields can be changed, and all of them are sent on every call — pass the current values for the ones you want to keep.",
      "Passport/INN/name data cannot be edited through the API.",
    ].join(" "),
    {
      person_id: personIdSchema,
      address: z.string().min(1).describe("Mailing address"),
      postcode: z.string().min(1).describe("Postal code"),
      phone: z.string().min(1).describe("Contact phone"),
      email: z.string().email().describe("Contact e-mail"),
    },
    async ({ person_id, address, postcode, phone, email }) => {
      try {
        const data = await client.updatePerson(person_id, {
          address,
          postcode,
          phone,
          email,
        });
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (e) {
        return handleToolError(e);
      }
    }
  );
}
