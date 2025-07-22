package com.healthcare.providerservice.repository;

import com.healthcare.providerservice.model.Provider;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProviderRepository extends JpaRepository<Provider, Long> {

    List<Provider> findBySpecialtyContainingIgnoreCase(String specialty);
}
