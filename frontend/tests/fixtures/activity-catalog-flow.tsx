import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ActivityCatalogDetails } from '../../src/components/ActivityCatalogDetails';

function Fixture() {
  const [open, setOpen] = useState(false);
  const [baseUrl, setBaseUrl] = useState(new URLSearchParams(location.search).get('base') || '');
  return <>
    <label>Base da API<input aria-label="Base da API" value={baseUrl} onChange={event => setBaseUrl(event.target.value)} /></label>
    <button onClick={() => setOpen(true)}>Consultar catálogo de atividades</button>
    {open && <div role="dialog" aria-label="Catálogo de atividades"><ActivityCatalogDetails baseUrl={baseUrl} close={() => setOpen(false)} /></div>}
  </>;
}
createRoot(document.getElementById('root')!).render(<Fixture />);
