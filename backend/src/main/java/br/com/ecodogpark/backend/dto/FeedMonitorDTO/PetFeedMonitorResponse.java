package br.com.ecodogpark.backend.dto.FeedMonitorDTO;

import java.util.List;

public record PetFeedMonitorResponse(
        String nome,
        String raca,
        String nomeTutor,
        String observacao
//        List<String> alergias
) {
}
