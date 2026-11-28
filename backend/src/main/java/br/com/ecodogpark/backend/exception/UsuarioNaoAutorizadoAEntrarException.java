package br.com.ecodogpark.backend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.UNAUTHORIZED)
public class UsuarioNaoAutorizadoAEntrarException extends RuntimeException {
    public UsuarioNaoAutorizadoAEntrarException(String message) {
        super(message);
    }
}
