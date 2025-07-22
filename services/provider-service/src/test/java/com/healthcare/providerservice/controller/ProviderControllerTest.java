package com.healthcare.providerservice.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.healthcare.providerservice.model.Provider;
import com.healthcare.providerservice.service.ProviderService;
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

@WebMvcTest(ProviderController.class)
public class ProviderControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ProviderService providerService;

    @Test
    public void testGetAllProviders() throws Exception {
        Provider provider1 = new Provider();
        provider1.setId(1L);
        provider1.setName("Dr. John Doe");

        Provider provider2 = new Provider();
        provider2.setId(2L);
        provider2.setName("Dr. Jane Smith");

        List<Provider> providers = Arrays.asList(provider1, provider2);

        when(providerService.getAllProviders()).thenReturn(providers);

        mockMvc.perform(get("/api/providers"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.size()").value(2))
                .andExpect(jsonPath("$[0].name").value("Dr. John Doe"));
    }

    @Test
    public void testGetProviderById() throws Exception {
        Provider provider = new Provider();
        provider.setId(1L);
        provider.setName("Dr. John Doe");

        when(providerService.getProviderById(1L)).thenReturn(Optional.of(provider));

        mockMvc.perform(get("/api/providers/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Dr. John Doe"));
    }

    @Test
    public void testGetProviderById_NotFound() throws Exception {
        when(providerService.getProviderById(1L)).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/providers/1"))
                .andExpect(status().isNotFound());
    }

    @Test
    public void testCreateProvider() throws Exception {
        Provider provider = new Provider();
        provider.setId(1L);
        provider.setName("Dr. John Doe");

        when(providerService.createProvider(any(Provider.class))).thenReturn(provider);

        mockMvc.perform(post("/api/providers")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(provider)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Dr. John Doe"));
    }

    @Test
    public void testUpdateProvider() throws Exception {
        Provider provider = new Provider();
        provider.setId(1L);
        provider.setName("Dr. John Doe Updated");

        when(providerService.updateProvider(eq(1L), any(Provider.class))).thenReturn(provider);

        mockMvc.perform(put("/api/providers/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(provider)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Dr. John Doe Updated"));
    }

    @Test
    public void testDeleteProvider() throws Exception {
        mockMvc.perform(delete("/api/providers/1"))
                .andExpect(status().isNoContent());
    }

    @Test
    public void testSearchProvidersBySpecialty() throws Exception {
        Provider provider = new Provider();
        provider.setId(1L);
        provider.setName("Dr. John Doe");
        provider.setSpecialty("Cardiology");

        List<Provider> providers = Arrays.asList(provider);

        when(providerService.searchBySpecialty("Cardiology")).thenReturn(providers);

        mockMvc.perform(get("/api/providers/search").param("specialty", "Cardiology"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.size()").value(1))
                .andExpect(jsonPath("$[0].specialty").value("Cardiology"));
    }
}
