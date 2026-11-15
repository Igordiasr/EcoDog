package br.com.ecodogpark.backend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND)
public class TutorNaoEncontradoException extends RuntimeException {
    public TutorNaoEncontradoException(String message) {
        super(message);
    }
}
