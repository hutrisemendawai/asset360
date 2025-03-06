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

    @GetMapping
    public String listLocations(Model model) {
        model.addAttribute("locations", locationRepository.findAll());
        return "locations/list"; // pastikan view locations/list.html sudah ada
    }

    @GetMapping("/new")
    public String showCreateForm(Model model) {
        model.addAttribute("location", new Location());
        return "locations/form"; // pastikan view locations/form.html sudah ada
    }

    @PostMapping("/save")
    public String saveLocation(@ModelAttribute("location") Location location) {
        locationRepository.save(location);
        return "redirect:/locations";
    }

    // Tampilkan form edit lokasi
    @GetMapping("/edit/{id}")
    public String showEditForm(@PathVariable("id") Integer id, Model model) {
        Location location = locationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Invalid location Id:" + id));
        model.addAttribute("location", location);
        return "locations/form";
    }

    // Proses update lokasi (mapping POST untuk /edit/{id})
    @PostMapping("/edit/{id}")
    public String updateLocation(@PathVariable("id") Integer id, @ModelAttribute("location") Location location) {
        Location existingLocation = locationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Invalid location Id:" + id));
        existingLocation.setLocationName(location.getLocationName());
        existingLocation.setRegion(location.getRegion());
        locationRepository.save(existingLocation);
        return "redirect:/locations";
    }

    @GetMapping("/delete/{id}")
    public String deleteLocation(@PathVariable("id") Integer id) {
        Location location = locationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Invalid location Id:" + id));
        locationRepository.delete(location);
        return "redirect:/locations";
    }
}
