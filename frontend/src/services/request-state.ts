import { HttpError } from './http';

export type QueryState<T> = { kind: 'blocked' | 'loading' } | { kind: 'success' | 'empty'; data: T } | { kind: 'error'; message: string; status?: number };
export function safeRequestMessage(error: unknown): string {
  return error instanceof HttpError ? error.message : 'Não foi possível consultar o sistema. Nenhum dado de exemplo foi utilizado.';
}

// Cancellation plus generation checks: adapters may ignore AbortSignal.
export function createQueryController<T>(publish: (state: QueryState<T>) => void) {
  let generation = 0;
  let controller: AbortController | undefined;
  const cancel = () => { generation++; controller?.abort(); controller = undefined; };
  return {
    block() { cancel(); publish({ kind: 'blocked' }); },
    dispose: cancel,
    async load(source: (signal: AbortSignal) => Promise<T>, isEmpty: (data: T) => boolean) {
      cancel();
      const current = generation;
      controller = new AbortController();
      publish({ kind: 'loading' });
      try {
        const data = await source(controller.signal);
        if (current === generation) publish({ kind: isEmpty(data) ? 'empty' : 'success', data });
      } catch (error) {
        if (current === generation) publish({ kind: 'error', message: safeRequestMessage(error), status: error instanceof HttpError ? error.status : undefined });
      }
    },
  };
}

export type WriteState = { kind: 'draft' | 'sending' | 'confirmed' | 'reloading' | 'ready' }
  | { kind: 'error' | 'indeterminate' | 'reload-error'; message: string; status?: number };
// Call only AFTER validation and contextual confirmation, never as a permission gate.
// Reload is deliberately separate from submit; ambiguous writes cannot be repeated.
export function createWriteController(publish: (state: WriteState) => void) {
  let inFlight = false;
  let confirmed = false;
  let uncertain = false;
  const reload = async (query: () => Promise<void>) => {
    publish({ kind: 'reloading' });
    try { await query(); publish({ kind: 'ready' }); }
    catch { publish({ kind: 'reload-error', message: 'Operação confirmada; não foi possível atualizar a consulta.' }); }
  };
  return {
    async submit(write: () => Promise<unknown>, query: () => Promise<void>) {
      if (inFlight || confirmed || uncertain) return;
      inFlight = true; publish({ kind: 'sending' });
      try {
        await write(); confirmed = true; publish({ kind: 'confirmed' });
        await reload(query);
      } catch (error) {
        // A network/parsing/5xx failure after dispatch cannot prove rollback.
        uncertain = !(error instanceof HttpError) || error.status >= 500 || error.status < 400;
        publish(uncertain
          ? { kind: 'indeterminate', message: 'Resultado pendente de confirmação. Consulte o registro antes de considerar uma nova operação.' }
          : { kind: 'error', message: safeRequestMessage(error), status: error instanceof HttpError ? error.status : undefined });
      } finally { inFlight = false; }
    },
    async reload(query: () => Promise<void>) {
      if (inFlight || !confirmed) return;
      inFlight = true;
      try { await reload(query); } finally { inFlight = false; }
    },
  };
}
