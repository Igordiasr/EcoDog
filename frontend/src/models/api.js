export class IntegrationPending extends Error {
    constructor() { super('Não foi possível concluir. A integração com o sistema ainda não está disponível.'); }
}
export const unavailableApi = {
    async session() { return null; },
    async login() { throw new IntegrationPending(); },
    async logout() { },
    async execute() { throw new IntegrationPending(); },
};
