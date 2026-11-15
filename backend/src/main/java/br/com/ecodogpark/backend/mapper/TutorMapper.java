package br.com.ecodogpark.backend.mapper;

import br.com.ecodogpark.backend.dto.TutorDTO.request.*;
import br.com.ecodogpark.backend.dto.TutorDTO.response.*;
import br.com.ecodogpark.backend.dto.UsuarioDTO.UsuarioRequest;
import br.com.ecodogpark.backend.entity.*;
import br.com.ecodogpark.backend.enums.TipoUsuario;
import org.springframework.stereotype.Component;

@Component
public class TutorMapper {
    public static UsuariosEntity requestParaEntity(CadastroTutorRequest request) {
        UsuariosEntity tutor = new UsuariosEntity();
        tutor.setNome(request.nome());
        tutor.setSobrenome(request.sobrenome());
        tutor.setCpf(request.cpf());
        tutor.setTelefone(request.telefone().trim());
        tutor.setEmail(request.email());
        tutor.setTipo(TipoUsuario.TUTOR);
        tutor.setStatusUsuario(true);

        EnderecoEntity endereco = new EnderecoEntity();
        endereco.setRua(request.endereco().rua());
        endereco.setNumero(request.endereco().numero());
        endereco.setComplemento(request.endereco().complemento());
        endereco.setBairro(request.endereco().bairro());
        endereco.setCidade(request.endereco().cidade());
        endereco.setCep(request.endereco().cep());

        tutor.setEndereco(endereco);

        return tutor;
    }

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

    public static TutorCadastroResponse entityParaCadastroResponse(UsuariosEntity tutor) {
        return new TutorCadastroResponse(
                tutor.getIdUsuario(),
                tutor.getNome(),
                tutor.getSobrenome(),
                tutor.getEmail(),
                tutor.getTelefone()
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

    public static AlergiasEntity requestParaEntity(AlergiaRequest request) {
        AlergiasEntity alergia = new AlergiasEntity();
        alergia.setDescricao(request.nome());

        return alergia;
    }

    public static AlergiaResponse entityParaResponse(AlergiasEntity alergia) {
        return new AlergiaResponse(
                alergia.getIdAlergias(),
                alergia.getDescricao()
        );
    }

    public static MedicacoesEntity requestParaEntity(MedicacaoRequest request) {
        MedicacoesEntity medicacao = new MedicacoesEntity();
        medicacao.setNome(request.nome());
        medicacao.setTipo(request.tipo());

        return medicacao;
    }

    public static MedicacaoResponse entityParaResponse(MedicacoesEntity medicacao) {
        return new MedicacaoResponse(
                medicacao.getIdMedicacoes(),
                medicacao.getNome(),
                medicacao.getTipo()
        );
    }

    public static VacinasEntity requestParaEntity(VacinaRequest request) {
        VacinasEntity vacina = new VacinasEntity();
        vacina.setNome(request.nome());
        vacina.setTipo(request.tipo());

        return vacina;
    }

    public static VacinaResponse entityParaResponse(VacinasEntity vacina) {
        return new VacinaResponse(
                vacina.getIdVacinas(),
                vacina.getNome(),
                vacina.getTipo()
        );
    }
}
