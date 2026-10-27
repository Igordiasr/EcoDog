import { content, nodes } from './types';
export function vaccineValidityField(template) {
    const copy = (node) => ({ ...node, id: `${node.id}-validade`, name: node === template ? 'Validade' : node.name, children: node.children?.map(child => typeof child === 'string' ? child === 'Data' ? 'Validade' : child : copy(child)) });
    return copy(template);
}
export function petInsuranceField(template) {
    const copy = (node) => ({ ...node, id: `${node.id}-convenio`, name: node === template ? 'Convênio' : node.name, children: node.children?.map(child => typeof child === 'string' ? child === 'Raça' ? 'Convênio' : child === 'Raça do pet' ? 'Convênio do pet (opcional)' : child : copy(child)) });
    return copy(template);
}
export function addValidityToVaccineRecord(record) {
    return { ...record, children: record.children?.map(child => {
            if (typeof child === 'string')
                return child;
            const date = nodes(child).find(field => content(nodes(field)[0] || '') === 'Data');
            return date ? { ...child, children: [...(child.children || []), vaccineValidityField(date)] } : child;
        }) };
}
