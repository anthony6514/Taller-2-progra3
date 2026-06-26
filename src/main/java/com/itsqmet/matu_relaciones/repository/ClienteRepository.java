package com.itsqmet.matu_relaciones.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.itsqmet.matu_relaciones.model.Cliente;

public interface ClienteRepository extends JpaRepository<Cliente, Long> {

}
