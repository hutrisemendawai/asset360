package com.example.asset360.controller;

import com.example.asset360.model.Asset;
import com.example.asset360.model.Location;
import com.example.asset360.model.User;
import com.example.asset360.repository.AssetCategoryRepository;
import com.example.asset360.repository.AssetRepository;
import com.example.asset360.repository.DepartmentRepository;
import com.example.asset360.repository.LocationRepository;
import com.example.asset360.service.AssetService;
import com.example.asset360.service.CustomUserDetailsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
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

    @Autowired
    private CustomUserDetailsService userDetailsService;

    // Menampilkan daftar aset (hanya aset di region user)
    @GetMapping
    public String listAssets(Model model, Authentication authentication) {
        String email = authentication.getName();
        User user = userDetailsService.findByEmail(email);
        String region = user.getRegion();
        model.addAttribute("assets", assetRepository.findByLocationRegion(region));
        return "assets/list";
    }

    // Menampilkan form tambah aset (dropdown lokasi di‐filter berdasarkan region user)
    @GetMapping("/new")
    public String showCreateForm(Model model, Authentication authentication) {
        String email = authentication.getName();
        User user = userDetailsService.findByEmail(email);
        String region = user.getRegion();
        model.addAttribute("asset", new Asset());
        model.addAttribute("locations", locationRepository.findByRegion(region));
        model.addAttribute("categories", assetCategoryRepository.findAll());
        model.addAttribute("departments", departmentRepository.findAll());
        return "assets/form";
    }

    // Memproses penyimpanan aset baru
    @PostMapping("/save")
    public String saveAsset(@ModelAttribute("asset") Asset asset, Authentication authentication) {
        String email = authentication.getName();
        User user = userDetailsService.findByEmail(email);
        String userRegion = user.getRegion();
        if (!asset.getLocation().getRegion().equalsIgnoreCase(userRegion)) {
            return "redirect:/assets?error=Region mismatch";
        }
        assetService.saveAsset(asset);
        return "redirect:/assets";
    }

    // Menampilkan form edit aset
    @GetMapping("/edit/{id}")
    public String showEditForm(@PathVariable("id") Integer id, Model model, Authentication authentication) {
        String email = authentication.getName();
        User user = userDetailsService.findByEmail(email);
        String userRegion = user.getRegion();

        Asset asset = assetRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Invalid asset Id:" + id));
        if (!asset.getLocation().getRegion().equalsIgnoreCase(userRegion)) {
            return "redirect:/assets?error=Unauthorized";
        }
        model.addAttribute("asset", asset);
        model.addAttribute("locations", locationRepository.findByRegion(userRegion));
        model.addAttribute("categories", assetCategoryRepository.findAll());
        model.addAttribute("departments", departmentRepository.findAll());
        return "assets/form";
    }

    // Proses update aset
    @PostMapping("/update/{id}")
    public String updateAsset(@PathVariable("id") Integer id, @ModelAttribute("asset") Asset updatedAsset, Authentication authentication) {
        String email = authentication.getName();
        User user = userDetailsService.findByEmail(email);
        String userRegion = user.getRegion();

        Asset existingAsset = assetRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Invalid asset Id:" + id));
        if (!existingAsset.getLocation().getRegion().equalsIgnoreCase(userRegion)) {
            return "redirect:/assets?error=Unauthorized";
        }
        existingAsset.setAssetName(updatedAsset.getAssetName());
        existingAsset.setAssetValue(updatedAsset.getAssetValue());
        existingAsset.setPurchaseDate(updatedAsset.getPurchaseDate());
        if (!updatedAsset.getLocation().getRegion().equalsIgnoreCase(userRegion)) {
            return "redirect:/assets?error=Location region mismatch";
        }
        existingAsset.setLocation(updatedAsset.getLocation());
        existingAsset.setCategory(updatedAsset.getCategory());
        existingAsset.setDepartment(updatedAsset.getDepartment());
        assetRepository.save(existingAsset);
        return "redirect:/assets";
    }

    // Hapus aset
    @GetMapping("/delete/{id}")
    public String deleteAsset(@PathVariable("id") Integer id, Authentication authentication) {
        String email = authentication.getName();
        User user = userDetailsService.findByEmail(email);
        String userRegion = user.getRegion();

        Asset asset = assetRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Invalid asset Id:" + id));
        if (!asset.getLocation().getRegion().equalsIgnoreCase(userRegion)) {
            return "redirect:/assets?error=Unauthorized";
        }
        assetRepository.delete(asset);
        return "redirect:/assets";
    }
}
