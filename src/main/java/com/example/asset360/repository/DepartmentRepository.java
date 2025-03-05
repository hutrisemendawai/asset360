package com.example.asset360.repository;

import com.example.asset360.model.Department;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DepartmentRepository extends JpaRepository<Department, Integer> {
    // Tambahkan metode pencarian jika diperlukan
}
