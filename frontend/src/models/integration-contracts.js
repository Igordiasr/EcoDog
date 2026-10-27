export function object(value, context) {
    if (value === null || typeof value !== 'object' || Array.isArray(value))
        throw new Error(`Resposta inválida: ${context}`);
    return value;
}
export function list(value, context) {
    if (!Array.isArray(value))
        throw new Error(`Lista inválida: ${context}`);
    return value;
}
export function positiveId(value, context) {
    if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < 1)
        throw new Error(`ID inválido: ${context}`);
    return value;
}
export function text(value, context) {
    if (typeof value !== 'string')
        throw new Error(`Texto inválido: ${context}`);
    return value;
}
export function optionalText(value, context) {
    return value == null ? null : text(value, context);
}
export function nonnegative(value, context) {
    if (typeof value !== 'number' || !Number.isFinite(value) || value < 0)
        throw new Error(`Número inválido: ${context}`);
    return value;
}
export function date(value, context) {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value))
        throw new Error(`Data inválida: ${context}`);
    const [y, m, d] = value.split('-').map(Number);
    const check = new Date(Date.UTC(y, m - 1, d));
    if (check.getUTCFullYear() !== y || check.getUTCMonth() + 1 !== m || check.getUTCDate() !== d)
        throw new Error(`Data inválida: ${context}`);
    return value;
}
export function enumValue(value, allowed, context) {
    if (typeof value !== 'string' || !allowed.includes(value))
        throw new Error(`Estado inválido: ${context}`);
    return value;
}
