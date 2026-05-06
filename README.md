# timeweb-cloud-mcp-server

MCP server for the [Timeweb Cloud API](https://timeweb.cloud/api-docs). Manages domains, subdomains, DNS records, and name-servers.

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

- Domain registration / renewal / transfer endpoints (`/api/v1/domains-requests`) are intentionally **not** exposed — they are paid actions and need contact data; do them via the control panel.
- TLD reference endpoints (`/api/v1/tlds`) are not exposed.
- DNS record bodies follow the v1 schema: `{ type, value, priority?, subdomain?, ttl? }`. Subdomain in the body is a label (`sub`), not an FQDN.
