package com.example.asset360.controller.api;

import com.example.asset360.model.AssetAssignment;
import com.example.asset360.repository.AssetAssignmentRepository;
import com.example.asset360.repository.AssetRepository;
import com.example.asset360.repository.DepartmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/assignments")
public class ApiAssignmentController {

    @Autowired
    private AssetAssignmentRepository assetAssignmentRepository;

    @Autowired
    private AssetRepository assetRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @GetMapping
    public ResponseEntity<List<AssetAssignment>> listAssignments() {
        return ResponseEntity.ok(assetAssignmentRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getAssignment(@PathVariable("id") Integer id) {
        return assetAssignmentRepository.findById(id)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createAssignment(@RequestBody AssetAssignment assignment) {
        if (assignment.getAsset() != null && assignment.getAsset().getAssetId() != null) {
            assignment.setAsset(assetRepository.findById(assignment.getAsset().getAssetId()).orElse(null));
        }
        if (assignment.getAssignedDepartment() != null && assignment.getAssignedDepartment().getDepartmentId() != null) {
            assignment.setAssignedDepartment(
                    departmentRepository.findById(assignment.getAssignedDepartment().getDepartmentId()).orElse(null));
        }

        if (assignment.getAsset() == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Valid asset is required"));
        }
        if (assignment.getAssignedDepartment() == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Valid department is required"));
        }
        if (assignment.getAssignedDate() == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Assigned date is required"));
        }

        AssetAssignment saved = assetAssignmentRepository.save(assignment);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateAssignment(@PathVariable("id") Integer id,
                                              @RequestBody AssetAssignment updatedAssignment) {
        AssetAssignment existing = assetAssignmentRepository.findById(id).orElse(null);
        if (existing == null) {
            return ResponseEntity.notFound().build();
        }

        if (updatedAssignment.getAsset() != null && updatedAssignment.getAsset().getAssetId() != null) {
            existing.setAsset(assetRepository.findById(updatedAssignment.getAsset().getAssetId()).orElse(existing.getAsset()));
        }
        if (updatedAssignment.getAssignedDepartment() != null && updatedAssignment.getAssignedDepartment().getDepartmentId() != null) {
            existing.setAssignedDepartment(
                    departmentRepository.findById(updatedAssignment.getAssignedDepartment().getDepartmentId())
                            .orElse(existing.getAssignedDepartment()));
        }
        if (updatedAssignment.getAssignedDate() != null) {
            existing.setAssignedDate(updatedAssignment.getAssignedDate());
        }
        existing.setReturnDate(updatedAssignment.getReturnDate());

        AssetAssignment saved = assetAssignmentRepository.save(existing);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAssignment(@PathVariable("id") Integer id) {
        AssetAssignment assignment = assetAssignmentRepository.findById(id).orElse(null);
        if (assignment == null) {
            return ResponseEntity.notFound().build();
        }
        assetAssignmentRepository.delete(assignment);
        return ResponseEntity.ok(Map.of("message", "Assignment deleted successfully"));
    }
}
