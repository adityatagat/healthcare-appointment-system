package com.healthcare.providerservice.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.healthcare.providerservice.model.Practice;
import com.healthcare.providerservice.service.PracticeService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(PracticeController.class)
public class PracticeControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private PracticeService practiceService;

    @Test
    public void testGetAllPractices() throws Exception {
        Practice practice1 = new Practice();
        practice1.setId(1L);
        practice1.setName("General Hospital");

        Practice practice2 = new Practice();
        practice2.setId(2L);
        practice2.setName("City Clinic");

        List<Practice> practices = Arrays.asList(practice1, practice2);

        when(practiceService.getAllPractices()).thenReturn(practices);

        mockMvc.perform(get("/api/practices"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.size()").value(2))
                .andExpect(jsonPath("$[0].name").value("General Hospital"));
    }

    @Test
    public void testGetPracticeById() throws Exception {
        Practice practice = new Practice();
        practice.setId(1L);
        practice.setName("General Hospital");

        when(practiceService.getPracticeById(1L)).thenReturn(Optional.of(practice));

        mockMvc.perform(get("/api/practices/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("General Hospital"));
    }

    @Test
    public void testGetPracticeById_NotFound() throws Exception {
        when(practiceService.getPracticeById(1L)).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/practices/1"))
                .andExpect(status().isNotFound());
    }

    @Test
    public void testCreatePractice() throws Exception {
        Practice practice = new Practice();
        practice.setId(1L);
        practice.setName("General Hospital");

        when(practiceService.createPractice(any(Practice.class))).thenReturn(practice);

        mockMvc.perform(post("/api/practices")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(practice)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("General Hospital"));
    }

    @Test
    public void testUpdatePractice() throws Exception {
        Practice practice = new Practice();
        practice.setId(1L);
        practice.setName("General Hospital Updated");

        when(practiceService.updatePractice(eq(1L), any(Practice.class))).thenReturn(practice);

        mockMvc.perform(put("/api/practices/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(practice)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("General Hospital Updated"));
    }

    @Test
    public void testDeletePractice() throws Exception {
        mockMvc.perform(delete("/api/practices/1"))
                .andExpect(status().isNoContent());
    }
}
