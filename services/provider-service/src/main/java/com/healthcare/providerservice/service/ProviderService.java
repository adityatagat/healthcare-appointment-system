package com.healthcare.providerservice.service;

import com.healthcare.providerservice.model.Provider;
import com.healthcare.providerservice.repository.ProviderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ProviderService {

    @Autowired
    private ProviderRepository providerRepository;

    public List<Provider> getAllProviders() {
        return providerRepository.findAll();
    }

    public Optional<Provider> getProviderById(Long id) {
        return providerRepository.findById(id);
    }

    public Provider createProvider(Provider provider) {
        return providerRepository.save(provider);
    }

    public Provider updateProvider(Long id, Provider providerDetails) {
        Provider provider = providerRepository.findById(id).orElseThrow(() -> new RuntimeException("Provider not found"));
        provider.setName(providerDetails.getName());
        provider.setSpecialty(providerDetails.getSpecialty());
        provider.setPractice(providerDetails.getPractice());
        provider.setAddress(providerDetails.getAddress());
        provider.setPhoneNumber(providerDetails.getPhoneNumber());
        return providerRepository.save(provider);
    }

    public void deleteProvider(Long id) {
        providerRepository.deleteById(id);
    }

    public List<Provider> searchBySpecialty(String specialty) {
        return providerRepository.findBySpecialtyContainingIgnoreCase(specialty);
    }
}
