package com.example.asset360.controller;

import com.example.asset360.model.User;
import com.example.asset360.model.Location;
import com.example.asset360.repository.LocationRepository;
import com.example.asset360.service.CustomUserDetailsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
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
        // Cek apakah email sudah ada
        if (userDetailsService.userExists(user.getEmail())) {
            model.addAttribute("error", "Email sudah digunakan.");
            model.addAttribute("locations", locationRepository.findAll());
            return "register";
        }
        
        // Enkripsi password
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        
        // Set region berdasarkan lokasi yang dipilih
        Location loc = locationRepository.findById(locationId).orElse(null);
        if (loc != null) {
            user.setRegion(loc.getRegion());
        } else {
            user.setRegion("Palembang"); // Default jika lokasi tidak ditemukan
        }
        
        try {
            userDetailsService.save(user);
            // Jika berhasil, redirect ke halaman login dengan parameter registered
            return "redirect:/login?registered";
        } catch (DataIntegrityViolationException ex) {
            // Ambil pesan error paling spesifik untuk mendeteksi field duplikat
            String specificMessage = ex.getMostSpecificCause().getMessage();
            String errorMsg = "Registrasi gagal. ";
            if (specificMessage.contains("UKqbdqjatm78k1givq9w1t73ixp")) {
                errorMsg += "Nomor KTP/NIK sudah digunakan.";
            } else if (specificMessage.contains("UK9q63snka3mdh91as4io72espi")) {
                errorMsg += "Nomor telepon sudah digunakan.";
            } else {
                errorMsg += "Terjadi kesalahan pada sistem.";
            }
            model.addAttribute("error", errorMsg);
            // Pastikan data lokasi tetap ditampilkan di form
            model.addAttribute("locations", locationRepository.findAll());
            return "register";
        }
    }
    
    @GetMapping("/login")
    public String showLoginForm() {
        return "login"; 
    }
}
