package com.example.asset360.controller.api;

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
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/assets")
public class ApiAssetController {

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
    public ResponseEntity<?> listAssets(Authentication authentication) {
        User user = userDetailsService.findByEmail(authentication.getName());
        List<Asset> assets = assetRepository.findByLocationRegion(user.getRegion());
        return ResponseEntity.ok(assets);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getAsset(@PathVariable("id") Integer id) {
        return assetRepository.findById(id)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createAsset(@RequestBody Asset asset, Authentication authentication) {
        User user = userDetailsService.findByEmail(authentication.getName());
        String userRegion = user.getRegion();

        if (asset.getLocation() == null || asset.getLocation().getLocationId() == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Location is required"));
        }
        var location = locationRepository.findById(asset.getLocation().getLocationId()).orElse(null);
        if (location == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Location not found"));
        }
        asset.setLocation(location);

        if (asset.getCategory() != null && asset.getCategory().getCategoryId() != null) {
            asset.setCategory(assetCategoryRepository.findById(asset.getCategory().getCategoryId()).orElse(null));
        }
        if (asset.getDepartment() != null && asset.getDepartment().getDepartmentId() != null) {
            asset.setDepartment(departmentRepository.findById(asset.getDepartment().getDepartmentId()).orElse(null));
        }

        if (!location.getRegion().equalsIgnoreCase(userRegion)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Region mismatch"));
        }

        Asset saved = assetService.saveAsset(asset);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateAsset(@PathVariable("id") Integer id,
                                         @RequestBody Asset updatedAsset,
                                         Authentication authentication) {
        User user = userDetailsService.findByEmail(authentication.getName());
        String userRegion = user.getRegion();

        Asset existingAsset = assetRepository.findById(id).orElse(null);
        if (existingAsset == null) {
            return ResponseEntity.notFound().build();
        }
        if (!existingAsset.getLocation().getRegion().equalsIgnoreCase(userRegion)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Unauthorized"));
        }

        existingAsset.setAssetName(updatedAsset.getAssetName());
        existingAsset.setAssetValue(updatedAsset.getAssetValue());
        existingAsset.setPurchaseDate(updatedAsset.getPurchaseDate());

        if (updatedAsset.getLocation() != null && updatedAsset.getLocation().getLocationId() != null) {
            var newLocation = locationRepository.findById(updatedAsset.getLocation().getLocationId()).orElse(null);
            if (newLocation == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Location not found"));
            }
            if (!newLocation.getRegion().equalsIgnoreCase(userRegion)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "Location region mismatch"));
            }
            existingAsset.setLocation(newLocation);
        }
        if (updatedAsset.getCategory() != null && updatedAsset.getCategory().getCategoryId() != null) {
            existingAsset.setCategory(assetCategoryRepository.findById(updatedAsset.getCategory().getCategoryId()).orElse(null));
        }
        if (updatedAsset.getDepartment() != null && updatedAsset.getDepartment().getDepartmentId() != null) {
            existingAsset.setDepartment(departmentRepository.findById(updatedAsset.getDepartment().getDepartmentId()).orElse(null));
        }

        Asset saved = assetRepository.save(existingAsset);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAsset(@PathVariable("id") Integer id,
                                         Authentication authentication) {
        User user = userDetailsService.findByEmail(authentication.getName());
        String userRegion = user.getRegion();

        Asset asset = assetRepository.findById(id).orElse(null);
        if (asset == null) {
            return ResponseEntity.notFound().build();
        }
        if (!asset.getLocation().getRegion().equalsIgnoreCase(userRegion)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Unauthorized"));
        }

        assetRepository.delete(asset);
        return ResponseEntity.ok(Map.of("message", "Asset deleted successfully"));
    }

    @GetMapping(value = "/{id}/qrcode", produces = MediaType.IMAGE_PNG_VALUE)
    public ResponseEntity<byte[]> getAssetQrCode(@PathVariable("id") Integer id) {
        Asset asset = assetRepository.findById(id).orElse(null);
        if (asset == null) {
            return ResponseEntity.notFound().build();
        }
        String qrText = "{\"Kode FA\":\"" + asset.getFixedAssetCode() + "\", "
                + "\"Nama\":\"" + asset.getAssetName() + "\", "
                + "\"Region\":\"" + asset.getLocation().getRegion() + "\"}";
        try {
            BufferedImage qrImage = qrCodeService.generateQrCodeImage(qrText, 300, 300);
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            ImageIO.write(qrImage, "PNG", baos);
            return ResponseEntity.ok()
                    .contentType(MediaType.IMAGE_PNG)
                    .body(baos.toByteArray());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
