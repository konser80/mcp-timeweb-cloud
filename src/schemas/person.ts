import { z } from "zod";

export type PersonType = "person" | "org" | "ip";

export const personTypeSchema = z
  .enum(["person", "org", "ip"])
  .describe(
    "Admin type: `person` — individual, `org` — organisation, `ip` — sole proprietor. Determines which fields are required."
  );

const dateHint = "Date in YYYY-MM-DD form, e.g. 1990-05-17";

/** Raw shape shared by timeweb_create_person. Type-specific fields are optional
 *  here and validated per `type` in the handler — a ZodRawShape cannot express
 *  cross-field rules. */
export const personInputShape = {
  type: personTypeSchema,
  name: z
    .string()
    .min(1)
    .describe("Full name (`person`, `ip`) or organisation name (`org`)"),
  is_resident: z.boolean().describe("Whether the admin is a tax resident of Russia"),
  postcode: z.string().min(1).describe("Postal code"),
  mailing_address: z.string().min(1).describe("Mailing address"),
  phone: z.string().min(1).describe("Contact phone, e.g. +79001234567"),
  email: z.string().email().describe("Contact e-mail"),
  country_code: z
    .string()
    .min(2)
    .max(2)
    .optional()
    .describe("ISO 3166-1 alpha-2 country code. Non-residents only (is_resident: false)"),
  birthdate: z.string().min(1).optional().describe(`Birth date. \`person\`/\`ip\`. ${dateHint}`),
  passport_series: z.string().min(1).optional().describe("Passport series. `person`/`ip`"),
  passport_number: z.string().min(1).optional().describe("Passport number. `person`/`ip`"),
  passport_date: z
    .string()
    .min(1)
    .optional()
    .describe(`Passport issue date. \`person\`/\`ip\`. ${dateHint}`),
  passport_place: z.string().min(1).optional().describe("Passport issuing authority. `person`/`ip`"),
  inn: z.string().min(1).optional().describe("INN (tax number). `org`/`ip`"),
  kpp: z.string().min(1).optional().describe("KPP. `org` only, optional"),
  legal_address: z.string().min(1).optional().describe("Legal address. `org` only"),
  contact_name: z.string().min(1).optional().describe("Contact person. `org` only"),
} as const;

export type PersonInput = z.infer<z.ZodObject<typeof personInputShape>>;

const BASE_FIELDS = [
  "type",
  "name",
  "is_resident",
  "postcode",
  "mailing_address",
  "phone",
  "email",
] as const;

const PASSPORT_FIELDS = [
  "birthdate",
  "passport_series",
  "passport_number",
  "passport_date",
  "passport_place",
] as const;

/** Fields the API accepts for each admin type, beyond BASE_FIELDS + country_code. */
const EXTRA_FIELDS: Record<PersonType, readonly string[]> = {
  person: PASSPORT_FIELDS,
  ip: [...PASSPORT_FIELDS, "inn"],
  org: ["contact_name", "inn", "kpp", "legal_address"],
};

/** Of those, the ones the API requires. */
const REQUIRED_EXTRA_FIELDS: Record<PersonType, readonly string[]> = {
  person: PASSPORT_FIELDS,
  ip: [...PASSPORT_FIELDS, "inn"],
  org: ["contact_name", "inn", "legal_address"],
};

export function missingPersonFields(input: PersonInput): string[] {
  const missing = REQUIRED_EXTRA_FIELDS[input.type].filter(
    (f) => (input as Record<string, unknown>)[f] === undefined
  );
  if (!input.is_resident && input.country_code === undefined) {
    missing.push("country_code");
  }
  return missing;
}

/** Keeps only the fields valid for `input.type` — the API rejects foreign ones. */
export function buildPersonBody(input: PersonInput): Record<string, unknown> {
  const allowed = [...BASE_FIELDS, ...EXTRA_FIELDS[input.type]];
  // country_code must not be sent for residents.
  if (!input.is_resident) allowed.push("country_code");

  const src = input as Record<string, unknown>;
  return Object.fromEntries(
    allowed.filter((f) => src[f] !== undefined).map((f) => [f, src[f]])
  );
}
