package com.healthcare.providerservice.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.healthcare.providerservice.model.Practice;
import com.healthcare.providerservice.model.Provider;
import com.healthcare.providerservice.repository.PracticeRepository;
import com.healthcare.providerservice.repository.ProviderRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@Transactional
public class ProviderControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private ProviderRepository providerRepository;

    @Autowired
    private PracticeRepository practiceRepository;

    private Practice practice;

    @BeforeEach
    public void setup() {
        providerRepository.deleteAll();
        practiceRepository.deleteAll();
        practice = new Practice();
        practice.setName("Test Practice");
        practice.setAddress("123 Test St");
        practice.setPhoneNumber("123-456-7890");
        practice = practiceRepository.save(practice);
    }

    @Test
    public void testCreateProvider() throws Exception {
        Provider provider = new Provider();
        provider.setName("John Doe");
        provider.setSpecialty("Cardiology");
        provider.setPractice(practice);

        mockMvc.perform(post("/api/providers")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(provider)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("John Doe"));
    }

    @Test
    public void testGetAllProviders() throws Exception {
        Provider provider = new Provider();
        provider.setName("John Doe");
        provider.setSpecialty("Cardiology");
        provider.setPractice(practice);
        providerRepository.save(provider);

        mockMvc.perform(get("/api/providers"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.size()").value(1))
                .andExpect(jsonPath("$[0].name").value("John Doe"));
    }

    @Test
    public void testGetProviderById() throws Exception {
        Provider provider = new Provider();
        provider.setName("John Doe");
        provider.setSpecialty("Cardiology");
        provider.setPractice(practice);
        Provider savedProvider = providerRepository.save(provider);

        mockMvc.perform(get("/api/providers/" + savedProvider.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("John Doe"));
    }

    @Test
    public void testUpdateProvider() throws Exception {
        Provider provider = new Provider();
        provider.setName("John Doe");
        provider.setSpecialty("Cardiology");
        provider.setPractice(practice);
        Provider savedProvider = providerRepository.save(provider);

        Provider updatedInfo = new Provider();
        updatedInfo.setName("Jane Doe");
        updatedInfo.setSpecialty("Dermatology");
        updatedInfo.setPractice(practice);

        mockMvc.perform(put("/api/providers/" + savedProvider.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updatedInfo)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Jane Doe"))
                .andExpect(jsonPath("$.specialty").value("Dermatology"));
    }

    @Test
    public void testDeleteProvider() throws Exception {
        Provider provider = new Provider();
        provider.setName("John Doe");
        provider.setSpecialty("Cardiology");
        provider.setPractice(practice);
        Provider savedProvider = providerRepository.save(provider);

        mockMvc.perform(delete("/api/providers/" + savedProvider.getId()))
                .andExpect(status().isNoContent());
    }

    @Test
    public void testSearchProvidersBySpecialty() throws Exception {
        Provider provider = new Provider();
        provider.setName("John Doe");
        provider.setSpecialty("Cardiology");
        provider.setPractice(practice);
        providerRepository.save(provider);

        mockMvc.perform(get("/api/providers/search").param("specialty", "Cardiology"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.size()").value(1))
                .andExpect(jsonPath("$[0].specialty").value("Cardiology"));
    }
}
