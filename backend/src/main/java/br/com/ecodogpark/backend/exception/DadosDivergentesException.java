package br.com.ecodogpark.backend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.FORBIDDEN)
public class DadosDivergentesException extends RuntimeException {
    public DadosDivergentesException(String message) {
        super(message);
    }
}
