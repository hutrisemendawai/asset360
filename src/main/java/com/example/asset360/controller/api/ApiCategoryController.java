package com.example.asset360.controller.api;

import com.example.asset360.model.AssetCategory;
import com.example.asset360.repository.AssetCategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/categories")
public class ApiCategoryController {

    @Autowired
    private AssetCategoryRepository assetCategoryRepository;

    @GetMapping
    public ResponseEntity<List<AssetCategory>> listCategories() {
        return ResponseEntity.ok(assetCategoryRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getCategory(@PathVariable("id") Integer id) {
        return assetCategoryRepository.findById(id)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createCategory(@RequestBody AssetCategory category) {
        if (category.getCategoryName() == null || category.getCategoryName().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Category name is required"));
        }
        AssetCategory saved = assetCategoryRepository.save(category);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateCategory(@PathVariable("id") Integer id,
                                            @RequestBody AssetCategory updatedCategory) {
        AssetCategory existing = assetCategoryRepository.findById(id).orElse(null);
        if (existing == null) {
            return ResponseEntity.notFound().build();
        }
        existing.setCategoryName(updatedCategory.getCategoryName());
        AssetCategory saved = assetCategoryRepository.save(existing);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCategory(@PathVariable("id") Integer id) {
        AssetCategory category = assetCategoryRepository.findById(id).orElse(null);
        if (category == null) {
            return ResponseEntity.notFound().build();
        }
        assetCategoryRepository.delete(category);
        return ResponseEntity.ok(Map.of("message", "Category deleted successfully"));
    }
}
