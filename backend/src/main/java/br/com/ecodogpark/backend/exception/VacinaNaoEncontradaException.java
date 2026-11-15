package br.com.ecodogpark.backend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND)
public class VacinaNaoEncontradaException extends RuntimeException {
    public VacinaNaoEncontradaException(String message) {
        super(message);
    }
}
