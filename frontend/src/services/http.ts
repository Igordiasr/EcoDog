export class HttpError extends Error {
  constructor(public status: number, message: string, public fields: Record<string, string> = {}) {
    super(message);
  }
}

// No credentials or operational identity are manufactured by this read adapter.
export async function getJson(baseUrl: string, path: string, signal?: AbortSignal, request: typeof fetch = fetch): Promise<unknown> {
  const response = await request(`${baseUrl.replace(/\/$/, '')}${path}`, {
    method: 'GET', headers: { Accept: 'application/json' }, credentials: 'omit', signal,
  });
  if (response.status === 204) return null;
  let body: unknown;
  try { body = await response.json(); } catch {
    throw new HttpError(response.status, response.ok ? 'Resposta inesperada do sistema.' : `Não foi possível consultar o sistema (HTTP ${response.status}).`);
  }
  if (!response.ok) {
    const object = body && typeof body === 'object' && !Array.isArray(body) ? body as Record<string, unknown> : {};
    const fields = Object.fromEntries(Object.entries(object).filter((entry): entry is [string, string] => typeof entry[1] === 'string'));
    // Do not echo arbitrary server diagnostics or personal information to the UI.
    const message = response.status === 409 ? 'A consulta encontrou um conflito no sistema.'
      : response.status === 401 || response.status === 403 ? 'Consulta não autorizada pelo sistema.'
      : `Não foi possível consultar o sistema (HTTP ${response.status}).`;
    throw new HttpError(response.status, message, fields);
  }
  return body;
}
