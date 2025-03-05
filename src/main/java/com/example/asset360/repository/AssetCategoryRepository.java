package com.example.asset360.repository;

import com.example.asset360.model.AssetCategory;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AssetCategoryRepository extends JpaRepository<AssetCategory, Integer> {
    
}
