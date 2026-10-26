export class HttpError extends Error {
  constructor(public status: number, message: string, public fields: Record<string, string> = {}) {
    super(message);
    this.name = 'HttpError';
  }
}
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
export interface JsonRequest {
  method?: HttpMethod;
  query?: Record<string, string | number | boolean | null | undefined>;
  body?: unknown;
  signal?: AbortSignal;
  knownFields?: readonly string[];
}

// Public only: credentials require an approved backend session contract.
export function validateApiBaseUrl(baseUrl: string, pageProtocol = typeof location === 'undefined' ? undefined : location.protocol): string {
  let url: URL;
  try { url = new URL(baseUrl); } catch { throw new Error('URL da API inválida.'); }
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.search || url.hash
    || (pageProtocol === 'https:' && url.protocol !== 'https:')) throw new Error('URL da API inválida.');
  return url.href.replace(/\/$/, '');
}
function errorMessage(status: number): string {
  if (status === 401) return 'Consulta não autorizada pelo sistema. Sessão necessária ou expirada.';
  if (status === 403) return 'Consulta não autorizada pelo sistema. Acesso negado.';
  if (status === 404) return 'Recurso não disponível no sistema.';
  if (status === 409) return 'A operação encontrou um conflito no sistema. Atualize a consulta e revise suas escolhas.';
  if (status === 400) return 'Confira os campos indicados antes de continuar.';
  return `Não foi possível consultar o sistema (HTTP ${status}).`;
}

// DTO validation belongs to domain adapters.
export async function requestJson(baseUrl: string, path: string, options: JsonRequest = {}, request: typeof fetch = fetch): Promise<unknown> {
  const base = validateApiBaseUrl(baseUrl);
  if (!path.startsWith('/') || path.startsWith('//') || /[\\?#]/.test(path) || path.split('/').some(part => part === '..' || part === '.')) throw new Error('Caminho da API inválido.');
  const url = new URL(`${base}${path}`);
  if (url.origin !== new URL(base).origin) throw new Error('Caminho da API inválido.');
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(options.query || {})) if (value !== null && value !== undefined) query.set(key, String(value));
  url.search = query.toString();
  const method = options.method || 'GET';
  if (method === 'GET' && options.body !== undefined) throw new Error('GET não aceita corpo JSON.');
  const response = await request(url.href, {
    method, headers: { Accept: 'application/json', ...(options.body !== undefined ? { 'Content-Type': 'application/json' } : {}) },
    credentials: 'omit', signal: options.signal,
    ...(options.body !== undefined ? { body: JSON.stringify(options.body) } : {}),
  });
  if (response.status === 204) return null;
  let body: unknown;
  try { body = await response.json(); } catch {
    throw new HttpError(response.status, response.ok ? 'Resposta inesperada do sistema.' : errorMessage(response.status));
  }
  if (!response.ok) {
    const object = body && typeof body === 'object' && !Array.isArray(body) ? body as Record<string, unknown> : {};
    const map = object.fields && typeof object.fields === 'object' && !Array.isArray(object.fields) ? object.fields as Record<string, unknown> : object;
    // Never echo server diagnostics, even from a whitelisted field.
    const fields = response.status === 400 ? Object.fromEntries((options.knownFields || []).filter(key => typeof map[key] === 'string').map(key => [key, 'Confira este campo.'])) : {};
    throw new HttpError(response.status, errorMessage(response.status), fields);
  }
  return body;
}
export function getJson(baseUrl: string, path: string, signal?: AbortSignal, request: typeof fetch = fetch): Promise<unknown> {
  return requestJson(baseUrl, path, { signal }, request);
}
