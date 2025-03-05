package com.example.asset360.controller;

import com.example.asset360.model.User;
import com.example.asset360.service.CustomUserDetailsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

@Controller
public class ProfileController {
    
    @Autowired
    private CustomUserDetailsService userDetailsService;
    
    @GetMapping("/profile")
    public String showProfile(Model model, Authentication authentication) {
        String email = authentication.getName();
        User user = userDetailsService.findByEmail(email);
        model.addAttribute("user", user);
        return "edit-profile";
    }
    
    @PostMapping("/profile")
    public String updateProfile(@ModelAttribute("user") User updatedUser, Authentication authentication, Model model) {
        String email = authentication.getName();
        User existingUser = userDetailsService.findByEmail(email);
        
        // Update field yang dapat diubah (kecuali email dan password)
        existingUser.setFullName(updatedUser.getFullName());
        existingUser.setBirthPlace(updatedUser.getBirthPlace());
        existingUser.setBirthDate(updatedUser.getBirthDate());
        existingUser.setGender(updatedUser.getGender());
        existingUser.setIdentityNumber(updatedUser.getIdentityNumber());
        existingUser.setPhoneNumber(updatedUser.getPhoneNumber());
        existingUser.setAddress(updatedUser.getAddress());
        
        userDetailsService.save(existingUser);
        
        model.addAttribute("user", existingUser);
        model.addAttribute("message", "Profile updated successfully!");
        return "edit-profile";
    }
}
