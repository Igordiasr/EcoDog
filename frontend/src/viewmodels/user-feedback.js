const fallbackMessage = 'Não foi possível carregar as informações. Tente novamente em instantes.';

export function userFeedback(message, fallback = fallbackMessage) {
    if (!message || typeof message !== 'string') return fallback;
    if (/HTTP\s*40[13]|sessão.*(?:expir|necessária)/i.test(message)) return 'Entre novamente na sua conta para continuar.';
    if (/HTTP|backend|frontend|UUID|\bAPI\b|adaptador|\bmock\b|\bURL\b|\bID\b|resposta (?:inválida|inesperada)|lista inválida|estado inválido|texto inválido|data inválida|diferente do solicitado|Failed to fetch|Network Error|TypeError|localhost|stack|SQL/i.test(message)) return fallback;
    return message;
}

export function petDiaryFeedback(error) {
    if (error?.status === 401 || /sessão.*expir/i.test(error?.message || '')) return 'Entre novamente na sua conta para consultar o diário.';
    if (error?.status === 403) return 'Você não tem permissão para consultar este diário.';
    if (error?.message === 'Selecione um dos seus pets para consultar o diário.') return error.message;
    return 'Não foi possível carregar o diário do seu pet. Tente novamente em instantes.';
}
