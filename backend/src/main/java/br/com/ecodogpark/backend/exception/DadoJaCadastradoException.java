package br.com.ecodogpark.backend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.CONFLICT)
public class DadoJaCadastradoException extends RuntimeException {
    public DadoJaCadastradoException(String message) {
        super(message);
    }
}
