package br.com.ecodogpark.backend.enums;

public enum SituacaoAtividade {
    PENDENTE("PENDENTE"),
    CONCLUIDA("CONCLUIDA"),
    NAO_CONCLUIDA("NAO_CONCLUIDA");

    private final String valor;

    SituacaoAtividade(String valor) {
        this.valor = valor;
    }

    public String getValor() {
        return valor;
    }

    public static boolean isConcluida(String situacao) {
        return CONCLUIDA.valor.equalsIgnoreCase(situacao);
    }
}
