package com.example.asset360.controller;

import com.example.asset360.model.AssetCategory;
import com.example.asset360.repository.AssetCategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

@Controller
@RequestMapping("/asset_categories")
public class AssetCategoryController {

    @Autowired
    private AssetCategoryRepository assetCategoryRepository;

    @GetMapping
    public String listAssetCategories(Model model) {
        model.addAttribute("categories", assetCategoryRepository.findAll());
        return "asset_categories/list"; // pastikan view asset_categories/list.html sudah ada
    }

    @GetMapping("/new")
    public String showCreateForm(Model model) {
        model.addAttribute("category", new AssetCategory());
        return "asset_categories/form"; // pastikan view asset_categories/form.html sudah ada
    }

    @PostMapping("/save")
    public String saveAssetCategory(@ModelAttribute("category") AssetCategory category) {
        assetCategoryRepository.save(category);
        return "redirect:/asset_categories";
    }

    // Tampilkan form edit kategori
    @GetMapping("/edit/{id}")
    public String showEditForm(@PathVariable("id") Integer id, Model model) {
        AssetCategory category = assetCategoryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Invalid category Id:" + id));
        model.addAttribute("category", category);
        return "asset_categories/form";
    }

    // Proses update kategori (mapping POST untuk /edit/{id})
    @PostMapping("/edit/{id}")
    public String updateAssetCategory(@PathVariable("id") Integer id, @ModelAttribute("category") AssetCategory category) {
        AssetCategory existingCategory = assetCategoryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Invalid category Id:" + id));
        existingCategory.setCategoryName(category.getCategoryName());
        assetCategoryRepository.save(existingCategory);
        return "redirect:/asset_categories";
    }

    @GetMapping("/delete/{id}")
    public String deleteAssetCategory(@PathVariable("id") Integer id) {
        AssetCategory category = assetCategoryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Invalid category Id:" + id));
        assetCategoryRepository.delete(category);
        return "redirect:/asset_categories";
    }
}
