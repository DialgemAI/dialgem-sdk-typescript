/**
 * Cursor pagination, as used by `GET /v1/calls`.
 *
 * `list()` returns a `PagePromise`, which is both awaitable (one page) and
 * async-iterable (every item across pages):
 *
 *   const page = await client.calls.list({ limit: 50 })
 *   for await (const call of client.calls.list({ status: "completed" })) { ... }
 *
 * Pages are keyset-based, so walking them is stable while new calls arrive: no
 * call is skipped or repeated because another one started mid-walk.
 */
import { DialgemError } from "./errors.js"

export interface PageData<T> {
  data: T[]
  has_more: boolean
  /** Pass to the next request to continue; `null` on the last page. */
  pagination_key: string | null
}

export type PageFetcher<T> = (paginationKey: string | null) => Promise<PageData<T>>

export class Page<T> implements PageData<T> {
  readonly data: T[]
  readonly has_more: boolean
  readonly pagination_key: string | null
  readonly #fetchPage: PageFetcher<T>

  constructor(data: PageData<T>, fetchPage: PageFetcher<T>) {
    this.data = data.data
    this.has_more = data.has_more
    this.pagination_key = data.pagination_key
    this.#fetchPage = fetchPage
  }

  hasNextPage(): boolean {
    return this.has_more && this.pagination_key !== null
  }

  async getNextPage(): Promise<Page<T>> {
    if (!this.hasNextPage()) throw new DialgemError("No next page; check hasNextPage() first.")
    return new Page(await this.#fetchPage(this.pagination_key), this.#fetchPage)
  }
}

export class PagePromise<T> implements PromiseLike<Page<T>>, AsyncIterable<T> {
  readonly #fetchPage: PageFetcher<T>
  readonly #startKey: string | null
  #first: Promise<Page<T>> | undefined

  constructor(fetchPage: PageFetcher<T>, startKey: string | null = null) {
    this.#fetchPage = fetchPage
    this.#startKey = startKey
  }

  #firstPage(): Promise<Page<T>> {
    // Lazy and memoised: nothing is sent until awaited or iterated, and awaiting
    // then iterating the same PagePromise does not refetch page one.
    this.#first ??= this.#fetchPage(this.#startKey).then((data) => new Page(data, this.#fetchPage))
    return this.#first
  }

  then<R1 = Page<T>, R2 = never>(
    onfulfilled?: ((value: Page<T>) => R1 | PromiseLike<R1>) | null,
    onrejected?: ((reason: unknown) => R2 | PromiseLike<R2>) | null,
  ): Promise<R1 | R2> {
    return this.#firstPage().then(onfulfilled, onrejected)
  }

  catch<R = never>(onrejected?: ((reason: unknown) => R | PromiseLike<R>) | null): Promise<Page<T> | R> {
    return this.#firstPage().catch(onrejected)
  }

  finally(onfinally?: (() => void) | null): Promise<Page<T>> {
    return this.#firstPage().finally(onfinally)
  }

  async *[Symbol.asyncIterator](): AsyncIterator<T> {
    let page: Page<T> = await this.#firstPage()
    for (;;) {
      yield* page.data
      if (!page.hasNextPage()) return
      page = await page.getNextPage()
    }
  }
}
