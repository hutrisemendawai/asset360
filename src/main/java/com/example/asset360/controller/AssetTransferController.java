package com.example.asset360.controller;

import com.example.asset360.model.Asset;
import com.example.asset360.model.AssetTransferRequest;
import com.example.asset360.model.Department;
import com.example.asset360.model.Location;
import com.example.asset360.model.TransferStatus;
import com.example.asset360.model.User;
import com.example.asset360.repository.AssetRepository;
import com.example.asset360.repository.AssetTransferRequestRepository;
import com.example.asset360.repository.DepartmentRepository;
import com.example.asset360.repository.LocationRepository;
import com.example.asset360.service.AssetService;
import com.example.asset360.service.AssetTransferService;
import com.example.asset360.service.CustomUserDetailsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

@Controller
@RequestMapping("/asset_transfer")
public class AssetTransferController {

    @Autowired
    private AssetRepository assetRepository;

    @Autowired
    private LocationRepository locationRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private AssetTransferService assetTransferService;

    @Autowired
    private AssetService assetService;

    @Autowired
    private AssetTransferRequestRepository transferRequestRepository;

    @Autowired
    private CustomUserDetailsService userDetailsService;

    // Form pengajuan transfer aset: hanya tampilkan aset dari region user
    @GetMapping("/new")
    public String showTransferForm(Model model, Authentication authentication) {
        String email = authentication.getName();
        User user = userDetailsService.findByEmail(email);
        String userRegion = user.getRegion();
        model.addAttribute("assets", assetRepository.findByLocationRegion(userRegion));
        model.addAttribute("locations", locationRepository.findAll());
        model.addAttribute("departments", departmentRepository.findAll());
        return "asset_transfer/form";
    }

    // Proses pengajuan transfer aset
    @PostMapping("/new")
    public String createTransferRequest(@RequestParam("assetId") Integer assetId,
                                        @RequestParam("toLocationId") Integer toLocationId,
                                        @RequestParam("toDepartmentId") Integer toDepartmentId,
                                        Authentication authentication,
                                        Model model) {
        String email = authentication.getName();
        User user = userDetailsService.findByEmail(email);
        String userRegion = user.getRegion();

        Asset asset = assetRepository.findById(assetId)
                .orElseThrow(() -> new IllegalArgumentException("Invalid asset id:" + assetId));
        // Pastikan aset yang dipilih berasal dari region user
        if (!asset.getLocation().getRegion().equalsIgnoreCase(userRegion)) {
            return "redirect:/assets?error=Unauthorized asset selection";
        }
        Location toLocation = locationRepository.findById(toLocationId)
                .orElseThrow(() -> new IllegalArgumentException("Invalid location id:" + toLocationId));
        Department toDepartment = departmentRepository.findById(toDepartmentId)
                .orElseThrow(() -> new IllegalArgumentException("Invalid department id:" + toDepartmentId));

        if (!asset.getLocation().getRegion().equalsIgnoreCase(toLocation.getRegion())) {
            assetTransferService.createTransferRequest(asset, toLocation, toDepartment);
            model.addAttribute("message", "Request transfer telah dibuat dan menunggu approval.");
        } else {
            // Jika region sama, langsung update aset
            asset.setLocation(toLocation);
            asset.setDepartment(toDepartment);
            if (!asset.getDepartment().getDepartmentId().equals(toDepartment.getDepartmentId())) {
                asset.setFixedAssetCode(assetService.generateFixedAssetCode(asset));
            }
            assetRepository.save(asset);
            model.addAttribute("message", "Aset berhasil dipindahkan.");
        }
        return "redirect:/assets";
    }

    // Daftar request transfer pending untuk approval
    @GetMapping("/pending")
    public String listPendingRequests(Model model, Authentication authentication) {
        String email = authentication.getName();
        User user = userDetailsService.findByEmail(email);
        // Kirim nilai region user ke view
        model.addAttribute("userRegion", user.getRegion());
        model.addAttribute("requests", transferRequestRepository.findByStatus(TransferStatus.PENDING));
        return "asset_transfer/pending";
    }

    // Proses accept transfer request
    @PostMapping("/accept/{id}")
    public String acceptTransfer(@PathVariable("id") Long requestId) {
        assetTransferService.acceptTransferRequest(requestId);
        return "redirect:/asset_transfer/pending";
    }

    // Proses reject transfer request
    @PostMapping("/reject/{id}")
    public String rejectTransfer(@PathVariable("id") Long requestId) {
        assetTransferService.rejectTransferRequest(requestId);
        return "redirect:/asset_transfer/pending";
    }
}
