import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { App } from '../../src/App';
import { unavailableApi } from '../../src/models/api';
import { petHealthExamples } from '../../src/models/pet-health-examples';
import { catalogNameError } from '../../src/models/pet-health-catalog';
import '../../src/styles.css';
// Test-only normalized adapters, not production persistence.
const params = new URLSearchParams(location.search), data = petHealthExamples();
let sequence = 0;
const source = {
    async load() { return structuredClone(data); },
    async createItem(kind, name) {
        sessionStorage.setItem('fixture:catalog-create-count', String(Number(sessionStorage.getItem('fixture:catalog-create-count') || '0') + 1));
        if (params.has('failure'))
            throw new Error('Falha de teste ao cadastrar item.');
        const error = catalogNameError(name, data[kind]);
        if (error)
            throw new Error(error);
        const item = { id: `fixture-item-${sequence++}`, name };
        data[kind].push(item);
        return item;
    },
};
const schedule = { async load() {
        return [
            { id: '1', petId: 'pet', service: 'Creche', date: '2027-01-05', valid: true },
            { id: '2', petId: 'pet', service: 'Creche', date: '2027-01-05', valid: true },
            { id: '3', petId: 'pet', service: 'Creche', date: '2027-01-15', valid: true },
            { id: '4', petId: 'pet', service: 'Creche', date: '2027-01-25', valid: false },
        ];
    } };
const api = { ...unavailableApi, async session() { return { userId: 'fixture-tutor', name: 'Tutora de teste', profile: 'tutor' }; } };
history.replaceState(null, '', params.has('pets') ? '/tutor/pets' : '/tutor/pets/novo');
createRoot(document.getElementById('root')).render(<BrowserRouter><App api={api} petHealthCatalogSource={source} tutorScheduleSource={schedule}/></BrowserRouter>);
