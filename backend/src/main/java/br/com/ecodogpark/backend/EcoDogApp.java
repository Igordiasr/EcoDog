package br.com.ecodogpark.backend;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Contact;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.info.License;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@OpenAPIDefinition(
		info = @Info(
				title = "API de gerenciamento de agendamentos",
				version = "1.0",
				description = "API para gerenciar agendamentos de serviços de creche, hotel e dayuse para a EcoDog Park"
		)
)
@SpringBootApplication
public class EcoDogApp {

	public static void main(String[] args) {
		SpringApplication.run(EcoDogApp.class, args);
	}

}
