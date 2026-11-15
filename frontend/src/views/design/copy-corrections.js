// Exact authored copy only. Never process API values, routes or identifiers.
export const correctedCopy = value => ({
    'Descrição - Passo a Passo da atividade': 'Descrição e passo a passo da atividade',
    'Grupo Pet1 - Duração XX Min': 'Grupo 1 • Duração não informada',
    'Grupo Pet2 - Duração XX Min': 'Grupo 2 • Duração não informada',
    '5/10 - 7/10 - 12/10 - 14/10': '5/10 • 7/10 • 12/10 • 14/10',
}[value] || value);
export function correctDesignCopy(value) {
    if (typeof value === 'string') return correctedCopy(value);
    if (Array.isArray(value)) return value.map(correctDesignCopy);
    if (!value || typeof value !== 'object') return value;
    return { ...value, ...(value.children ? { children: value.children.map(correctDesignCopy) } : {}) };
}
