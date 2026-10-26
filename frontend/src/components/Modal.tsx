import { useEffect, useRef, type ReactNode } from 'react';

export interface ModalProps { title: string; children: ReactNode; onClose(): void; wide?: boolean }
export function Modal({ title, children, onClose, wide }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const trigger = document.activeElement as HTMLElement | null;
    const dialog = ref.current!;
    dialog.showModal();
    return () => { dialog.close(); trigger?.focus(); };
  }, []);
  return <dialog ref={ref} aria-label={title} onCancel={onClose} className={`modal ${wide ? 'modal-wide' : ''}`}>
    <button type="button" className="modal-close" aria-label="Fechar" onClick={onClose}>×</button>
    {children}
  </dialog>;
}
