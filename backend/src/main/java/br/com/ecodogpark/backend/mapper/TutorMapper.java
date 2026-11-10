package br.com.ecodogpark.backend.mapper;

import br.com.ecodogpark.backend.dto.TutorDTO.request.AtualizarDadosRequest;
import br.com.ecodogpark.backend.dto.TutorDTO.response.MeusDadosResponse;
import br.com.ecodogpark.backend.entity.UsuariosEntity;
import org.springframework.stereotype.Component;

@Component
public class TutorMapper {
    public static MeusDadosResponse entityParaResponse(UsuariosEntity tutor) {
        return new MeusDadosResponse(
                tutor.getIdUsuario(),
                tutor.getNome(),
                tutor.getSobrenome(),
                tutor.getCpf(),
                tutor.getTelefone(),
                tutor.getEmail(),
                tutor.getDataCadastro(),
                EnderecoMapper.entityParaResponse(tutor.getEndereco())
        );
    }

    public static void atualizarEntity(UsuariosEntity tutor, AtualizarDadosRequest request) {
        tutor.setNome(request.nome());
        tutor.setSobrenome(request.sobrenome());
        tutor.setCpf(request.cpf());
        tutor.setTelefone(request.telefone());
        tutor.setEmail(request.email());

        if (request.endereco() != null) {
            if (tutor.getEndereco() == null) {
                tutor.setEndereco(EnderecoMapper.requestParaEntity(request.endereco()));
            } else  {
                EnderecoMapper.atualizarEntity(tutor.getEndereco(), request.endereco());
            }
        }
    }
}
