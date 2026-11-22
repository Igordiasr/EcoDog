export function loginData(fields) {
    const email = (fields['e-mail'] || fields.email || '').trim();
    const senha = fields.senha || '';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !senha.trim()) throw new Error('Informe um e-mail válido e sua senha.');
    return { email, senha };
}

export function registrationData(fields) {
    const { email, senha } = loginData(fields);
    const nome = (fields.nome || '').trim();
    const sobrenome = (fields.sobrenome || '').trim();
    if (!nome || !sobrenome) throw new Error('Informe seu nome e sobrenome.');
    const cpf = (fields.cpf || '').replace(/\D/g, '');
    const telefone = (fields.telefone || '').replace(/\D/g, '');
    if (nome.length > 120 || sobrenome.length > 120 || email.length > 150) throw new Error('Confira o nome, sobrenome e o e-mail informados.');
    if (!/^\d{11}$/.test(cpf) || /^(\d)\1+$/.test(cpf)) throw new Error('Informe um CPF válido com 11 dígitos.');
    for (let length = 9; length <= 10; length++) {
        const sum = [...cpf.slice(0, length)].reduce((total, digit, index) => total + Number(digit) * (length + 1 - index), 0);
        if ((sum * 10 % 11 % 10) !== Number(cpf[length])) throw new Error('Informe um CPF válido.');
    }
    if (!telefone || telefone.length > 20) throw new Error('Informe o telefone com DDD.');
    if (senha.length < 6 || senha.length > 100) throw new Error('A senha deve ter entre 6 e 100 caracteres.');
    if (senha !== fields['confirmacao-de-senha']) throw new Error('Confira a confirmação de senha.');
    return { nome, sobrenome, email, cpf, telefone, senha };
}

export function createAuthViewModel(api) {
    return {
        login(fields) { const { email, senha } = loginData(fields); return api.login(email, senha); },
        register(fields) { return api.register({ ...registrationData(fields), endereco: registrationAddressData(fields) }); },
    };
}

// Names and limits match EnderecoEntity; UsuarioRequest must accept this object to persist it.
export function registrationAddressData(fields) {
    const endereco = Object.fromEntries(['rua', 'numero', 'complemento', 'bairro', 'cidade', 'cep'].map(key => [key, (fields[key] || '').trim()]));
    endereco.cep = endereco.cep.replace(/\D/g, '');
    if (!/^\d{8}$/.test(endereco.cep)) throw new Error('Informe um CEP válido com 8 dígitos.');
    if (['rua', 'numero', 'bairro', 'cidade'].some(key => !endereco[key])) throw new Error('Preencha os campos obrigatórios do endereço.');
    if (endereco.numero.length > 10) throw new Error('O número deve ter até 10 caracteres.');
    return endereco;
}
