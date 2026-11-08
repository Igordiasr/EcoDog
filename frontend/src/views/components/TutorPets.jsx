import { useRef, useState } from 'react';
import { Modal } from './Modal';
import { deleteTutorPet } from '../../api/pets-api';
export function petCardFromPrototype(template, pet, { onDelete, busy = false } = {}) {
    let description = 0;
    const map = node => {
        if (typeof node === 'string') return node;
        const copy = { ...node, id: `${node.id || 'pet'}-${pet.idPet}`, diaryPetId: pet.idPet };
        if (node.name === 'Ação' && node.children?.some(child => child.name === 'Rótulo' && child.children?.includes('Ver diário'))) copy.viewPetDiary = true;
        if (onDelete && node.name === 'Ação' && node.children?.some(child => child.name === 'Rótulo' && child.children?.includes('Excluir'))) {
            copy.onDeletePet = () => onDelete(pet);
            copy.deletePetName = pet.nome;
            copy.deletePetBusy = busy;
        }
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

export function TutorPets({ model, node, renderCard, session }) {
    const [target, setTarget] = useState(null), [busy, setBusy] = useState(false), [message, setMessage] = useState('');
    const inFlight = useRef(false);
    const remove = async () => {
        if (!target || inFlight.current) return;
        inFlight.current = true; setBusy(true); setMessage('');
        try {
            await deleteTutorPet(import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080', session, target.idPet);
            setTarget(null); setMessage('Pet excluído com sucesso.'); model.reload();
        } catch (error) { setMessage(error.message); }
        finally { inFlight.current = false; setBusy(false); }
    };
    if (model.loading) return <p role="status">Carregando seus pets…</p>;
    if (model.error) return <div><p role="alert">{model.error}</p><button type="button" className="management-button" onClick={model.reload}>Tentar novamente</button></div>;
    if (!model.pets.length) return <div>{message && <p role="status">{message}</p>}<p role="status">Você ainda não possui pets cadastrados.</p></div>;
    const group = node.children.find(child => child.name === 'Grupo de pets');
    const template = group ? group.children.find(child => child.name === 'Pet cadastrado') : node.children.find(child => child.name === 'Pet cadastrado');
    const cards = model.pets.map(pet => <div key={pet.idPet} className="tutor-pet-entry">{renderCard(petCardFromPrototype(template, pet, { busy, onDelete: pet => { setTarget(pet); setMessage(''); } }))}</div>);
    return <section aria-label="Pets cadastrados" className={`${node.className} tutor-pets-list`}>
        {message && <p role={target ? 'alert' : 'status'}>{message}</p>}
        <div className="tutor-pets-grid">{cards}</div>
        {target && <Modal title={`Excluir ${target.nome}`} onClose={() => { if (!busy) setTarget(null); }}><div className="dialog-content"><h2>Excluir {target.nome}?</h2><p>Esta ação remove o pet da sua lista.</p>{message && <p role="alert">{message}</p>}<div className="dialog-actions"><button type="button" disabled={busy} onClick={() => setTarget(null)}>Cancelar</button><button type="button" disabled={busy} onClick={remove}>{busy ? 'Excluindo…' : 'Confirmar exclusão'}</button></div></div></Modal>}
    </section>;
}
