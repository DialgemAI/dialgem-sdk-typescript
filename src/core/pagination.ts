/**
 * Page-based pagination, the only style the API uses today (`GET /v1/calls`:
 * `page` ≥ 1, `page_size` ≤ 100, envelope carrying `total`).
 *
 * `list()` returns a `PagePromise`, which is both awaitable (one page) and
 * async-iterable (every item across pages):
 *
 *   const first = await client.calls.list({ page_size: 50 })
 *   for await (const call of client.calls.list({ status: "completed" })) { ... }
 *
 * Offset pages are not a snapshot. Calls are ordered newest-first, so a call that
 * starts mid-iteration shifts later pages by one and the iterator can yield a
 * call twice. De-duplicate on `id` when that matters.
 */
import { DialgemError } from "./errors.js"

export interface PageFetcher<T> {
  (page: number): Promise<PageData<T>>
}

export interface PageData<T> {
  data: T[]
  total: number
  page: number
  page_size: number
}

export class Page<T> implements PageData<T> {
  readonly data: T[]
  readonly total: number
  readonly page: number
  readonly page_size: number
  readonly #fetchPage: PageFetcher<T>

  constructor(data: PageData<T>, fetchPage: PageFetcher<T>) {
    this.data = data.data
    this.total = data.total
    this.page = data.page
    this.page_size = data.page_size
    this.#fetchPage = fetchPage
  }

  hasNextPage(): boolean {
    return this.data.length > 0 && this.page * this.page_size < this.total
  }

  async getNextPage(): Promise<Page<T>> {
    if (!this.hasNextPage()) throw new DialgemError("No next page; check hasNextPage() first.")
    return new Page(await this.#fetchPage(this.page + 1), this.#fetchPage)
  }
}

export class PagePromise<T> implements PromiseLike<Page<T>>, AsyncIterable<T> {
  readonly #fetchPage: PageFetcher<T>
  readonly #startPage: number
  #first: Promise<Page<T>> | undefined

  constructor(fetchPage: PageFetcher<T>, startPage: number) {
    this.#fetchPage = fetchPage
    this.#startPage = startPage
  }

  #firstPage(): Promise<Page<T>> {
    // Lazy and memoised: nothing is sent until awaited or iterated, and awaiting
    // then iterating the same PagePromise does not refetch page one.
    this.#first ??= this.#fetchPage(this.#startPage).then((data) => new Page(data, this.#fetchPage))
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
