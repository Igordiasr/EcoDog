import { requestJson } from './http';

export function createPlanosApi(baseUrl, token, request) {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const call = (path, method = 'GET', body, signal) => requestJson(baseUrl, path, {
    method, headers, ...(body === undefined ? {} : { body }),
  }, signal, request);
  return {
    list: (signal) => call('/api/planos', 'GET', undefined, signal),
    get: (id, signal) => call(`/api/planos/${id}`, 'GET', undefined, signal),
    listServices: (signal) => call('/api/planos/servicos-ativos', 'GET', undefined, signal),
    create: (data, signal) => call('/api/planos', 'POST', data, signal),
    update: (id, data, signal) => call(`/api/planos/${id}`, 'PUT', data, signal),
    toggleActive: (id, signal) => call(`/api/planos/${id}/ativo`, 'PATCH', undefined, signal),
    remove: (id, signal) => call(`/api/planos/${id}`, 'DELETE', undefined, signal),
  };
}
