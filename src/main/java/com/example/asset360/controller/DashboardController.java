package com.example.asset360.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class DashboardController {
    
    @GetMapping("/dashboard")
    public String dashboard() {
        return "dashboard"; // menuju src/main/resources/templates/dashboard.html
    }
}
