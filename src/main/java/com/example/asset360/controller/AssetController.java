package com.example.asset360.controller;

import com.example.asset360.model.Asset;
import com.example.asset360.repository.AssetCategoryRepository;
import com.example.asset360.repository.AssetRepository;
import com.example.asset360.repository.DepartmentRepository;
import com.example.asset360.repository.LocationRepository;
import com.example.asset360.service.AssetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

@Controller
@RequestMapping("/assets")
public class AssetController {

    @Autowired
    private AssetService assetService;

    @Autowired
    private AssetRepository assetRepository;

    @Autowired
    private LocationRepository locationRepository;

    @Autowired
    private AssetCategoryRepository assetCategoryRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    // Menampilkan daftar aset
    @GetMapping
    public String listAssets(Model model) {
        model.addAttribute("assets", assetRepository.findAll());
        return "assets/list";
    }

    // Menampilkan form tambah aset
    @GetMapping("/new")
    public String showCreateForm(Model model) {
        model.addAttribute("asset", new Asset());
        model.addAttribute("locations", locationRepository.findAll());
        model.addAttribute("categories", assetCategoryRepository.findAll());
        model.addAttribute("departments", departmentRepository.findAll());
        return "assets/form";
    }

    // Memproses penyimpanan aset baru
    @PostMapping("/save")
    public String saveAsset(@ModelAttribute("asset") Asset asset) {
        assetService.saveAsset(asset);
        return "redirect:/assets";
    }

    // Menampilkan form edit aset
    @GetMapping("/edit/{id}")
    public String showEditForm(@PathVariable("id") Integer id, Model model) {
        Asset asset = assetRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Invalid asset Id:" + id));
        model.addAttribute("asset", asset);
        model.addAttribute("locations", locationRepository.findAll());
        model.addAttribute("categories", assetCategoryRepository.findAll());
        model.addAttribute("departments", departmentRepository.findAll());
        return "assets/form";
    }

    // Proses update aset
    @PostMapping("/update/{id}")
    public String updateAsset(@PathVariable("id") Integer id, @ModelAttribute("asset") Asset updatedAsset) {
        // Ambil aset yang sudah ada dari database
        Asset existingAsset = assetRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Invalid asset Id:" + id));
        // Update field-field yang dapat diedit
        existingAsset.setAssetName(updatedAsset.getAssetName());
        existingAsset.setAssetValue(updatedAsset.getAssetValue());
        existingAsset.setPurchaseDate(updatedAsset.getPurchaseDate());
        existingAsset.setLocation(updatedAsset.getLocation());
        existingAsset.setCategory(updatedAsset.getCategory());
        existingAsset.setDepartment(updatedAsset.getDepartment());
        // Catatan: fixedAssetCode tidak diubah saat update.
        assetRepository.save(existingAsset);
        return "redirect:/assets";
    }

    // Hapus aset
    @GetMapping("/delete/{id}")
    public String deleteAsset(@PathVariable("id") Integer id) {
        Asset asset = assetRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Invalid asset Id:" + id));
        assetRepository.delete(asset);
        return "redirect:/assets";
    }
}
