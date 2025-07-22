package com.healthcare.providerservice.service;

import com.healthcare.providerservice.model.Practice;
import com.healthcare.providerservice.repository.PracticeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PracticeService {

    @Autowired
    private PracticeRepository practiceRepository;

    public List<Practice> getAllPractices() {
        return practiceRepository.findAll();
    }

    public Optional<Practice> getPracticeById(Long id) {
        return practiceRepository.findById(id);
    }

    public Practice createPractice(Practice practice) {
        return practiceRepository.save(practice);
    }

    public Practice updatePractice(Long id, Practice practiceDetails) {
        Practice practice = practiceRepository.findById(id).orElseThrow(() -> new RuntimeException("Practice not found"));
        practice.setName(practiceDetails.getName());
        practice.setAddress(practiceDetails.getAddress());
        practice.setPhoneNumber(practiceDetails.getPhoneNumber());
        practice.setWebsite(practiceDetails.getWebsite());
        return practiceRepository.save(practice);
    }

    public void deletePractice(Long id) {
        practiceRepository.deleteById(id);
    }
}
