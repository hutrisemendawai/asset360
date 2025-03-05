package com.example.asset360.controller;

import com.example.asset360.model.Location;
import com.example.asset360.repository.LocationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

@Controller
@RequestMapping("/locations")
public class LocationController {

    @Autowired
    private LocationRepository locationRepository;

    // Menampilkan daftar lokasi
    @GetMapping
    public String listLocations(Model model) {
        model.addAttribute("locations", locationRepository.findAll());
        return "locations/list";
    }

    // Menampilkan form tambah lokasi
    @GetMapping("/new")
    public String showCreateForm(Model model) {
        model.addAttribute("location", new Location());
        return "locations/form";
    }

    // Memproses penyimpanan lokasi baru
    @PostMapping("/save")
    public String saveLocation(@ModelAttribute("location") Location location) {
        locationRepository.save(location);
        return "redirect:/locations";
    }

    // Menampilkan form edit lokasi
    @GetMapping("/edit/{id}")
    public String showEditForm(@PathVariable("id") Integer id, Model model) {
        Location location = locationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Invalid location Id:" + id));
        model.addAttribute("location", location);
        return "locations/form";
    }

    // Menghapus lokasi
    @GetMapping("/delete/{id}")
    public String deleteLocation(@PathVariable("id") Integer id) {
        Location location = locationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Invalid location Id:" + id));
        locationRepository.delete(location);
        return "redirect:/locations";
    }
}
