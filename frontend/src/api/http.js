import axios from 'axios';

/** HTTP contract shared by all Model-layer API repositories. */
export class HttpError extends Error {
  constructor(status, message, fields = {}) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.fields = fields;
  }
}

export function validateApiBaseUrl(baseUrl) {
  const url = new URL(baseUrl);
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.search || url.hash || (url.pathname !== '/' && url.pathname !== '')) {
    throw new Error('Endereço da API inválido.');
  }
  if (typeof location !== 'undefined' && location.protocol === 'https:' && url.protocol !== 'https:') {
    throw new Error('A API deve usar HTTPS nesta página.');
  }
  return url.origin;
}

function messageForStatus(status) {
  if (status === 401) return 'Sessão necessária ou expirada.';
  if (status === 403) return 'Acesso negado.';
  if (status === 404) return 'Recurso não disponível.';
  if (status === 409) return 'A operação encontrou um conflito no sistema.';
  return `Não foi possível consultar o sistema (HTTP ${status}).`;
}

function errorFields(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return {};
  return Object.fromEntries(Object.entries(body).filter(([key, value]) =>
    typeof value === 'string' && /^[a-zA-Z][a-zA-Z0-9]{0,50}$/.test(key) && !['message', 'trace', 'stack', 'error', 'sql', 'detail'].includes(key)
  ));
}

/**
 * Fetch injection is retained ONLY for existing unit tests/isolated integrations.
 * Actual network traffic uses the Axios adapter by default.
 */
function injectedFetchAdapter(request) {
  return async (config) => {
    const response = await request(config.url, {
      method: config.method.toUpperCase(),
      headers: config.headers?.toJSON?.() ?? config.headers,
      ...(config.data !== undefined ? { body: config.data } : {}),
      credentials: 'omit',
      signal: config.signal,
    });
    return {
      data: response.status === 204 ? '' : await response.text(),
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      config,
      request: null,
    };
  };
}

export async function requestJson(baseUrl, path, options = {}, signal, request) {
  const base = validateApiBaseUrl(baseUrl);
  if (!path.startsWith('/') || path.startsWith('//')) throw new Error('Caminho da API inválido.');
  const url = new URL(`${base}${path}`);
  for (const [key, value] of Object.entries(options.query ?? {})) {
    if (value !== undefined && value !== null) url.searchParams.set(key, String(value));
  }
  const hasBody = options.body !== undefined;
  let response;
  try {
    response = await axios.request({
      url: url.toString(),
      method: options.method ?? 'GET',
      headers: { Accept: 'application/json', ...(hasBody ? { 'Content-Type': 'application/json' } : {}), ...options.headers },
      ...(hasBody ? { data: JSON.stringify(options.body) } : {}),
      signal,
      withCredentials: false,
      responseType: 'text',
      transformResponse: [(data) => data],
      validateStatus: () => true,
      ...(request ? { adapter: injectedFetchAdapter(request) } : {}),
    });
  } catch (error) {
    if (axios.isCancel(error) || signal?.aborted) throw error;
    throw new HttpError(0, 'Não foi possível conectar ao sistema.');
  }
  if (response.status === 204) return null;
  let body;
  try {
    body = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
  } catch {
    throw new HttpError(response.status, response.status >= 200 && response.status < 300
      ? 'Resposta inesperada do sistema.' : messageForStatus(response.status));
  }
  if (response.status < 200 || response.status >= 300) {
    throw new HttpError(response.status, messageForStatus(response.status), errorFields(body));
  }
  return body;
}

export function getJson(baseUrl, path, signal, request) {
  return requestJson(baseUrl, path, { method: 'GET' }, signal, request);
}
