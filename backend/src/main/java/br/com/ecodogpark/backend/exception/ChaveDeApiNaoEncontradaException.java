package br.com.ecodogpark.backend.exception;

public class ChaveDeApiNaoEncontradaException extends RuntimeException {
    public ChaveDeApiNaoEncontradaException(String message) {
        super(message);
    }
}
