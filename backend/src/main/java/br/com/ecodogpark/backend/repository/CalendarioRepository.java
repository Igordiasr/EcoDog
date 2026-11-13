package br.com.ecodogpark.backend.repository;

import br.com.ecodogpark.backend.dto.DashboardDTO.response.VagasTotaisMesResponse;
import br.com.ecodogpark.backend.entity.CalendarioEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface CalendarioRepository extends JpaRepository<CalendarioEntity, Long> {
    @Query("""
        SELECT c FROM CalendarioEntity c
            WHERE c.data >= :inicio
              AND c.data <= :fim
    """)
    List<CalendarioEntity> buscarCalendario(@Param("inicio") LocalDate inicio,
                                            @Param("fim") LocalDate fim);

    @Query("""
        SELECT new br.com.ecodogpark.backend.dto.DashboardDTO.response.VagasTotaisMesResponse(
                SUM(c.vagasCreche), SUM(c.vagasHotel))
        FROM CalendarioEntity c
        WHERE c.data >= :inicio AND c.data < :fim
    """)
    VagasTotaisMesResponse buscarVagasTotaisNoMes(@Param("inicio") LocalDate inicio, @Param("fim") LocalDate fim);

    Optional<CalendarioEntity> findByData(LocalDate data);
}
