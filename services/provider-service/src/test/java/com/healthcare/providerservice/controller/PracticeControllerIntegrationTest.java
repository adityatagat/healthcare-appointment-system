package com.healthcare.providerservice.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.healthcare.providerservice.model.Practice;
import com.healthcare.providerservice.repository.PracticeRepository;
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
public class PracticeControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private PracticeRepository practiceRepository;

    @BeforeEach
    public void setup() {
        practiceRepository.deleteAll();
    }

    @Test
    public void testCreatePractice() throws Exception {
        Practice practice = new Practice();
        practice.setName("Test Practice");
        practice.setAddress("123 Test St");
        practice.setPhoneNumber("123-456-7890");

        mockMvc.perform(post("/api/practices")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(practice)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Test Practice"));
    }

    @Test
    public void testGetAllPractices() throws Exception {
        Practice practice = new Practice();
        practice.setName("Test Practice");
        practice.setAddress("123 Test St");
        practice.setPhoneNumber("123-456-7890");
        practiceRepository.save(practice);

        mockMvc.perform(get("/api/practices"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.size()").value(1))
                .andExpect(jsonPath("$[0].name").value("Test Practice"));
    }

    @Test
    public void testGetPracticeById() throws Exception {
        Practice practice = new Practice();
        practice.setName("Test Practice");
        practice.setAddress("123 Test St");
        practice.setPhoneNumber("123-456-7890");
        Practice savedPractice = practiceRepository.save(practice);

        mockMvc.perform(get("/api/practices/" + savedPractice.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Test Practice"));
    }

    @Test
    public void testUpdatePractice() throws Exception {
        Practice practice = new Practice();
        practice.setName("Test Practice");
        practice.setAddress("123 Test St");
        practice.setPhoneNumber("123-456-7890");
        Practice savedPractice = practiceRepository.save(practice);

        Practice updatedInfo = new Practice();
        updatedInfo.setName("Updated Practice");
        updatedInfo.setAddress("456 Updated St");
        updatedInfo.setPhoneNumber("987-654-3210");

        mockMvc.perform(put("/api/practices/" + savedPractice.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updatedInfo)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Updated Practice"))
                .andExpect(jsonPath("$.address").value("456 Updated St"));
    }

    @Test
    public void testDeletePractice() throws Exception {
        Practice practice = new Practice();
        practice.setName("Test Practice");
        practice.setAddress("123 Test St");
        practice.setPhoneNumber("123-456-7890");
        Practice savedPractice = practiceRepository.save(practice);

        mockMvc.perform(delete("/api/practices/" + savedPractice.getId()))
                .andExpect(status().isNoContent());
    }
}
