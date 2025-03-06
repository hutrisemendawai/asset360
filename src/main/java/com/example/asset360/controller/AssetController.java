package com.example.asset360.controller;

import com.example.asset360.model.Asset;
import com.example.asset360.model.User;
import com.example.asset360.repository.AssetCategoryRepository;
import com.example.asset360.repository.AssetRepository;
import com.example.asset360.repository.DepartmentRepository;
import com.example.asset360.repository.LocationRepository;
import com.example.asset360.service.AssetService;
import com.example.asset360.service.CustomUserDetailsService;
import com.example.asset360.service.QrCodeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import javax.imageio.ImageIO;
import jakarta.servlet.http.HttpServletResponse;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.io.OutputStream;

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
    
    @Autowired
    private QrCodeService qrCodeService;

    @GetMapping
    public String listAssets(Model model, Authentication authentication) {
        String email = authentication.getName();
        User user = userDetailsService.findByEmail(email);
        String region = user.getRegion();
        model.addAttribute("assets", assetRepository.findByLocationRegion(region));
        return "assets/list";
    }

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
    
    // Endpoint untuk menghasilkan QR Code
    @GetMapping("/{id}/qrcode")
    public void getAssetQrCode(@PathVariable("id") Integer id, HttpServletResponse response) {
        Asset asset = assetRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Invalid asset Id:" + id));
        // Format data menggunakan JSON dengan mengambil data region dari asset.getLocation()
        String qrText = "{\"Kode FA\":\"" + asset.getFixedAssetCode() + "\", "
                + "\"Nama\":\"" + asset.getAssetName() + "\", "
                + "\"Region\":\"" + asset.getLocation().getRegion() + "\"}";
        try {
            BufferedImage qrImage = qrCodeService.generateQrCodeImage(qrText, 300, 300);
            response.setContentType("image/png");
            OutputStream os = response.getOutputStream();
            ImageIO.write(qrImage, "PNG", os);
            os.flush();
        } catch (IOException | com.google.zxing.WriterException e) {
            throw new RuntimeException("Could not generate QR Code", e);
        }
    }

}
