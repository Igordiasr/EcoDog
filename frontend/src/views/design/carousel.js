import { nodes } from './types';
const imageFill = /bg-\[url\([^)]*\)\]/;
function fill(node) {
    return node.className.match(imageFill)?.[0] || nodes(node).map(fill).find(Boolean);
}
function replaceFill(node, source) {
    return {
        ...node,
        className: node.className.replace(imageFill, source),
        children: node.children?.map(child => typeof child === 'string' ? child : replaceFill(child, source)),
    };
}
export function isCarousel(node) {
    return nodes(node).some(child => /^imagens/.test(child.name || '') || child.name === 'Navegação do carrossel');
}
export function carouselSlots(node) {
    const children = nodes(node);
    const row = children.find(child => /^imagens/.test(child.name || ''));
    const featured = children.find(child => child.name === 'Imagem em destaque');
    const previews = children.find(child => child.name === 'Prévia dos slides');
    return row ? nodes(row) : featured && previews ? [nodes(previews)[0], featured, ...nodes(previews).slice(1)] : [];
}
export function updateCarouselIndicators(node, offset) {
    const count = carouselSlots(node).length;
    if (!count)
        return node;
    const active = ((1 + offset) % count + count) % count;
    const visit = (current) => {
        if (/^(indicador|Indicadores)$/.test(current.name || '')) {
            const mobile = current.name === 'Indicadores';
            const template = nodes(current)[0];
            if (!template)
                return current;
            return { ...current, children: Array.from({ length: count }, (_, index) => ({
                    ...template,
                    id: `${current.id}-slide-${index}`,
                    slide: { index, active: index === active },
                    className: template.className.replace(/(?:^|\s)(?:w-|h-|bg-)\[[^\]]+\]/g, ' ') + (index === active
                        ? mobile ? ' w-[14px] h-[14px] bg-[#de8f3bff]' : ' w-[16px] h-[16px] bg-[#de8f3bff]'
                        : mobile ? ' w-[10px] h-[10px] bg-[#45937fff]' : ' w-[12px] h-[12px] bg-[#45937fff]'),
                })) };
        }
        return { ...current, children: current.children?.map(child => typeof child === 'string' ? child : visit(child)) };
    };
    return visit(node);
}
export function rotateCarousel(node, offset) {
    if (!offset)
        return node;
    const slots = carouselSlots(node);
    if (!slots.length)
        return node;
    const sources = slots.map(fill);
    if (sources.some(source => !source))
        return node;
    const rotation = ((offset % slots.length) + slots.length) % slots.length;
    const replacements = new Map(slots.map((slot, index) => [slot.id, sources[(index + rotation) % slots.length]]));
    const visit = (current) => {
        const source = replacements.get(current.id);
        if (source)
            return replaceFill(current, source);
        return { ...current, children: current.children?.map(child => typeof child === 'string' ? child : visit(child)) };
    };
    // Only image URLs change. Never transfer positioning, dimensions or opacity between slots.
    return visit(node);
}
