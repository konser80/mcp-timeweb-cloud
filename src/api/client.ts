import axios, { AxiosError, AxiosInstance } from "axios";
import { fromAxiosError } from "../utils/errors.js";

const BASE_URL = "https://api.timeweb.cloud";

export type DnsType = "A" | "AAAA" | "MX" | "CNAME" | "TXT" | "SRV";

export interface DnsRecordBody {
  type: DnsType;
  value: string;
  subdomain?: string;
  priority?: number;
  ttl?: number;
}

export interface NameServerInput {
  host: string;
  ips?: string[];
}

export type DomainRequestAction = "register" | "prolong" | "transfer";

export type DomainPaymentPeriod =
  | "P1Y" | "P2Y" | "P3Y" | "P4Y" | "P5Y"
  | "P6Y" | "P7Y" | "P8Y" | "P9Y" | "P10Y";

export type DomainPrimeType = "extra" | "premium" | "optimal" | "maximal";

export interface DomainRequestBody {
  action: DomainRequestAction;
  fqdn: string;
  person_id?: number;
  period?: DomainPaymentPeriod;
  is_autoprolong_enabled?: boolean;
  is_whois_privacy_enabled?: boolean;
  is_antispam_enabled?: boolean;
  prime?: DomainPrimeType;
  auth_code?: string;
}

export interface ListPersonsParams {
  limit?: number;
  offset?: number;
  is_closed?: boolean;
}

export interface ListTldsParams {
  is_published?: boolean;
  is_registered?: boolean;
}

export interface UpdatePersonBody {
  address: string;
  email: string;
  phone: string;
  postcode: string;
}

export interface ListDomainsParams {
  limit?: number;
  offset?: number;
  idn_name?: string;
  linked_ip?: string;
  order?: string;
  sort?: string;
}

/** V1 rejects a record body with no `subdomain` ("Bad subdomain name"), even at
 *  the apex — the field is the record NAME, not a label: it takes either a
 *  relative label (`www`) or the zone itself for an apex record. */
function withRecordName(fqdn: string, body: DnsRecordBody): DnsRecordBody {
  return body.subdomain === undefined ? { ...body, subdomain: fqdn } : body;
}

export class TimewebCloudClient {
  private readonly http: AxiosInstance;

  constructor(token: string) {
    this.http = axios.create({
      baseURL: BASE_URL,
      timeout: 30000,
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });

    this.http.interceptors.response.use(
      (r) => r,
      (err: AxiosError) => {
        throw fromAxiosError(err);
      }
    );
  }

  private async req<T>(
    method: "get" | "post" | "put" | "patch" | "delete",
    url: string,
    opts: { data?: unknown; params?: Record<string, unknown> } = {}
  ): Promise<T> {
    const params = opts.params
      ? Object.fromEntries(
          Object.entries(opts.params).filter(([, v]) => v !== undefined)
        )
      : undefined;
    const res = await this.http.request<T>({
      method,
      url,
      data: opts.data,
      params,
    });
    return res.data;
  }

  // --- Domains ---

  listDomains(params: ListDomainsParams = {}): Promise<unknown> {
    return this.req("get", "/api/v1/domains", { params: { ...params } });
  }

  getDomain(fqdn: string): Promise<unknown> {
    return this.req("get", `/api/v1/domains/${encodeURIComponent(fqdn)}`);
  }

  addDomain(fqdn: string): Promise<unknown> {
    return this.req("post", `/api/v1/add-domain/${encodeURIComponent(fqdn)}`);
  }

  deleteDomain(fqdn: string): Promise<unknown> {
    return this.req("delete", `/api/v1/domains/${encodeURIComponent(fqdn)}`);
  }

  checkDomain(fqdn: string): Promise<unknown> {
    return this.req("get", `/api/v1/check-domain/${encodeURIComponent(fqdn)}`);
  }

  setAutoProlongation(fqdn: string, isAutoprolongEnabled: boolean): Promise<unknown> {
    return this.req("patch", `/api/v1/domains/${encodeURIComponent(fqdn)}`, {
      data: { is_autoprolong_enabled: isAutoprolongEnabled },
    });
  }

  // --- Subdomains ---

