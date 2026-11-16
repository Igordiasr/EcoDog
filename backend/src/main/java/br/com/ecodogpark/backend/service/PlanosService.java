package br.com.ecodogpark.backend.service;

import br.com.ecodogpark.backend.entity.PlanosEntity;
import br.com.ecodogpark.backend.entity.ServicosEntity;
import br.com.ecodogpark.backend.repository.PlanosRepository;
import br.com.ecodogpark.backend.repository.ServicoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class PlanosService {

    private final PlanosRepository planosRepository;
    private final ServicoRepository servicoRepository;

    @Autowired
    public PlanosService(PlanosRepository planosRepository, ServicoRepository servicoRepository) {
        this.planosRepository = planosRepository;
        this.servicoRepository = servicoRepository;
    }

    @Transactional(readOnly = true)
    public List<PlanosEntity> listarTodos() {
        return planosRepository.findAllByOrderByNomeAsc();
    }

    @Transactional(readOnly = true)
    public PlanosEntity buscarPorId(Long id) {
        return planosRepository.findById(id).orElseThrow(() -> new ResponseStatusException(
                org.springframework.http.HttpStatus.NOT_FOUND, "Plano não encontrado"));
    }

    public PlanosEntity criar(PlanosEntity plano) {
        validarServicoExistente(plano.getServico());
        return planosRepository.save(plano);
    }

    public PlanosEntity atualizar(Long id, PlanosEntity planoAtualizado) {
        PlanosEntity planoExistente = planosRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        org.springframework.http.HttpStatus.NOT_FOUND, "Plano não encontrado"));
        validarServicoExistente(planoAtualizado.getServico());
        planoExistente.setNome(planoAtualizado.getNome());
        planoExistente.setServico(planoAtualizado.getServico());
        planoExistente.setDiarias(planoAtualizado.getDiarias());
        planoExistente.setValor(planoAtualizado.getValor());
        planoExistente.setAtivo(planoAtualizado.getAtivo());
        return planosRepository.save(planoExistente);
    }

    public void deletar(Long id) {
        PlanosEntity plano = planosRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        org.springframework.http.HttpStatus.NOT_FOUND, "Plano não encontrado"));
        planosRepository.deleteById(id);
    }

    public PlanosEntity toggularAtivo(Long id) {
        PlanosEntity plano = planosRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        org.springframework.http.HttpStatus.NOT_FOUND, "Plano não encontrado"));
        plano.setAtivo(!plano.getAtivo());
        return planosRepository.save(plano);
    }

    public List<ServicosEntity> listarServicosAtivos() {
        return servicoRepository.findAllByStatusTrueOrderByNomeAsc();
    }

    private void validarServicoExistente(ServicosEntity servico) {
        if (servico == null || servico.getIdServico() == null || !servicoRepository.existsById(servico.getIdServico())) {
            throw new ResponseStatusException(
                    org.springframework.http.HttpStatus.BAD_REQUEST,
                    "Serviço inválido");
        }
    }
}
