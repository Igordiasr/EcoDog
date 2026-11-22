package br.com.ecodogpark.backend.dto.UsuarioDTO;

import br.com.ecodogpark.backend.enums.DiaSemana;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record ClienteResponse(
        UUID idTutor,
        String nomeTutor,
        UUID idPet,
        String nomePet,
        Long idContrato,
        Integer idServico,
        String servico,
        BigDecimal valor,
        Boolean ativo,
        Integer quantidadeDiarias,
        List<DiaSemana> diasDaSemana
) {}