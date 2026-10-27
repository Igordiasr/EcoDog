export function petCardFromPrototype(template, pet) {
    let description = 0;
    const map = node => {
        if (typeof node === 'string') return node;
        const copy = { ...node, id: `${node.id || 'pet'}-${pet.idPet}`, diaryPetId: pet.idPet };
        if (node.name === 'Ação' && node.children?.some(child => child.name === 'Rótulo' && child.children?.includes('Editar'))) copy.editPetId = pet.idPet;
        if (node.name === 'Nome') copy.children = [pet.nome];
        else if (node.name === 'Descrição') {
            copy.children = [[pet.raca || 'Não informada', `Nascimento: ${pet.dataNascimento ? pet.dataNascimento.split('-').reverse().join('/') : 'Não informado'}`, `Sexo: ${pet.sexo || 'Não informado'} • ${pet.castrado === true ? (pet.sexo === 'F' ? 'Castrada' : 'Castrado') : pet.castrado === false ? 'Não castrado' : 'Castração não informada'}`][description++]];
        } else if (node.name === 'Foto do pet') {
            // The list endpoint does not return photos; do not assign another pet's image.
            copy.className = node.className.replace(/bg-\[url\([^]*?\)\]/g, '') + ' bg-[var(--background)] flex items-center justify-center';
            copy.children = [{ tag: 'span', name: 'Foto indisponível', className: 'text-[14px] text-[var(--brand)] font-[Roboto,system-ui,sans-serif]', children: ['Sem foto'] }];
        } else copy.children = node.children?.map(map);
        return copy;
    };
    return map(template);
}

export function TutorPets({ model, node, renderCard }) {
    if (model.loading) return <p role="status">Carregando seus pets…</p>;
    if (model.error) return <div><p role="alert">{model.error}</p><button type="button" className="management-button" onClick={model.reload}>Tentar novamente</button></div>;
    if (!model.pets.length) return <p role="status">Você ainda não possui pets cadastrados.</p>;
    const group = node.children.find(child => child.name === 'Grupo de pets');
    const template = group ? group.children.find(child => child.name === 'Pet cadastrado') : node.children.find(child => child.name === 'Pet cadastrado');
    const cards = model.pets.map(pet => petCardFromPrototype(template, pet));
    return <section aria-label="Pets cadastrados" className={node.className}>
        {group ? Array.from({ length: Math.ceil(cards.length / 2) }, (_, index) => <div key={index} className={group.className}>{cards.slice(index * 2, index * 2 + 2).map(renderCard)}</div>) : cards.map(renderCard)}
    </section>;
}
