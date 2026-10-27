// The registration contract requires CPF, not an address.
export function registrationDesign(design) {
    const visit = node => {
        if (typeof node === 'string') return node.replace(/endereço/gi, 'CPF');
        return { ...node,
            ...(node.name ? { name: node.name.replace(/endereço/gi, 'CPF') } : {}),
            ...(node.children ? { children: node.children.map(visit) } : {}),
        };
    };
    return Object.fromEntries(Object.entries(design).map(([key, node]) => [key, visit(node)]));
}
