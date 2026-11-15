package br.com.ecodogpark.backend.dto.UsuarioDTO;

import java.math.BigDecimal;
import java.util.UUID;

public record ClienteResponse(
        UUID idTutor,
        String nomeTutor,
        UUID idPet,
        String nomePet,
        Long idContrato,
        String servico,
        BigDecimal valor,
        Boolean ativo
) {}