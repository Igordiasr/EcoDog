package br.com.ecodogpark.backend.dto.PlanoDTO.response;

import br.com.ecodogpark.backend.enums.CategoriaServico;
import br.com.ecodogpark.backend.enums.ModalidadeServico;
import java.math.BigDecimal;

public record PlanoResponse(Long id, String nome, CategoriaServico categoria,
        ModalidadeServico modalidade, Integer frequencia, BigDecimal valor, Boolean status) {}
