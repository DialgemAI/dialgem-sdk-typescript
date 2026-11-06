import type { Query, RequestOptions } from "../core/http.js"
import { PagePromise, type PageData } from "../core/pagination.js"
import type {
  Contact,
  ContactCallList,
  ContactCreateParams,
  ContactCsvInspection,
  ContactDeleteResponse,
  ContactImport,
  ContactImportCreateParams,
  ContactImportErrors,
  ContactImportList,
  ContactListCreateParams,
  ContactListDeleteResponse,
  ContactListMemberRemoveResponse,
  ContactListMembersAddResponse,
  ContactListParams,
  ContactListRecord,
  ContactListUpdateParams,
  ContactUpdateParams,
} from "../types/contact.js"
import { APIResource, path } from "./resource.js"
import type { HttpClient } from "../core/http.js"

interface ContactListEnvelope {
  contacts: Contact[]
  total: number
  next_cursor: string | null
}

/**
 * The people your organization calls. A phone number identifies each one: it is stored
 * in international form however you write it, and each number can be a contact once.
 */
export class Contacts extends APIResource {
  /** Bulk import from CSV, with a dry-run preview. */
  readonly imports: ContactImports

  constructor(client: HttpClient) {
    super(client)
    this.imports = new ContactImports(client)
  }

  /**
   * Add a contact. `phone` is any way of writing a valid number; without a leading `+`
   * also pass `default_country` (`"US"`). A number that is already a contact answers 409
   * with its `contact_id`.
   */
  create(body: ContactCreateParams, options?: RequestOptions): Promise<Contact> {
    return this._client.post("/v1/contacts", body, options)
  }

  /**
   * Contacts, newest first. Await for one page, or iterate for every contact:
   *
   */
  list(params: ContactListParams = {}, options?: RequestOptions): PagePromise<Contact> {
    const fetchPage = async (cursor: string | null): Promise<PageData<Contact>> => {
      const res = await this._client.get<ContactListEnvelope>(
        "/v1/contacts",
        { ...(params as Query), cursor: cursor ?? undefined },
        options,
      )
      return { data: res.contacts, has_more: res.next_cursor !== null, pagination_key: res.next_cursor }
    }
    return new PagePromise(fetchPage)
  }

  /**
   * The contact with this phone number. The number is matched as E.164, so
   * `("(212) 220-0001", { default_country: "US" })` finds `+12122200001`. Throws
   * `NotFoundError` if you have no such contact, and `UnprocessableEntityError` if the text is
   * not a phone number.
   */
  retrieveByPhone(phone: string, params: { default_country?: string | undefined } = {}, options?: RequestOptions): Promise<Contact> {
    return this._client.get(path`/v1/contacts/by-phone/${phone}`, params as Query, options)
  }

  /** One contact, with its lists and how many calls it has had. */
  retrieve(contactId: string, options?: RequestOptions): Promise<Contact> {
    return this._client.get(path`/v1/contacts/${contactId}`, undefined, options)
  }

  /**
   * Partial update: only the fields you send change, and `null` clears a field.
   * `attributes` replaces the whole set, so send every field you want kept.
   */
  update(contactId: string, body: ContactUpdateParams, options?: RequestOptions): Promise<Contact> {
    return this._client.patch(path`/v1/contacts/${contactId}`, body, options)
  }

  /**
   * Erase a contact and its list memberships. Calls already made stay in the call log, and
   * a do-not-call entry for the number stays too, so forgetting a person never makes a number
   * that asked not to be called dialable again.
   */
  delete(contactId: string, options?: RequestOptions): Promise<ContactDeleteResponse> {
    return this._client.delete(path`/v1/contacts/${contactId}`, options)
  }

  /** Calls to or from the contact's number, newest first. Summaries, not transcripts. */
  calls(contactId: string, params: { limit?: number | undefined } = {}, options?: RequestOptions): Promise<ContactCallList> {
    return this._client.get(path`/v1/contacts/${contactId}/calls`, params as Query, options)
  }

}

