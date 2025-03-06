package com.example.asset360.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class HomeController {
    
    @GetMapping("/")
    public String home() {
        // Jika sudah login, user akan diarahkan ke dashboard
        return "redirect:/dashboard";
    }
}
