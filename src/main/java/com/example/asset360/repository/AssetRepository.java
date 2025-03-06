package com.example.asset360.repository;

import com.example.asset360.model.Asset;
import com.example.asset360.model.AssetCategory;
import com.example.asset360.model.Department;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface AssetRepository extends JpaRepository<Asset, Integer> {

    @Query("SELECT COUNT(a) FROM Asset a WHERE a.category = ?1 AND a.department = ?2")
    int countByCategoryAndDepartment(AssetCategory category, Department department);

    boolean existsByFixedAssetCode(String fixedAssetCode);

    @Query("SELECT a FROM Asset a WHERE a.location.region = ?1")
    List<Asset> findByLocationRegion(String region);
}
