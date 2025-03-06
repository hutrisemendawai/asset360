package com.example.asset360.controller;

import com.example.asset360.model.User;
import com.example.asset360.model.Location;
import com.example.asset360.service.CustomUserDetailsService;
import com.example.asset360.repository.LocationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

@Controller
public class AuthController {
    
    @Autowired
    private CustomUserDetailsService userDetailsService;
    
    @Autowired
    private BCryptPasswordEncoder passwordEncoder;
    
    @Autowired
    private LocationRepository locationRepository;
    
    @GetMapping("/register")
    public String showRegistrationForm(Model model) {
        model.addAttribute("user", new User());
        model.addAttribute("locations", locationRepository.findAll());
        return "register"; 
    }
    
    @PostMapping("/register")
    public String processRegistration(@ModelAttribute("user") User user,
                                      @RequestParam("locationId") Integer locationId,
                                      Model model) {
        if (userDetailsService.userExists(user.getEmail())) {
            model.addAttribute("error", "Email sudah digunakan.");
            return "register";
        }
        
        // Enkripsi password
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        
        // Set region berdasarkan lokasi yang dipilih
        Location loc = locationRepository.findById(locationId).orElse(null);
        if (loc != null) {
            user.setRegion(loc.getRegion());
        } else {
            user.setRegion("Palembang"); // default jika tidak ditemukan
        }
        
        userDetailsService.save(user);
        return "redirect:/login?registered";
    }
    
    @GetMapping("/login")
    public String showLoginForm() {
        return "login"; 
    }
}
