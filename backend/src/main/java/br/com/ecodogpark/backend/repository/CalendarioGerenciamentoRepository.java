package br.com.ecodogpark.backend.repository;

import br.com.ecodogpark.backend.entity.CalendarioEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface CalendarioGerenciamentoRepository extends JpaRepository<CalendarioEntity, Long> {
    Optional<CalendarioEntity> findByData(LocalDate data);
    List<CalendarioEntity> findByDataBetweenOrderByDataAsc(LocalDate inicio, LocalDate fim);
}
