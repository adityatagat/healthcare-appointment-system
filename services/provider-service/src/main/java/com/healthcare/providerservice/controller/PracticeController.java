package com.healthcare.providerservice.controller;

import com.healthcare.providerservice.model.Practice;
import com.healthcare.providerservice.service.PracticeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/practices")
public class PracticeController {

    @Autowired
    private PracticeService practiceService;

    @GetMapping
    public List<Practice> getAllPractices() {
        return practiceService.getAllPractices();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Practice> getPracticeById(@PathVariable Long id) {
        return practiceService.getPracticeById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Practice createPractice(@RequestBody Practice practice) {
        return practiceService.createPractice(practice);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Practice> updatePractice(@PathVariable Long id, @RequestBody Practice practiceDetails) {
        try {
            return ResponseEntity.ok(practiceService.updatePractice(id, practiceDetails));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePractice(@PathVariable Long id) {
        practiceService.deletePractice(id);
        return ResponseEntity.noContent().build();
    }
}
