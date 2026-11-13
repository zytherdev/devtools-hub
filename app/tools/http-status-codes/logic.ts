import type { ToolOptions } from '@/app/tools/types'

export type StatusCategory = '1xx' | '2xx' | '3xx' | '4xx' | '5xx'
export type StatusCodeEntry = {
  code: number
  title: string
  description: string
  category: StatusCategory
  categoryLabel: string
}

export const MAX_QUERY_LENGTH = 100
const MAX_OPTIONS = 1
const CATEGORY_LABELS: Record<StatusCategory, string> = {
  '1xx': 'Informational',
  '2xx': 'Successful',
  '3xx': 'Redirection',
  '4xx': 'Client Error',
  '5xx': 'Server Error',
}

function entry(code: number, title: string, description: string): StatusCodeEntry {
  return {
    code,
    title,
    description,
    category: `${Math.floor(code / 100)}xx` as StatusCategory,
    categoryLabel: CATEGORY_LABELS[`${Math.floor(code / 100)}xx` as StatusCategory],
  }
}

/** Curated registry entries; this intentionally excludes unregistered and extension-only codes. */
export const STATUS_CODES: readonly StatusCodeEntry[] = [
  entry(100, 'Continue', 'The server has received the request headers and the client may continue sending the request body.'),
  entry(101, 'Switching Protocols', 'The server is switching protocols as requested by the client.'),
  entry(102, 'Processing', 'The server has accepted the request and is still processing it; no final response is available yet.'),
  entry(103, 'Early Hints', 'The server is sending preliminary response headers, often to help the client preload resources.'),

  entry(200, 'OK', 'The request succeeded.'),
  entry(201, 'Created', 'The request succeeded and created one or more resources.'),
  entry(202, 'Accepted', 'The request has been accepted for processing, but processing is not complete.'),
  entry(203, 'Non-Authoritative Information', 'The request succeeded, but the response metadata may come from a transforming proxy.'),
  entry(204, 'No Content', 'The request succeeded and there is no additional response content.'),
  entry(205, 'Reset Content', 'The request succeeded; the client should reset the document view that sent it.'),
  entry(206, 'Partial Content', 'The server is returning the requested range or ranges of a resource.'),
  entry(207, 'Multi-Status', 'The response reports the status of multiple independent operations, commonly in WebDAV.'),
  entry(208, 'Already Reported', 'The members of a WebDAV binding have already been reported in an earlier response.'),
  entry(226, 'IM Used', 'The server fulfilled a GET request using instance-manipulation results.'),

  entry(300, 'Multiple Choices', 'The request has more than one possible response, and the user or client may choose among them.'),
  entry(301, 'Moved Permanently', 'The resource has a new permanent URI; the response includes its preferred location.'),
  entry(302, 'Found', 'The resource is temporarily available at another URI.'),
  entry(303, 'See Other', 'The response points to another URI that the client should retrieve, typically with GET.'),
  entry(304, 'Not Modified', 'The cached representation is still valid, so the client can use its stored copy.'),
  entry(305, 'Use Proxy', 'The resource must be accessed through the proxy specified by the response; this status is deprecated.'),
  entry(307, 'Temporary Redirect', 'The resource is temporarily available at another URI, and the client must preserve the request method.'),
  entry(308, 'Permanent Redirect', 'The resource has a new permanent URI, and the client must preserve the request method.'),

  entry(400, 'Bad Request', 'The server cannot or will not process the request because it appears to contain a client error.'),
  entry(401, 'Unauthorized', 'The request lacks valid authentication credentials for the target resource.'),
  entry(402, 'Payment Required', 'Reserved for future use; some services use it for payment-related responses.'),
  entry(403, 'Forbidden', 'The server understood the request but refuses to fulfill it.'),
  entry(404, 'Not Found', 'The server cannot find the requested resource, or will not disclose that it exists.'),
  entry(405, 'Method Not Allowed', 'The request method is known but is not supported for the target resource.'),
  entry(406, 'Not Acceptable', 'The server cannot provide a response matching the representation preferences in the request.'),
  entry(407, 'Proxy Authentication Required', 'The client must authenticate with the proxy before the request can proceed.'),
  entry(408, 'Request Timeout', 'The server did not receive a complete request within the time it was prepared to wait.'),
  entry(409, 'Conflict', 'The request conflicts with the current state of the target resource.'),
  entry(410, 'Gone', 'The target resource is no longer available and that condition is likely to be permanent.'),
  entry(411, 'Length Required', 'The server refuses the request without a valid Content-Length header.'),
  entry(412, 'Precondition Failed', 'One or more request preconditions evaluated to false.'),
  entry(413, 'Content Too Large', 'The request content is larger than the server is willing or able to process.'),
  entry(414, 'URI Too Long', 'The target URI is longer than the server is willing to interpret.'),
  entry(415, 'Unsupported Media Type', 'The server refuses the request because its content format is not supported.'),
  entry(416, 'Range Not Satisfiable', 'The requested byte range cannot be supplied for the target resource.'),
  entry(417, 'Expectation Failed', 'The server cannot meet the expectations stated in the request Expect header.'),
  entry(418, "I'm a teapot", 'A humorous status code defined by the Hyper Text Coffee Pot Control Protocol.'),
  entry(421, 'Misdirected Request', 'The request was sent to a server that cannot produce an authoritative response for its target.'),
  entry(422, 'Unprocessable Content', 'The content type and syntax are understood, but the server cannot process the contained instructions.'),
  entry(423, 'Locked', 'The source or destination resource is locked; defined for WebDAV.'),
  entry(424, 'Failed Dependency', 'The requested action failed because it depended on another action that also failed; defined for WebDAV.'),
  entry(425, 'Too Early', 'The server is unwilling to risk processing a request that might be replayed.'),
  entry(426, 'Upgrade Required', 'The server refuses the request using the current protocol and asks the client to upgrade.'),
  entry(428, 'Precondition Required', 'The server requires a conditional request to help prevent lost updates.'),
  entry(429, 'Too Many Requests', 'The client has sent too many requests in a given amount of time.'),
  entry(431, 'Request Header Fields Too Large', 'The server refuses to process the request because its header fields are too large.'),
  entry(451, 'Unavailable For Legal Reasons', 'The server cannot provide the resource because of a legal demand.'),

  entry(500, 'Internal Server Error', 'The server encountered an unexpected condition that prevented it from fulfilling the request.'),
  entry(501, 'Not Implemented', 'The server does not support the functionality required to fulfill the request.'),
  entry(502, 'Bad Gateway', 'A server acting as a gateway or proxy received an invalid response from an upstream server.'),
  entry(503, 'Service Unavailable', 'The server is temporarily unable to handle the request, often because of overload or maintenance.'),
  entry(504, 'Gateway Timeout', 'A server acting as a gateway or proxy did not receive a timely response from an upstream server.'),
  entry(505, 'HTTP Version Not Supported', 'The server does not support the HTTP version used in the request.'),
  entry(506, 'Variant Also Negotiates', 'The server has an internal configuration error in transparent content negotiation.'),
  entry(507, 'Insufficient Storage', 'The server cannot store the representation needed to complete the request; defined for WebDAV.'),
  entry(508, 'Loop Detected', 'The server detected an infinite loop while processing a request; defined for WebDAV.'),
  entry(510, 'Not Extended', 'The request requires further extensions that the server does not support.'),
  entry(511, 'Network Authentication Required', 'The client needs to authenticate to gain network access; commonly used by intercepting proxies.'),
]

