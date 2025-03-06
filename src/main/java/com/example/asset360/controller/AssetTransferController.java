package com.example.asset360.controller;

import com.example.asset360.model.Asset;
import com.example.asset360.model.AssetTransferRequest;
import com.example.asset360.model.Department;
import com.example.asset360.model.Location;
import com.example.asset360.model.TransferStatus;
import com.example.asset360.repository.AssetRepository;
import com.example.asset360.repository.AssetTransferRequestRepository;
import com.example.asset360.repository.DepartmentRepository;
import com.example.asset360.repository.LocationRepository;
import com.example.asset360.service.AssetService;
import com.example.asset360.service.AssetTransferService;
import org.springframework.beans.factory.annotation.Autowired;
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

    // Halaman form untuk mengajukan request transfer aset
    @GetMapping("/new")
    public String showTransferForm(Model model) {
        model.addAttribute("assets", assetRepository.findAll());
        model.addAttribute("locations", locationRepository.findAll());
        model.addAttribute("departments", departmentRepository.findAll());
        return "asset_transfer/form";
    }

    // Proses pengajuan transfer aset
    @PostMapping("/new")
    public String createTransferRequest(@RequestParam("assetId") Integer assetId,
                                        @RequestParam("toLocationId") Integer toLocationId,
                                        @RequestParam("toDepartmentId") Integer toDepartmentId,
                                        Model model) {
        Asset asset = assetRepository.findById(assetId)
                .orElseThrow(() -> new IllegalArgumentException("Invalid asset id:" + assetId));
        Location toLocation = locationRepository.findById(toLocationId)
                .orElseThrow(() -> new IllegalArgumentException("Invalid location id:" + toLocationId));
        Department toDepartment = departmentRepository.findById(toDepartmentId)
                .orElseThrow(() -> new IllegalArgumentException("Invalid department id:" + toDepartmentId));

        if (!asset.getLocation().getRegion().equalsIgnoreCase(toLocation.getRegion())) {
            // Jika region berbeda, buat request transfer
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

    // Halaman untuk melihat request transfer yang pending (untuk approval)
    @GetMapping("/pending")
    public String listPendingRequests(Model model) {
        model.addAttribute("requests", transferRequestRepository.findByStatus(TransferStatus.PENDING));
        return "asset_transfer/pending";
    }

    // Proses accept request transfer
    @PostMapping("/accept/{id}")
    public String acceptTransfer(@PathVariable("id") Long requestId) {
        assetTransferService.acceptTransferRequest(requestId);
        return "redirect:/asset_transfer/pending";
    }

    // Proses reject request transfer
    @PostMapping("/reject/{id}")
    public String rejectTransfer(@PathVariable("id") Long requestId) {
        assetTransferService.rejectTransferRequest(requestId);
        return "redirect:/asset_transfer/pending";
    }
}
