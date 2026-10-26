package br.com.ecodogpark.backend;

import io.swagger.v3.core.util.Json;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT, properties = {
        "twilio.account-sid=test", "twilio.auth-token=test",
        "twilio.whatsapp-number=whatsapp:+5511000000000", "twilio.content-sid=test"
})
class SwaggerDocumentationTests {
    @LocalServerPort
    private int port;

    @Test
    void documentacaoDeveDescreverTodosOsEndpointsEDtosExpostos() throws Exception {
        try (HttpClient client = HttpClient.newHttpClient()) {
            var response = client.send(HttpRequest.newBuilder(
                    URI.create("http://localhost:" + port + "/v3/api-docs")).GET().build(),
                    HttpResponse.BodyHandlers.ofString());
            assertEquals(200, response.statusCode());
            var document = Json.mapper().readTree(response.body());
            var paths = document.path("paths");
            assertTrue(paths.has("/calendario/planos/agendamentos"));
            assertTrue(paths.has("/calendario/agendamentos/{idAgendamento}/cancelar"));
            assertFalse(paths.has("/api/whatsapp/simular"));
            assertFalse(paths.has("/api/whatsapp/enviar"));
            Set<String> methods = Set.of("get", "post", "put", "patch", "delete");
            paths.fields().forEachRemaining(path -> path.getValue().fields().forEachRemaining(operation -> {
                if (!methods.contains(operation.getKey())) return;
                String context = operation.getKey() + " " + path.getKey();
                assertFalse(operation.getValue().path("summary").asText().isBlank(), context);
                assertFalse(operation.getValue().path("description").asText().isBlank(), context);
                assertFalse(operation.getValue().path("responses").isEmpty(), context);
            }));
            var schemas = document.path("components").path("schemas");
            assertTrue(schemas.has("OrcamentoRequest"));
            assertTrue(schemas.has("AgendamentoPlanoResponse"));
            schemas.fields().forEachRemaining(schema -> {
                if (!schema.getKey().endsWith("Request") && !schema.getKey().endsWith("Response")) return;
                assertFalse(schema.getValue().path("description").asText().isBlank(), schema.getKey());
                schema.getValue().path("properties").fields().forEachRemaining(field ->
                        assertFalse(field.getValue().path("description").asText().isBlank(),
                                schema.getKey() + "." + field.getKey()));
            });
        }
    }
}
