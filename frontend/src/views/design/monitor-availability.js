export function monitorUnavailableReason(pets, petId) {
    const records = pets.filter(pet => pet.idPet === petId);
    if (records.some(pet => pet.situacao === 'CONFIRMADO' && !pet.dataSaidaRaw)) return '';
    if (records.some(pet => pet.situacao === 'RETIRADO' || pet.dataSaidaRaw))
        return 'O pet já saiu. Não é possível atualizar suas informações após o check-out.';
    if (records.some(pet => pet.situacao === 'AGENDADO'))
        return 'O pet ainda não está presente. Aguarde o check-in para atualizar suas informações.';
    return 'O pet não possui uma presença ativa hoje. Não é possível atualizar suas informações.';
}
