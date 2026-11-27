// fotoUrl is optional until the pet endpoints expose the uploaded image.
export function petPhotoDesign(node, fotoUrl, petName) {
    const src = typeof fotoUrl === 'string' ? fotoUrl.trim() : '';
    return {
        ...node,
        tag: src ? 'img' : 'div',
        name: src ? `Foto de ${petName || 'pet'}` : 'Foto do pet não disponível',
        className: (node.className || '').replace(/bg-\[url\([^]*?\)\]/g, '') + ' monitor-pet-photo',
        src: src || undefined,
        decorative: false,
        petPhoto: true,
        children: [],
    };
}
