package com.example.asset360.controller.api;

import com.example.asset360.model.*;
import com.example.asset360.repository.AssetRepository;
import com.example.asset360.repository.AssetTransferRequestRepository;
import com.example.asset360.repository.DepartmentRepository;
import com.example.asset360.repository.LocationRepository;
import com.example.asset360.service.AssetService;
import com.example.asset360.service.AssetTransferService;
import com.example.asset360.service.CustomUserDetailsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/transfers")
public class ApiTransferController {

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

    @PostMapping
    public ResponseEntity<?> createTransferRequest(@RequestBody Map<String, Object> body,
                                                   Authentication authentication) {
        User user = userDetailsService.findByEmail(authentication.getName());
        String userRegion = user.getRegion();

        Integer assetId = Integer.valueOf(body.get("assetId").toString());
        Integer toLocationId = Integer.valueOf(body.get("toLocationId").toString());
        Integer toDepartmentId = Integer.valueOf(body.get("toDepartmentId").toString());

        Asset asset = assetRepository.findById(assetId).orElse(null);
        if (asset == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Asset not found"));
        }
        if (!asset.getLocation().getRegion().equalsIgnoreCase(userRegion)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Unauthorized asset selection"));
        }

        Location toLocation = locationRepository.findById(toLocationId).orElse(null);
        if (toLocation == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Destination location not found"));
        }
        Department toDepartment = departmentRepository.findById(toDepartmentId).orElse(null);
        if (toDepartment == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Destination department not found"));
        }

        if (!asset.getLocation().getRegion().equalsIgnoreCase(toLocation.getRegion())) {
            // Inter-region transfer: create pending request
            AssetTransferRequest request = assetTransferService.createTransferRequest(asset, toLocation, toDepartment);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(Map.of("message", "Transfer request created and pending approval", "request", request));
        } else {
            // Same-region transfer: immediate update
            asset.setLocation(toLocation);
            if (!asset.getDepartment().getDepartmentId().equals(toDepartment.getDepartmentId())) {
                asset.setDepartment(toDepartment);
                asset.setFixedAssetCode(assetService.generateFixedAssetCode(asset));
            } else {
                asset.setDepartment(toDepartment);
            }
            assetRepository.save(asset);
            return ResponseEntity.ok(Map.of("message", "Asset transferred successfully", "asset", asset));
        }
    }

    @GetMapping("/pending")
    public ResponseEntity<List<AssetTransferRequest>> listPendingRequests() {
        List<AssetTransferRequest> pending = transferRequestRepository.findByStatus(TransferStatus.PENDING);
        return ResponseEntity.ok(pending);
    }

    @PostMapping("/{id}/accept")
    public ResponseEntity<?> acceptTransfer(@PathVariable("id") Long requestId) {
        try {
            assetTransferService.acceptTransferRequest(requestId);
            return ResponseEntity.ok(Map.of("message", "Transfer request accepted"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<?> rejectTransfer(@PathVariable("id") Long requestId) {
        try {
            assetTransferService.rejectTransferRequest(requestId);
            return ResponseEntity.ok(Map.of("message", "Transfer request rejected"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
