export function content(node) {
    return typeof node === 'string' ? node : (node.children || []).map(content).filter(Boolean).join(' ');
}
export function nodes(node) {
    return (node.children || []).filter((child) => typeof child !== 'string');
}
export function fieldKey(label) {
    return label.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}
