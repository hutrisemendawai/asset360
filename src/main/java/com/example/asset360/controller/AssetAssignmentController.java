package com.example.asset360.controller;

import com.example.asset360.model.AssetAssignment;
import com.example.asset360.repository.AssetAssignmentRepository;
import com.example.asset360.repository.AssetRepository;
import com.example.asset360.repository.DepartmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

@Controller
@RequestMapping("/asset_assignments")
public class AssetAssignmentController {

    @Autowired
    private AssetAssignmentRepository assetAssignmentRepository;

    @Autowired
    private AssetRepository assetRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @GetMapping
    public String listAssetAssignments(Model model) {
        model.addAttribute("assignments", assetAssignmentRepository.findAll());
        return "asset_assignments/list";
    }

    @GetMapping("/new")
    public String showCreateForm(Model model) {
        // Pastikan objek baru tidak null
        model.addAttribute("assignment", new AssetAssignment());
        model.addAttribute("assets", assetRepository.findAll());
        model.addAttribute("departments", departmentRepository.findAll());
        return "asset_assignments/form";
    }

    @PostMapping("/save")
    public String saveAssetAssignment(@ModelAttribute("assignment") AssetAssignment assignment) {
        assetAssignmentRepository.save(assignment);
        return "redirect:/asset_assignments";
    }

    @GetMapping("/edit/{id}")
    public String showEditForm(@PathVariable("id") Integer id, Model model) {
        AssetAssignment assignment = assetAssignmentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Invalid assignment Id:" + id));
        model.addAttribute("assignment", assignment);
        model.addAttribute("assets", assetRepository.findAll());
        model.addAttribute("departments", departmentRepository.findAll());
        return "asset_assignments/form";
    }

    @GetMapping("/delete/{id}")
    public String deleteAssetAssignment(@PathVariable("id") Integer id) {
        AssetAssignment assignment = assetAssignmentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Invalid assignment Id:" + id));
        assetAssignmentRepository.delete(assignment);
        return "redirect:/asset_assignments";
    }
}
