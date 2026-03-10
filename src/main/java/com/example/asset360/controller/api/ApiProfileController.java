package com.example.asset360.controller.api;

import com.example.asset360.model.Location;
import com.example.asset360.model.User;
import com.example.asset360.repository.LocationRepository;
import com.example.asset360.service.CustomUserDetailsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/profile")
public class ApiProfileController {

    @Autowired
    private CustomUserDetailsService userDetailsService;

    @Autowired
    private LocationRepository locationRepository;

    @GetMapping
    public ResponseEntity<?> getProfile(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Not authenticated"));
        }
        User user = userDetailsService.findByEmail(authentication.getName());
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "User not found"));
        }
        return ResponseEntity.ok(userToMap(user));
    }

    @PutMapping
    public ResponseEntity<?> updateProfile(@RequestBody Map<String, Object> body,
                                           Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Not authenticated"));
        }
        User existingUser = userDetailsService.findByEmail(authentication.getName());
        if (existingUser == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "User not found"));
        }

        if (body.containsKey("fullName")) {
            existingUser.setFullName((String) body.get("fullName"));
        }
        if (body.containsKey("birthPlace")) {
            existingUser.setBirthPlace((String) body.get("birthPlace"));
        }
        if (body.containsKey("birthDate")) {
            existingUser.setBirthDate(LocalDate.parse((String) body.get("birthDate")));
        }
        if (body.containsKey("gender")) {
            existingUser.setGender((String) body.get("gender"));
        }
        if (body.containsKey("identityNumber")) {
            existingUser.setIdentityNumber((String) body.get("identityNumber"));
        }
        if (body.containsKey("phoneNumber")) {
            existingUser.setPhoneNumber((String) body.get("phoneNumber"));
        }
        if (body.containsKey("address")) {
            existingUser.setAddress((String) body.get("address"));
        }
        if (body.containsKey("locationId")) {
            Integer locationId = Integer.valueOf(body.get("locationId").toString());
            Location loc = locationRepository.findById(locationId).orElse(null);
            if (loc != null) {
                existingUser.setRegion(loc.getRegion());
            }
        }

        userDetailsService.save(existingUser);
        return ResponseEntity.ok(userToMap(existingUser));
    }

    private Map<String, Object> userToMap(User user) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", user.getId());
        map.put("email", user.getEmail());
        map.put("fullName", user.getFullName());
        map.put("birthPlace", user.getBirthPlace());
        map.put("birthDate", user.getBirthDate());
        map.put("gender", user.getGender());
        map.put("identityNumber", user.getIdentityNumber());
        map.put("phoneNumber", user.getPhoneNumber());
        map.put("address", user.getAddress());
        map.put("region", user.getRegion());
        return map;
    }
}
