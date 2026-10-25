package br.com.ecodogpark.backend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND)
public class PetNaoEncontradoException extends RuntimeException {
    public PetNaoEncontradoException(String message) {
        super(message);
    }
}
