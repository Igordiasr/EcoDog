export const MAX_PET_PHOTO_BYTES = 5 * 1024 * 1024;
export const PET_PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export function maskPetDate(value) {
    // Native date inputs accept expanded years. Use a bounded text mask instead.
    const iso = /^(\d{4,})-(\d{2})-(\d{2})$/.exec(value);
    const digits = (iso ? `${iso[3]}${iso[2]}${iso[1].slice(0, 4)}` : value.replace(/\D/g, '')).slice(0, 8);
    return [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4, 8)].filter(Boolean).join('/');
}
export function petDateISO(value) {
    const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
    if (!match)
        return null;
    const [, day, month, year] = match;
    const date = new Date(0);
    date.setUTCHours(0, 0, 0, 0);
    date.setUTCFullYear(Number(year), Number(month) - 1, Number(day));
    if (Number(year) < 1 || date.getUTCFullYear() !== Number(year) || date.getUTCMonth() !== Number(month) - 1 || date.getUTCDate() !== Number(day))
        return null;
    return `${year}-${month}-${day}`;
}
export function maskPetPhone(value) {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (!digits)
        return '';
    if (digits.length <= 2)
        return `(${digits}`;
    const split = digits.length > 10 ? 7 : 6;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, split)}${digits.length > split ? `-${digits.slice(split)}` : ''}`;
}
export function validatePetField(key, value, required = false, today = new Date()) {
    const text = value.trim();
    if (!text)
        return required || value.length > 0 ? 'Preencha este campo.' : '';
    if (key === 'nome' && (text.match(/\p{L}/gu) || []).length < 3)
        return 'Informe um nome com pelo menos 3 letras.';
    if (/nascimento|^data$|^validade$/.test(key)) {
        const iso = petDateISO(text);
        if (!iso)
            return 'Data inválida';
        const localToday = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        if (key !== 'validade' && (iso > localToday || key === 'nascimento' && iso === localToday))
            return 'Data inválida';
    }
    if (/contato|telefone/.test(key) && !/^\d{10,11}$/.test(text.replace(/\D/g, '')))
        return 'Informe um telefone com DDD e 10 ou 11 algarismos.';
    if (key === 'sexo' && !['M', 'F'].includes(text))
        return 'Selecione uma opção válida para Sexo.';
    if (key === 'castrado' && !['Sim', 'Não'].includes(text))
        return 'Selecione Sim ou Não.';
    return '';
}
export const petRecordFields = { vacinas: ['vacina', 'data'], medicamentos: ['remedio', 'dosagem', 'frequencia'] };
export function validatePetForm(fields, records, backend = false) {
    const errors = {};
    for (const key of ['nome', 'nascimento', 'raca', 'sexo', 'castrado', 'veterinario', 'contato', 'convenio', 'relacionamento-com-outros-pets', 'obs']) {
        const error = validatePetField(key, fields[key] || '', backend || ['nome', 'nascimento', 'raca'].includes(key));
        if (error)
            errors[key] = error;
    }
    for (const key of ['castrado', 'convenio'])
        if (backend && fields[key] && !['Sim', 'Não'].includes(fields[key])) errors[key] = 'Selecione Sim ou Não.';
    for (const [key, max] of [['nome', 100], ['raca', 100], ['obs', 200], ['relacionamento-com-outros-pets', 100]])
        if ((fields[key] || '').trim().length > max) errors[key] = `Informe no máximo ${max} caracteres.`;
    for (const kind of ['vacinas', 'medicamentos']) {
        for (const id of records[kind]) {
            const active = id !== 0 || petRecordFields[kind].some(key => !!fields[`${kind}.${id}.${key}`]) || kind === 'vacinas' && !!fields[`${kind}.${id}.validade`];
            if (!active)
                continue;
            for (const key of petRecordFields[kind]) {
                const path = `${kind}.${id}.${key}`;
                const error = validatePetField(key, fields[path] || '', true);
                if (error)
                    errors[path] = error;
            }
            if (kind === 'vacinas') {
                const key = `vacinas.${id}.validade`, error = validatePetField('validade', fields[key] || '');
                if (error)
                    errors[key] = error;
            }
        }
    }
    if (fields['alergia-outros'] === 'Sim' && !fields['alergia-personalizada']?.trim())
        errors['alergia-personalizada'] = 'Descreva a alergia ao selecionar Outros.';
    return errors;
}
export function validatePetPhoto(file) {
    if (!PET_PHOTO_TYPES.includes(file.type))
        return 'Escolha uma foto JPG, PNG ou WebP.';
    return file.size > MAX_PET_PHOTO_BYTES ? 'A foto deve ter no máximo 5 MB.' : '';
}
