package br.com.ecodogpark.backend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.UNPROCESSABLE_CONTENT)
public class DadoInvalidoException extends RuntimeException {
    public DadoInvalidoException(String message) {
        super(message);
    }
}
