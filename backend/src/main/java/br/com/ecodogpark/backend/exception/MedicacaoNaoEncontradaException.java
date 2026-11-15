package br.com.ecodogpark.backend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND)
public class MedicacaoNaoEncontradaException extends RuntimeException {
    public MedicacaoNaoEncontradaException(String message) {
        super(message);
    }
}