  addSubdomain(fqdn: string, subdomainFqdn: string): Promise<unknown> {
    return this.req(
      "post",
      `/api/v1/domains/${encodeURIComponent(fqdn)}/subdomains/${encodeURIComponent(subdomainFqdn)}`
    );
  }

  deleteSubdomain(fqdn: string, subdomainFqdn: string): Promise<unknown> {
    return this.req(
      "delete",
      `/api/v1/domains/${encodeURIComponent(fqdn)}/subdomains/${encodeURIComponent(subdomainFqdn)}`
    );
  }

  // --- DNS records ---

  getDnsRecords(fqdn: string, limit?: number, offset?: number): Promise<unknown> {
    return this.req(
      "get",
      `/api/v1/domains/${encodeURIComponent(fqdn)}/dns-records`,
      { params: { limit, offset } }
    );
  }

  getDefaultDnsRecords(fqdn: string): Promise<unknown> {
    return this.req(
      "get",
      `/api/v1/domains/${encodeURIComponent(fqdn)}/default-dns-records`
    );
  }

  createDnsRecord(fqdn: string, body: DnsRecordBody): Promise<unknown> {
    return this.req(
      "post",
      `/api/v1/domains/${encodeURIComponent(fqdn)}/dns-records`,
      { data: withRecordName(fqdn, body) }
    );
  }

  updateDnsRecord(
    fqdn: string,
    recordId: number,
    body: DnsRecordBody
  ): Promise<unknown> {
    return this.req(
      "patch",
      `/api/v1/domains/${encodeURIComponent(fqdn)}/dns-records/${recordId}`,
      { data: withRecordName(fqdn, body) }
    );
  }

  deleteDnsRecord(fqdn: string, recordId: number): Promise<unknown> {
    return this.req(
      "delete",
      `/api/v1/domains/${encodeURIComponent(fqdn)}/dns-records/${recordId}`
    );
  }

  // --- Name servers ---

  getNameServers(fqdn: string): Promise<unknown> {
    return this.req(
      "get",
      `/api/v1/domains/${encodeURIComponent(fqdn)}/name-servers`
    );
  }

  updateNameServers(fqdn: string, nameServers: NameServerInput[]): Promise<unknown> {
    return this.req(
      "put",
      `/api/v1/domains/${encodeURIComponent(fqdn)}/name-servers`,
      { data: { name_servers: nameServers } }
    );
  }

  // --- Domain zones (TLDs) ---

  listTlds(params: ListTldsParams = {}): Promise<unknown> {
    return this.req("get", "/api/v1/tlds", { params: { ...params } });
  }

  getTld(tldId: number): Promise<unknown> {
    return this.req("get", `/api/v1/tlds/${tldId}`);
  }

  // --- Domain admins (persons) ---

  listPersons(params: ListPersonsParams = {}): Promise<unknown> {
    return this.req("get", "/api/v1/persons", { params: { ...params } });
  }

  getPerson(personId: number): Promise<unknown> {
    return this.req("get", `/api/v1/persons/${personId}`);
  }

  createPerson(body: Record<string, unknown>): Promise<unknown> {
    return this.req("post", "/api/v1/persons", { data: body });
  }

  updatePerson(personId: number, body: UpdatePersonBody): Promise<unknown> {
    return this.req("put", `/api/v1/persons/${personId}`, { data: body });
  }

  deletePerson(personId: number): Promise<unknown> {
    return this.req("delete", `/api/v1/persons/${personId}`);
  }

  // --- Domain requests (registration / prolongation / transfer) ---

  listDomainRequests(personId?: number): Promise<unknown> {
    return this.req("get", "/api/v1/domains-requests", {
      params: { person_id: personId },
    });
  }

  getDomainRequest(requestId: number): Promise<unknown> {
    return this.req("get", `/api/v1/domains-requests/${requestId}`);
  }

  createDomainRequest(body: DomainRequestBody): Promise<unknown> {
    return this.req("post", "/api/v1/domains-requests", { data: body });
  }

  payDomainRequest(requestId: number, personId?: number): Promise<unknown> {
    return this.req("patch", `/api/v1/domains-requests/${requestId}`, {
      data: { money_source: "use", person_id: personId },
    });
  }
}
