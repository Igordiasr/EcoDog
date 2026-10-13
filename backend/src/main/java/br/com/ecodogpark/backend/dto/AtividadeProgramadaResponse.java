package br.com.ecodogpark.backend.dto;

<<<<<<< HEAD
=======
import jakarta.validation.constraints.Pattern;

>>>>>>> dev
import java.time.LocalTime;
import java.util.List;

public record AtividadeProgramadaResponse(
<<<<<<< HEAD
        DetalhesAtividadeResponse atividade,
        List<GrupoPetsResponse> grupos,
        LocalTime horaInicio,
        LocalTime horaFim,
        Boolean status,
        String observacoes
=======
        Long idAtividadeDoDia,
        String nome,
        String descricao,
        String categoria,
        LocalTime horaInicio,
        LocalTime horaFim,
        String situacao,
        List<GrupoPetsResponse> grupos
>>>>>>> dev
) {
}
