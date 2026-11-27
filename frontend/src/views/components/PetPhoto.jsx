import { useState } from 'react';

export function PetPhoto({ src, name, ...props }) {
    const [failed, setFailed] = useState(false);
    if (src && !failed) return <img {...props} src={src} alt={name} loading="lazy" draggable={false} onError={() => setFailed(true)}/>;
    return <div {...props} className={`${props.className} pet-photo-placeholder`} role="img" aria-label="Foto do pet não disponível"><span>Sem foto</span></div>;
}
