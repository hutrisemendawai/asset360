package com.example.asset360.service;

import com.example.asset360.model.Asset;
import com.example.asset360.repository.AssetRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AssetService {

    @Autowired
    private AssetRepository assetRepository;

    public String generateFixedAssetCode(Asset asset) {
        String catPrefix = asset.getCategory().getCategoryName().substring(0, 3).toUpperCase();
        String deptPrefix = asset.getDepartment().getDepartmentName().substring(0, 3).toUpperCase();
        int count = assetRepository.countByCategoryAndDepartment(asset.getCategory(), asset.getDepartment());
        String code;
        do {
            count++;
            code = "FA-" + catPrefix + "-" + deptPrefix + "-" + String.format("%05d", count);
        } while (assetRepository.existsByFixedAssetCode(code));
        return code;
    }

    public Asset saveAsset(Asset asset) {
        if (asset.getAssetId() == null) {
            asset.setFixedAssetCode(generateFixedAssetCode(asset));
        }
        return assetRepository.save(asset);
    }
}
