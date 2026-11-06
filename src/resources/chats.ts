import type { Query, RequestOptions } from "../core/http.js"
import { PagePromise, type PageData } from "../core/pagination.js"
import type {
  Chat,
  ChatCreateParams,
  ChatDeleteResponse,
  ChatListParams,
  ChatReply,
  ChatUpdateParams,
} from "../types/chat.js"
import { APIResource, path } from "./resource.js"

interface ChatListEnvelope {
  chats: Chat[]
  has_more: boolean
  pagination_key: string | null
}

/**
 * Text conversations with one of your agents, from your backend.
 *
 *   const chat = await dialgem.chats.create({ agent_id, dynamic_variables: { customer: "Ada" } })
 *   const { messages } = await dialgem.chats.sendMessage(chat.id, "Can I come in on Tuesday?")
 *   await dialgem.chats.end(chat.id)
 *
 * The agent is the one that answers your phone: same prompt, model and functions. Prompt agents only; an agent
 * that keeps no transcript cannot chat. Your API key stays on your server; to put a chat box on a web page,
 * have your backend call `sendMessage` for the visitor.
 */
export class Chats extends APIResource {
  /**
   * Start a chat. If the agent has a first message it is already in `messages`.
   *
   * `UnprocessableEntityError` with `errCode` `agent_type_not_supported` (flow agents) or `chat_requires_storage`.
   * Not retried by default.
   */
  create(body: ChatCreateParams, options?: RequestOptions): Promise<Chat> {
    return this._client.post("/v1/chats", body, options)
  }

  /**
   * Chats, newest first. Await for one page, or iterate for every chat. Entries leave out `messages`;
   * `retrieve` a chat for them.
   */
  list(params: ChatListParams = {}, options?: RequestOptions): PagePromise<Chat> {
    const fetchPage = async (paginationKey: string | null): Promise<PageData<Chat>> => {
      const res = await this._client.get<ChatListEnvelope>(
        "/v1/chats",
        { ...(params as Query), pagination_key: paginationKey ?? undefined },
        options,
      )
      return { data: res.chats, has_more: res.has_more, pagination_key: res.pagination_key }
    }
    return new PagePromise(fetchPage)
  }

  /** One chat with all its messages. */
  retrieve(chatId: string, options?: RequestOptions): Promise<Chat> {
    return this._client.get(path`/v1/chats/${chatId}`, undefined, options)
  }

  /** Replace the chat's `metadata` (the whole object). */
  update(chatId: string, body: ChatUpdateParams, options?: RequestOptions): Promise<Chat> {
    return this._client.patch(path`/v1/chats/${chatId}`, body, options)
  }

  /** Delete a chat and its messages. */
  delete(chatId: string, options?: RequestOptions): Promise<ChatDeleteResponse> {
    return this._client.delete(path`/v1/chats/${chatId}`, options)
  }

  /**
   * Send the user's message and wait for the agent's reply. Returns only the new entries, in order: the user's
   * message, any tool use, the agent's reply.
   *
   * If the agent's model fails (`ServerError`, `errCode` `model_error`) nothing is stored and the same message
   * can be sent again. `ConflictError` with `errCode` `chat_busy` while another reply is in progress,
   * `chat_ended` after the end, `message_limit` at the cap. If the agent calls its end-call tool, the reply's
   * `chat_status` is `ended`.
   *
   * Not retried by default: a retry after an ambiguous failure could send the message twice.
   */
  sendMessage(chatId: string, content: string, options?: RequestOptions): Promise<ChatReply> {
    return this._client.post(path`/v1/chats/${chatId}/messages`, { content }, options)
  }

  /** End the chat. Ending twice is fine. The analysis arrives a moment later; read it with `retrieve`. */
  end(chatId: string, options?: RequestOptions): Promise<Chat> {
    return this._client.post(path`/v1/chats/${chatId}/end`, undefined, options)
  }

  /**
   * Analyse an ended chat again with the agent's current analysis settings and return it. `ConflictError` with
   * `errCode` `chat_in_progress` until it has ended, `no_transcript` when it has no messages.
   */
  rerunAnalysis(chatId: string, options?: RequestOptions): Promise<Chat> {
    return this._client.post(path`/v1/chats/${chatId}/rerun-analysis`, undefined, options)
  }
}
