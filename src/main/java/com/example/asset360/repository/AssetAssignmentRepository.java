package com.example.asset360.repository;

import com.example.asset360.model.AssetAssignment;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AssetAssignmentRepository extends JpaRepository<AssetAssignment, Integer> {
    
}