export type SearchOptions = { category?: string }

function validateOptions(options: ToolOptions | SearchOptions = {}): StatusCategory | 'all' {
  if (options === null || typeof options !== 'object' || Array.isArray(options)) {
    throw new Error('Options must be an object.')
  }
  const keys = Object.keys(options)
  if (keys.length > MAX_OPTIONS || keys.some(key => key !== 'category')) {
    throw new Error('Only the category option is supported.')
  }
  const category = (options as SearchOptions).category ?? 'all'
  if (typeof category !== 'string' || !['all', '1xx', '2xx', '3xx', '4xx', '5xx'].includes(category)) {
    throw new Error('Category must be all, 1xx, 2xx, 3xx, 4xx, or 5xx.')
  }
  return category as StatusCategory | 'all'
}

export function validateQuery(query: unknown): string {
  if (typeof query !== 'string') throw new Error('Search query must be text.')
  const normalized = query.trim()
  if (normalized.length === 0) throw new Error('Enter a status code or search term.')
  if (normalized.length > MAX_QUERY_LENGTH) throw new Error(`Search query must be ${MAX_QUERY_LENGTH} characters or fewer.`)
  if (/[\u0000-\u001f\u007f-\u009f]/u.test(normalized)) throw new Error('Search query cannot contain control characters.')
  if (/^\d+$/u.test(normalized) && !/^[1-5]\d{2}$/u.test(normalized)) {
    throw new Error('Numeric status code queries must be between 100 and 599.')
  }
  return normalized
}

export function searchStatusCodes(query: unknown, options: ToolOptions | SearchOptions = {}): StatusCodeEntry[] {
  const normalized = validateQuery(query)
  const category = validateOptions(options)
  const exactCode = /^\d{3}$/u.test(normalized) ? Number(normalized) : null
  const needle = normalized.toLocaleLowerCase('en-US')
  return STATUS_CODES.filter(item => {
    if (category !== 'all' && item.category !== category) return false
    if (exactCode !== null) return item.code === exactCode
    return `${item.code} ${item.title} ${item.description} ${item.category} ${item.categoryLabel}`
      .toLocaleLowerCase('en-US')
      .includes(needle)
  })
}

export function run(input: string, options: ToolOptions = {}): string {
  const results = searchStatusCodes(input, options)
  return JSON.stringify({
    query: input.trim(),
    category: options.category ?? 'all',
    total: results.length,
    results,
  }, null, 2)
}
