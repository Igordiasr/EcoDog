import { useEffect, useRef } from 'react';
import { navigation, screens } from '../screens/catalog';
export function Menu({ current, profile, go, close, logout }) {
    const ref = useRef(null);
    useEffect(() => {
        ref.current?.querySelector('button')?.focus();
        const dismiss = (event) => { if (!ref.current?.contains(event.target))
            close(); };
        document.addEventListener('pointerdown', dismiss);
        return () => document.removeEventListener('pointerdown', dismiss);
    }, [close]);
    return <nav ref={ref} aria-label="Navegação principal" className="navigation-menu" onKeyDown={e => { if (e.key === 'Escape')
        close(); }}>
    {navigation[profile].map(id => {
            const screen = screens.find(s => s.id === id);
            return <button key={id} type="button" aria-current={current === id ? 'page' : undefined} onClick={() => { close(); go(id); }}>{screen.name}<span aria-hidden="true">{current === id ? '✓' : '›'}</span></button>;
        })}
    {logout && <button type="button" onClick={logout}>Sair</button>}
  </nav>;
}
