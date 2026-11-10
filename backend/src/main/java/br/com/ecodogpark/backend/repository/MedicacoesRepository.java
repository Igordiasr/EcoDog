package br.com.ecodogpark.backend.repository;

import br.com.ecodogpark.backend.entity.MedicacaoDoDiaEntity;
import br.com.ecodogpark.backend.entity.MedicacoesEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MedicacoesRepository extends JpaRepository<MedicacoesEntity, Long> {


}