/**
 * CSV import runs in the background. Typical flow: `inspect` to see the columns, `create`
 * with `dry_run: true`, poll `retrieve` until `previewed`, look at the counts (and `errors`),
 * then `commit` and poll until `completed`.
 *
 * The CSV text is sent in the request. Downloading the rejected rows as a CSV, and exporting
 * contacts, are available over the REST API (`GET /v1/contacts/imports/{id}/errors?format=csv`,
 * `GET /v1/contacts/export`).
 */
export class ContactImports extends APIResource {
  /** The file's headers, a guessed column mapping and a few rows. Imports nothing. */
  inspect(csv: string, options?: RequestOptions): Promise<ContactCsvInspection> {
    return this._client.post("/v1/contacts/imports/inspect", { csv }, options)
  }

  /**
   * Start an import. Without `mapping` the columns are guessed from the headers. With
   * `dry_run: true` nothing is written: the import only validates and reports.
   */
  create(body: ContactImportCreateParams, options?: RequestOptions): Promise<ContactImport> {
    return this._client.post("/v1/contacts/imports", body, options)
  }

  /** Recent imports, newest first. */
  list(options?: RequestOptions): Promise<ContactImportList> {
    return this._client.get("/v1/contacts/imports", undefined, options)
  }

  /** Progress and counts. */
  retrieve(importId: string, options?: RequestOptions): Promise<ContactImport> {
    return this._client.get(path`/v1/contacts/imports/${importId}`, undefined, options)
  }

  /** The rows that were rejected, with the line, the reason and what each held. */
  errors(importId: string, params: { limit?: number | undefined } = {}, options?: RequestOptions): Promise<ContactImportErrors> {
    return this._client.get(path`/v1/contacts/imports/${importId}/errors`, params as Query, options)
  }

  /** Apply a previewed import: the file is read again, so what is applied is what was previewed. */
  commit(importId: string, options?: RequestOptions): Promise<ContactImport> {
    return this._client.post(path`/v1/contacts/imports/${importId}/commit`, undefined, options)
  }

  /** Stop an import that has not finished. Contacts a running import already wrote stay. */
  cancel(importId: string, options?: RequestOptions): Promise<ContactImport> {
    return this._client.delete(path`/v1/contacts/imports/${importId}`, options)
  }
}

/** Named groups of contacts. Deleting a list never deletes its contacts. */
export class ContactLists extends APIResource {
  list(options?: RequestOptions): Promise<{ lists: ContactListRecord[] }> {
    return this._client.get("/v1/contact-lists", undefined, options)
  }

  /** Names are unique within your organization, ignoring case. */
  create(body: ContactListCreateParams, options?: RequestOptions): Promise<ContactListRecord> {
    return this._client.post("/v1/contact-lists", body, options)
  }

  retrieve(listId: string, options?: RequestOptions): Promise<ContactListRecord> {
    return this._client.get(path`/v1/contact-lists/${listId}`, undefined, options)
  }

  update(listId: string, body: ContactListUpdateParams, options?: RequestOptions): Promise<ContactListRecord> {
    return this._client.patch(path`/v1/contact-lists/${listId}`, body, options)
  }

  delete(listId: string, options?: RequestOptions): Promise<ContactListDeleteResponse> {
    return this._client.delete(path`/v1/contact-lists/${listId}`, options)
  }

  /** Add up to 1000 of your contacts. Already-members are ignored; `added` says how many were new. */
  addContacts(listId: string, contactIds: string[], options?: RequestOptions): Promise<ContactListMembersAddResponse> {
    return this._client.post(path`/v1/contact-lists/${listId}/members`, { contact_ids: contactIds }, options)
  }

  removeContact(listId: string, contactId: string, options?: RequestOptions): Promise<ContactListMemberRemoveResponse> {
    return this._client.delete(path`/v1/contact-lists/${listId}/members/${contactId}`, options)
  }
}
