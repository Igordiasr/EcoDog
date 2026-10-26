import { expect, it, vi } from 'vitest';
import { createQueryController, createWriteController, type QueryState, type WriteState } from '../src/services/request-state';
import { HttpError } from '../src/services/http';

it('cancela A e descarta resposta atrasada mesmo quando o adaptador ignora signal', async () => {
  const states: QueryState<string[]>[] = [];
  const query = createQueryController<string[]>(state => states.push(state));
  let resolveA!: (value: string[]) => void;
  let signalA!: AbortSignal;
  const a = query.load(signal => { signalA = signal; return new Promise(resolve => { resolveA = resolve; }); }, rows => !rows.length);
  await query.load(async () => ['B'], rows => !rows.length);
  resolveA(['A']); await a;
  expect(signalA.aborted).toBe(true);
  expect(states.at(-1)).toEqual({ kind: 'success', data: ['B'] });
  query.block(); expect(states.at(-1)).toEqual({ kind: 'blocked' });
});
it('distingue vazio válido de 403, 404 e DTO inválido sem expor diagnóstico', async () => {
  const publish = vi.fn();
  const query = createQueryController<unknown[]>(publish);
  await query.load(async () => [], rows => !rows.length);
  expect(publish).toHaveBeenLastCalledWith({ kind: 'empty', data: [] });
  for (const error of [new HttpError(403, 'Acesso negado.'), new HttpError(404, 'Recurso indisponível.'), new Error('SQL privado')]) {
    await query.load(async () => { throw error; }, rows => !rows.length);
    expect(publish.mock.calls.at(-1)?.[0].kind).toBe('error');
    expect(publish.mock.calls.at(-1)?.[0].message).not.toContain('SQL');
  }
});
it('duas submissões no mesmo tick fazem uma escrita; recarga não repete POST confirmado', async () => {
  const states: WriteState[] = [];
  const command = createWriteController(state => states.push(state));
  const write = vi.fn(async () => null);
  const failedReload = vi.fn(async () => { throw new Error('offline'); });
  await Promise.all([command.submit(write, failedReload), command.submit(write, failedReload)]);
  expect(write).toHaveBeenCalledTimes(1);
  expect(states.at(-1)?.kind).toBe('reload-error');
  await command.reload(async () => {});
  await command.submit(write, failedReload);
  expect(write).toHaveBeenCalledTimes(1);
  expect(states.at(-1)?.kind).toBe('ready');
});
it('não repete automaticamente escrita com resultado indeterminado', async () => {
  const publish = vi.fn();
  const command = createWriteController(publish);
  const write = vi.fn(async () => { throw new TypeError('offline'); });
  await command.submit(write, async () => {});
  await command.submit(write, async () => {});
  expect(write).toHaveBeenCalledTimes(1);
  expect(publish.mock.calls.at(-1)?.[0].kind).toBe('indeterminate');
});
