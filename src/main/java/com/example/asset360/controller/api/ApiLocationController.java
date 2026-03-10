package com.example.asset360.controller.api;

import com.example.asset360.model.Location;
import com.example.asset360.repository.LocationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/locations")
public class ApiLocationController {

    @Autowired
    private LocationRepository locationRepository;

    @GetMapping
    public ResponseEntity<List<Location>> listLocations() {
        return ResponseEntity.ok(locationRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getLocation(@PathVariable("id") Integer id) {
        return locationRepository.findById(id)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createLocation(@RequestBody Location location) {
        if (location.getLocationName() == null || location.getLocationName().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Location name is required"));
        }
        if (location.getRegion() == null || location.getRegion().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Region is required"));
        }
        Location saved = locationRepository.save(location);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateLocation(@PathVariable("id") Integer id,
                                            @RequestBody Location updatedLocation) {
        Location existing = locationRepository.findById(id).orElse(null);
        if (existing == null) {
            return ResponseEntity.notFound().build();
        }
        existing.setLocationName(updatedLocation.getLocationName());
        existing.setRegion(updatedLocation.getRegion());
        Location saved = locationRepository.save(existing);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteLocation(@PathVariable("id") Integer id) {
        Location location = locationRepository.findById(id).orElse(null);
        if (location == null) {
            return ResponseEntity.notFound().build();
        }
        locationRepository.delete(location);
        return ResponseEntity.ok(Map.of("message", "Location deleted successfully"));
    }
}
