# Changelog

## 0.1.0-beta.0 (unreleased)

The first release.

- `Dialgem` client authenticated with an organization API key (`X-API-Key`).
- Resources:
  - `agents`, with its `functions`, `knowledge` and `mcpServers` sub-resources
  - `calls`: `list`, `retrieve`, `createPhoneCall`, `register`
  - `phoneNumbers`, `voices`, `flowTemplates`, `promptTemplates`
- Webhooks: `Dialgem.webhooks.verify` and `constructEvent` check HMAC-SHA256 signatures and return typed events.
- Typed errors carrying `errCode`, `requestId` and `issues`.
- Retries with backoff on GET, PATCH and DELETE, honoring `Retry-After`. POST is never retried by default.
- `calls.list()` pagination: `await` it for one page, or iterate with `for await` across all pages.
- Request-body types generated from the agent service's OpenAPI schema.
