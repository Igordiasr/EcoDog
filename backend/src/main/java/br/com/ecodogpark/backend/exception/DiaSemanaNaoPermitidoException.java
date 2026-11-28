package br.com.ecodogpark.backend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.BAD_REQUEST)
public class DiaSemanaNaoPermitidoException extends RuntimeException {
    public DiaSemanaNaoPermitidoException(String message) {
        super(message);
    }
}
