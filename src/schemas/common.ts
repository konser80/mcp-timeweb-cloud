import { z } from "zod";

const FQDN_RE = /^[\p{L}\p{N}_-]+(\.[\p{L}\p{N}_-]+)+$/u;
const LABEL_RE = /^[\p{L}\p{N}_*-]+(\.[\p{L}\p{N}_*-]+)*$/u;

export const fqdnSchema = z
  .string()
  .min(3)
  .regex(FQDN_RE, "Must be a valid FQDN (Cyrillic/IDN allowed)")
  .describe("Full domain name, e.g. example.com or пример.рф");

export const subdomainFqdnSchema = z
  .string()
  .min(3)
  .regex(FQDN_RE, "Must be a valid subdomain FQDN")
  .describe("Full subdomain FQDN including the parent zone, e.g. www.example.com");

export const subdomainLabelSchema = z
  .string()
  .min(1)
  .regex(LABEL_RE, "Invalid subdomain label")
  .describe("Subdomain label only, without the parent zone, e.g. www or _dmarc");

export const recordIdSchema = z.number().int().positive();

export const limitSchema = z.number().int().min(1).max(100).optional();
export const offsetSchema = z.number().int().min(0).optional();

export const dnsTypeSchema = z
  .enum(["A", "AAAA", "MX", "CNAME", "TXT", "SRV"])
  .describe("DNS record type");

export const ttlSchema = z
  .number()
  .int()
  .min(60)
  .max(2592000)
  .optional()
  .describe("Time-to-live in seconds (default left to API)");

export const prioritySchema = z
  .number()
  .int()
  .min(0)
  .max(65535)
  .optional()
  .describe("Priority (used for MX and SRV records)");

export const personIdSchema = z
  .number()
  .int()
  .positive()
  .describe("Domain admin (person) ID, as returned by timeweb_list_persons");

export const requestIdSchema = z
  .number()
  .int()
  .positive()
  .describe("Domain request ID, as returned by timeweb_create_domain_request");

export const tldIdSchema = z.number().int().positive().describe("Domain zone (TLD) ID");

export const domainPeriodSchema = z
  .enum(["P1Y", "P2Y", "P3Y", "P4Y", "P5Y", "P6Y", "P7Y", "P8Y", "P9Y", "P10Y"])
  .describe(
    "Payment period in ISO-8601 duration form. .ru and .рф accept P1Y–P3Y only; check allowed_buy_periods via timeweb_list_tlds"
  );

export const domainPrimeSchema = z
  .enum(["extra", "premium", "optimal", "maximal"])
  .describe("Prime domain tier (prolongation only)");
