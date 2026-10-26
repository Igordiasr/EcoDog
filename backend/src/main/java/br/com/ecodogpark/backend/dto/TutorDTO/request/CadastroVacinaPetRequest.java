package br.com.ecodogpark.backend.dto.TutorDTO.request;

import br.com.ecodogpark.backend.entity.VacinasEntity;

import java.time.LocalDate;

public record CadastroVacinaPetRequest(
        VacinasEntity vacina,
        LocalDate dataAplicacao,
        LocalDate dataValidade
) {
}
