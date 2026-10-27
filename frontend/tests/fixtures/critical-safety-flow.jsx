import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { App } from '../../src/App';
import { screens } from '../../src/views/screens/catalog';
import { emptyCalendarData } from '../../src/models/calendar-model';
import '../../src/styles.css';
// Test-only adapter deliberately resolves writes: the UI must not call it using
// illustrative IDs or incomplete operational data, even when it reports success.
const params = new URLSearchParams(location.search);
const screen = screens.find(screen => screen.id === params.get('screen')) || screens[2];
const calls = [];
sessionStorage.setItem('fixture:critical-calls', JSON.stringify(calls));
const api = {
    async session() { return { userId: 'fixture-account', name: 'Conta de teste', profile: screen.profile || 'tutor' }; },
    async login() { throw new Error('Login não utilizado nesta fixture.'); },
    async logout() { },
    async execute(operation, payload) {
        calls.push({ operation, payload });
        sessionStorage.setItem('fixture:critical-calls', JSON.stringify(calls));
        if (params.has('failure'))
            throw new Error('Falha de teste na operação.');
        return { message: 'SUCESSO DO ADAPTADOR DE TESTE' };
    },
};
// Providing the existing monthly calendar source must not imply that booking or
// presence has acquired domain identity, occupancy rules or a check-in source.
const calendarSource = { async loadMonth() { return emptyCalendarData(); } };
history.replaceState(null, '', screen.path);
createRoot(document.getElementById('root')).render(<BrowserRouter><App api={api} calendarSource={calendarSource}/></BrowserRouter>);
