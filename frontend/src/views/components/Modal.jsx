import { useEffect, useRef } from 'react';
export function Modal({ title, children, onClose, wide, className = '' }) {
    const ref = useRef(null);
    useEffect(() => {
        const trigger = document.activeElement;
        const dialog = ref.current;
        dialog.showModal();
        return () => { dialog.close(); trigger?.focus(); };
    }, []);
    return <dialog ref={ref} aria-label={title} onCancel={onClose} className={`modal ${wide ? 'modal-wide' : ''} ${className}`}>
    <button type="button" className="modal-close" aria-label="Fechar" onClick={onClose}>×</button>
    {children}
  </dialog>;
}
