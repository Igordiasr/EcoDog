package br.com.ecodogpark.backend.mapper;

import br.com.ecodogpark.backend.dto.TutorDTO.request.EnderecoRequest;
import br.com.ecodogpark.backend.dto.TutorDTO.response.EnderecoResponse;
import br.com.ecodogpark.backend.entity.EnderecoEntity;

public class EnderecoMapper {
    public static EnderecoResponse entityParaResponse(EnderecoEntity endereco) {
        if (endereco == null) {
            return null;
        }

        return new EnderecoResponse(
                endereco.getRua(),
                endereco.getNumero(),
                endereco.getComplemento(),
                endereco.getBairro(),
                endereco.getCidade(),
                endereco.getCep()
        );
    }

    public static EnderecoEntity requestParaEntity(EnderecoRequest request) {
        EnderecoEntity endereco = new EnderecoEntity();
        endereco.setRua(request.rua());
        endereco.setNumero(request.numero());
        endereco.setComplemento(request.complemento());
        endereco.setBairro(request.bairro());
        endereco.setCidade(request.cidade());
        endereco.setCep(request.cep());

        return endereco;
    }

    public static void atualizarEntity(EnderecoEntity endereco, EnderecoRequest request) {
        endereco.setRua(request.rua());
        endereco.setNumero(request.numero());
        endereco.setComplemento(request.complemento());
        endereco.setBairro(request.bairro());
        endereco.setCidade(request.cidade());
        endereco.setCep(request.cep());
    }
}
