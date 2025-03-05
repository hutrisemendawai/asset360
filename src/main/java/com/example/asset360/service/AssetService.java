package com.example.asset360.service;

import com.example.asset360.model.Asset;
import com.example.asset360.repository.AssetRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AssetService {

    @Autowired
    private AssetRepository assetRepository;

    // Metode untuk menghasilkan fixed asset code untuk aset baru
    public String generateFixedAssetCode(Asset asset) {
        // Ambil 3 huruf awal dari kategori dan departemen (dalam huruf kapital)
        String catPrefix = asset.getCategory().getCategoryName().substring(0, 3).toUpperCase();
        String deptPrefix = asset.getDepartment().getDepartmentName().substring(0, 3).toUpperCase();
        // Hitung jumlah aset untuk kategori dan departemen tersebut
        int count = assetRepository.countByCategoryAndDepartment(asset.getCategory(), asset.getDepartment());
        // Nomor urut baru (tambah 1) dalam format 5 digit
        String number = String.format("%05d", count + 1);
        return "FA-" + catPrefix + "-" + deptPrefix + "-" + number;
    }

    // Simpan aset: jika aset baru, generate fixed asset code; jika update, pertahankan kode lama
    public Asset saveAsset(Asset asset) {
        if (asset.getAssetId() == null) {
            asset.setFixedAssetCode(generateFixedAssetCode(asset));
        }
        return assetRepository.save(asset);
    }
}
