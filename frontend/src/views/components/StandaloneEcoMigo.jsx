import { useState } from 'react';
import { DesignContext, DesignRenderer } from './DesignRenderer';
import registrationDesign from '../design/TL04.json';

const access = registrationDesign.desktop.children.find(node => node.name === 'EcoMigo • Acesso');

// Reuse the original artwork and the same WhatsApp behavior on standalone pages.
export function StandaloneEcoMigo() {
    const [message, setMessage] = useState('');
    return <DesignContext.Provider value={{ screen: 'TL04', action: () => setMessage('O WhatsApp está indisponível até configurar o número oficial de atendimento.') }}>
        <DesignRenderer node={access}/>
        {message && <p className="standalone-ecomigo-message" role="alert">{message}<button type="button" aria-label="Fechar aviso do EcoMigo" onClick={() => setMessage('')}>×</button></p>}
    </DesignContext.Provider>;
}
