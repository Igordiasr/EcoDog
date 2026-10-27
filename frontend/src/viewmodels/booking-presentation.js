export function selectedPetsSentence(names) {
    if (!names.length) return 'Nenhum pet selecionado para essa auventura.';
    return `${names.join(', ')} ${names.length === 1 ? 'está selecionado' : 'estão selecionados'} para essa auventura.`;
}
