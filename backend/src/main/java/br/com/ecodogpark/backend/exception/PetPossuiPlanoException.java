package br.com.ecodogpark.backend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.CONFLICT)
public class PetPossuiPlanoException extends RuntimeException {
    public PetPossuiPlanoException(String message) {
        super(message);
    }
}
