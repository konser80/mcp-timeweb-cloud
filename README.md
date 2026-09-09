# timeweb-cloud-mcp-server

MCP server for the [Timeweb Cloud API](https://timeweb.cloud/api-docs). Manages domains, subdomains, DNS records, name-servers, and domain registration/prolongation/transfer.

## Tools

Domains:
- `timeweb_list_domains` — list with pagination/filtering
- `timeweb_get_domain` — domain info by FQDN
- `timeweb_add_domain` — attach an already-registered domain to the account
- `timeweb_delete_domain` — detach a domain
- `timeweb_check_domain` — registration availability
- `timeweb_set_auto_prolongation` — toggle auto-renewal

Subdomains:
- `timeweb_add_subdomain`
- `timeweb_delete_subdomain`

DNS:
- `timeweb_get_dns_records`
- `timeweb_get_default_dns_records`
- `timeweb_create_dns_record` — type ∈ {A, AAAA, MX, CNAME, TXT, SRV}
- `timeweb_update_dns_record`
- `timeweb_delete_dns_record`

Name-servers:
- `timeweb_get_name_servers`
- `timeweb_update_name_servers` — full overwrite, pass every NS you want to keep
- `timeweb_set_default_name_servers` — one-click reset to Timeweb's default NS

Timeweb default NS (used by `timeweb_set_default_name_servers`):

    ns1.timeweb.ru
    ns2.timeweb.ru
    ns3.timeweb.org
    ns4.timeweb.org

Domain zones (TLDs):
- `timeweb_list_tlds` — zones with prices and `allowed_buy_periods`; pass `names`/`search`, the full list is ~350 zones
- `timeweb_get_tld` — one zone by ID

Domain admins (registrants):
- `timeweb_list_persons`
- `timeweb_get_person`
- `timeweb_create_person` — type `person` / `org` / `ip`
- `timeweb_update_person` — contact details only (address, postcode, phone, email)
- `timeweb_delete_person`

Registration / prolongation / transfer:
- `timeweb_create_domain_request` — action `register` / `prolong` / `transfer` (creates an **unpaid** request)
- `timeweb_pay_domain_request` — pays it from the account balance (**spends money**)
- `timeweb_list_domain_requests`
- `timeweb_get_domain_request` — what was ordered and whether it is paid (carries no progress status)

## Install

    npm install
    npm run build

## Configure in an MCP client

    {
      "mcpServers": {
        "timeweb-cloud": {
          "command": "node",
          "args": ["/Users/konser/js/mcp-timeweb-cloud/dist/index.js"],
          "env": {
            "TIMEWEBCLOUD_TOKEN": "..."
          }
        }
      }
    }

The token is issued in the Timeweb Cloud control panel under **API & Integrations**.

## Notes

- Registration is a two-step, paid flow: `timeweb_create_domain_request` only creates the request; `timeweb_pay_domain_request` is what charges the balance and sends the order to the registrar. Confirm with the user before paying.
- `.ru` / `.рф`: period is limited to `P1Y`–`P3Y` and WHOIS privacy is unavailable. `timeweb_list_tlds` is authoritative — check `allowed_buy_periods` and `is_whois_privacy_enabled`.
- `timeweb_create_person` and `timeweb_create_domain_request` drop fields that do not belong to the chosen `type` / `action`, and reject the call locally when a required one is missing.
- The request object returned by `timeweb_create_domain_request` / `timeweb_get_domain_request` has no progress field — `money_source` only tells you whether it is paid. Registration progress is visible in `timeweb_list_domains`: `domain_status` `no_paid` → `paid`, `request_status` `registration_request` → `null`.
- DNS record bodies follow the v1 schema: `{ type, value, priority?, subdomain?, ttl? }`. Subdomain in the body is a label (`sub`), not an FQDN.

## Registering a domain

1. `timeweb_list_tlds` — price and allowed periods for the zone
2. `timeweb_check_domain` — is the FQDN free
3. `timeweb_list_persons` → if none suitable, `timeweb_create_person`
4. `timeweb_create_domain_request` with `action: "register"` → `request.id`
5. `timeweb_pay_domain_request` with that `request_id` — this spends money
6. `timeweb_list_domains` with `idn_name` — poll until `domain_status` is `paid` and `request_status` is `null` (usually under a minute)
