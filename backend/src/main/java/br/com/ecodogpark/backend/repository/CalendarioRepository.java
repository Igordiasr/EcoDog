package br.com.ecodogpark.backend.repository;

import br.com.ecodogpark.backend.entity.CalendarioEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface CalendarioRepository extends JpaRepository<CalendarioEntity, Long> {
    @Query("""
        SELECT c FROM CalendarioEntity c
            WHERE c.data >= :inicio
              AND c.data <= :fim
    """)
    List<CalendarioEntity> buscarCalendario(@Param("inicio") LocalDate inicio,
                                            @Param("fim") LocalDate fim);
}
