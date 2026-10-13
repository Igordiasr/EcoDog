package br.com.ecodogpark.backend.repository;

import br.com.ecodogpark.backend.entity.AtividadesDoDiaEntity;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AtividadeDoDiaRepository extends JpaRepository<AtividadesDoDiaEntity, Long> {
    @Transactional
    @Modifying
    @Query("UPDATE AtividadesDoDiaEntity a SET a.situacao = :situacao WHERE a.idAtividadeDoDia = :id")
    void concluirAtividade(@Param("situacao") String situacao, @Param("id") Long idAtividade);
}
