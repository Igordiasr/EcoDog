export function TutorPets({ model }) {
    if (model.loading) return <p role="status">Carregando seus pets…</p>;
    if (model.error) return <div><p role="alert">{model.error}</p><button type="button" className="management-button" onClick={model.reload}>Tentar novamente</button></div>;
    if (!model.pets.length) return <p role="status">Você ainda não possui pets cadastrados.</p>;
    return <div className="tutor-pets-grid">{model.pets.map(pet => <article className="tutor-pet-card" key={pet.idPet}>
        <h2>{pet.nome}</h2><dl>
            <div><dt>Raça</dt><dd>{pet.raca || 'Não informada'}</dd></div>
            <div><dt>Sexo</dt><dd>{{ M: 'Macho', F: 'Fêmea' }[pet.sexo] || pet.sexo || 'Não informado'}</dd></div>
            <div><dt>Castrado</dt><dd>{pet.castrado === true ? 'Sim' : pet.castrado === false ? 'Não' : 'Não informado'}</dd></div>
            <div><dt>Nascimento</dt><dd>{pet.dataNascimento ? pet.dataNascimento.split('-').reverse().join('/') : 'Não informado'}</dd></div>
        </dl>
    </article>)}</div>;
}
