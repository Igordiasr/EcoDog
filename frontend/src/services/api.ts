import type { Profile } from '../screens/catalog';

export interface Session { userId: string; name: string; profile: Profile }
export type Operation = 'register' | 'savePet' | 'deletePet' | 'book' | 'checkIn' | 'checkOut' | 'saveRecord' | 'completeActivity' | 'saveCapacity' | 'saveActivity' | 'saveUser' | 'setUserActive' | 'saveGoal' | 'saveRevenue' | 'saveLink' | 'setLinkActive' | 'savePlan' | 'setPlanActive' | 'deletePlan';
export interface OperationResult { message: string }

// An adapter must be supplied once the backend contract is agreed. Permissions,
// ownership, availability, pricing and deletion rules are always server-owned.
// Booking payload.cart is the frontend estimate from approved rates, not a trusted
// charge: the backend must validate dates/holidays and recalculate before saving.
export interface EcoDogApi {
  session(): Promise<Session | null>;
  login(email: string, password: string): Promise<Session>;
  logout(): Promise<void>;
  execute(operation: Operation, payload: Record<string, unknown>): Promise<OperationResult>;
}
export class IntegrationPending extends Error {
  constructor() { super('Não foi possível concluir. A integração com o sistema ainda não está disponível.'); }
}
export const unavailableApi: EcoDogApi = {
  async session() { return null; },
  async login() { throw new IntegrationPending(); },
  async logout() {},
  async execute() { throw new IntegrationPending(); },
};
