export type ScreenId = `TL${string}`;
export type Profile = 'tutor' | 'monitor' | 'admin';
export const screens = [
  { id: 'TL01', name: 'Início', path: '/', profile: null },
  { id: 'TL02', name: 'Entrar', path: '/entrar', profile: null },
  { id: 'TL03', name: 'Agendamento', path: '/tutor/agendamento', profile: 'tutor' },
  { id: 'TL04', name: 'Cadastro', path: '/cadastro', profile: null },
  { id: 'TL05', name: 'Meus Pets', path: '/tutor/pets', profile: 'tutor' },
  { id: 'TL06', name: 'Cadastro de pet', path: '/tutor/pets/novo', profile: 'tutor' },
  { id: 'TL07', name: 'Diário do Pet', path: '/tutor/diario', profile: 'tutor' },
  { id: 'TL08', name: 'Sobre', path: '/sobre', profile: null },
  { id: 'TL09', name: 'Estrutura', path: '/estrutura', profile: null },
  { id: 'TL10', name: 'Feed do Monitor', path: '/monitor/feed', profile: 'monitor' },
  { id: 'TL11', name: 'Check-in / out', path: '/monitor/check-in', profile: 'monitor' },
  { id: 'TL12', name: 'Atividades do dia', path: '/monitor/atividades', profile: 'monitor' },
  { id: 'TL13', name: 'Dashboard geral', path: '/admin', profile: 'admin' },
  { id: 'TL14', name: 'Calendário', path: '/admin/calendario', profile: 'admin' },
  { id: 'TL15', name: 'Usuários', path: '/admin/usuarios', profile: 'admin' },
  { id: 'TL16', name: 'Clientes', path: '/admin/clientes', profile: 'admin' },
  { id: 'TL17', name: 'Planos', path: '/admin/planos', profile: 'admin' },
] as const;

export const navigation: Record<Profile | 'public', string[]> = {
  public: ['TL01', 'TL08', 'TL09', 'TL02', 'TL04'],
  tutor: ['TL05', 'TL03'], monitor: ['TL11', 'TL12', 'TL10'],
  admin: ['TL13', 'TL14', 'TL15', 'TL16', 'TL17'],
};
