import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { App } from '../../src/App';
import type { EcoDogApi, Session } from '../../src/services/api';
import '../../src/styles.css';

// Test-only adapter; this fixture is not included in the production build.
const tutor: Session = { userId: 'fixture-tutor', name: 'Tutora de teste', profile: 'tutor' };
const params = new URLSearchParams(location.search);
let session = params.has('authenticated') ? tutor : null;
const api: EcoDogApi = {
  async session() { return session; },
  async login(email, password) {
    if (email !== 'tutor@example.com' || password !== 'senha-de-teste') throw new Error('Credenciais da fixture inválidas.');
    session = tutor; return tutor;
  },
  async logout() { session = null; },
  async execute(operation, payload) {
    if (operation === 'book') sessionStorage.setItem('fixture:booking-payload', JSON.stringify(payload));
    return { message: 'Operação confirmada pelo adaptador de teste.' };
  },
};
history.replaceState(null, '', '/estrutura');
createRoot(document.getElementById('root')!).render(<BrowserRouter><App api={api} /></BrowserRouter>);
