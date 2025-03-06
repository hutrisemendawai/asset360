package com.example.asset360.repository;

import com.example.asset360.model.Asset;
import com.example.asset360.model.AssetCategory;
import com.example.asset360.model.Department;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface AssetRepository extends JpaRepository<Asset, Integer> {

    // Menghitung jumlah aset berdasarkan kategori dan departemen
    @Query("SELECT COUNT(a) FROM Asset a WHERE a.category = ?1 AND a.department = ?2")
    int countByCategoryAndDepartment(AssetCategory category, Department department);

    // Mengecek apakah fixedAssetCode sudah ada
    boolean existsByFixedAssetCode(String fixedAssetCode);

    // Mencari aset berdasarkan region lokasi
    @Query("SELECT a FROM Asset a WHERE a.location.region = ?1")
    java.util.List<Asset> findByLocationRegion(String region);
}
