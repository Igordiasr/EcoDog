package br.com.ecodogpark.backend.enums;

import java.util.Arrays;
import java.util.Locale;

public enum CategoriaAtividade {
    REFEICAO("REFEICAO"),
    ALIMENTACAO("ALIMENTACAO"),
    RACAO("RACAO");

    private final String valor;

    CategoriaAtividade(String valor) {
        this.valor = valor;
    }

    public String getValor() {
        return valor;
    }

    /**
     * Verifica se a categoria informada representa uma refeição/alimentação.
     * A comparação é tolerante a maiúsculas/minúsculas e a valores compostos
     * (ex.: "POTINHO_REFEICAO").
     */
    public static boolean isRefeicao(String categoria) {
        if (categoria == null) {
            return false;
        }
        String normalizada = categoria.toUpperCase(Locale.ROOT);
        return Arrays.stream(values())
                .anyMatch(c -> normalizada.contains(c.valor));
    }
}
