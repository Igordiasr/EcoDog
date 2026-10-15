package br.com.ecodogpark.backend.repository;

import br.com.ecodogpark.backend.entity.PetsEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PetsRepository extends JpaRepository<PetsEntity, Long> {
//    boolean existsByTutorId(Long tutorId);
    List<PetsEntity> findByFkUsuarioIdUsuario(Long idTutor);
}
