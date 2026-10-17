package br.com.ecodogpark.backend.enums;

public enum TipoUsuario {
    TUTOR("1"),
    MONITOR("2");

    private final String valor;

    TipoUsuario(String valor) {
        this.valor = valor;
    }

    public String getValor() {
        return valor;
    }
}
