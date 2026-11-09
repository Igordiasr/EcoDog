package br.com.ecodogpark.backend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.FORBIDDEN)
public class TipoUsuarioInvalidoException extends RuntimeException{
    public TipoUsuarioInvalidoException(String message) {
        super(message);
    }
}
