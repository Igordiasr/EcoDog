package br.com.ecodogpark.backend.dto;

import br.com.ecodogpark.backend.entity.AtividadeEntity;

public class AtividadeDoDiaResponse {
    String nomeAtividade;
    Boolean status;
    String observacao;

    public AtividadeDoDiaResponse(String nomeAtividade, Boolean status, String observacao) {
        this.nomeAtividade = nomeAtividade;
        this.status = status;
        this.observacao = observacao;
    }

    public String getNomeAtividade() {
        return nomeAtividade;
    }

    public void setNomeAtividade(String nomeAtividade) {
        this.nomeAtividade = nomeAtividade;
    }

    public Boolean getStatus() {
        return status;
    }

    public void setStatus(Boolean status) {
        this.status = status;
    }

    public String getObservacao() {
        return observacao;
    }

    public void setObservacao(String observacao) {
        this.observacao = observacao;
    }
}
