package com.example.asset360.repository;

import com.example.asset360.model.Asset;
import com.example.asset360.model.AssetCategory;
import com.example.asset360.model.Department;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface AssetRepository extends JpaRepository<Asset, Integer> {

    // Menghitung jumlah aset berdasarkan kategori dan departemen (sudah ada)
    @Query("SELECT COUNT(a) FROM Asset a WHERE a.category = ?1 AND a.department = ?2")
    int countByCategoryAndDepartment(AssetCategory category, Department department);

    // Dapatkan aset berdasarkan region (melalui properti location.region)
    List<Asset> findByLocationRegion(String region);
}
