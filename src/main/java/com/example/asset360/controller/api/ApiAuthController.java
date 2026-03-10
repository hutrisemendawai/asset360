package com.example.asset360.controller.api;

import com.example.asset360.model.Location;
import com.example.asset360.model.User;
import com.example.asset360.repository.LocationRepository;
import com.example.asset360.service.CustomUserDetailsService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class ApiAuthController {

    private static final String IDENTITY_NUMBER_CONSTRAINT = "UKqbdqjatm78k1givq9w1t73ixp";
    private static final String PHONE_NUMBER_CONSTRAINT = "UK9q63snka3mdh91as4io72espi";

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private CustomUserDetailsService userDetailsService;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @Autowired
    private LocationRepository locationRepository;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials,
                                   HttpServletRequest request) {
        String username = credentials.get("username");
        String password = credentials.get("password");
        if (username == null || password == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Username and password are required"));
        }
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(username, password)
            );
            SecurityContext context = SecurityContextHolder.createEmptyContext();
            context.setAuthentication(authentication);
            SecurityContextHolder.setContext(context);
            HttpSession session = request.getSession(true);
            session.setAttribute("SPRING_SECURITY_CONTEXT", context);

            User user = userDetailsService.findByEmail(username);
            return ResponseEntity.ok(userToMap(user));
        } catch (AuthenticationException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid credentials"));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, Object> body) {
        String email = (String) body.get("email");
        String password = (String) body.get("password");
        String fullName = (String) body.get("fullName");
        String birthPlace = (String) body.get("birthPlace");
        String birthDate = (String) body.get("birthDate");
        String gender = (String) body.get("gender");
        String identityNumber = (String) body.get("identityNumber");
        String phoneNumber = (String) body.get("phoneNumber");
        String address = (String) body.get("address");
        Integer locationId = body.get("locationId") != null
                ? Integer.valueOf(body.get("locationId").toString()) : null;

        if (email == null || password == null || fullName == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Required fields are missing"));
        }

        if (userDetailsService.userExists(email)) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", "Email sudah digunakan."));
        }

        User user = new User();
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setFullName(fullName);
        user.setBirthPlace(birthPlace);
        user.setBirthDate(birthDate != null ? java.time.LocalDate.parse(birthDate) : null);
        user.setGender(gender);
        user.setIdentityNumber(identityNumber);
        user.setPhoneNumber(phoneNumber);
        user.setAddress(address);

        Location loc = locationId != null ? locationRepository.findById(locationId).orElse(null) : null;
        user.setRegion(loc != null ? loc.getRegion() : "Palembang");

        try {
            User saved = userDetailsService.save(user);
            return ResponseEntity.status(HttpStatus.CREATED).body(userToMap(saved));
        } catch (DataIntegrityViolationException ex) {
            String specificMessage = ex.getMostSpecificCause().getMessage();
            String errorMsg;
            if (specificMessage.contains("identity_number") || specificMessage.contains(IDENTITY_NUMBER_CONSTRAINT)) {
                errorMsg = "Identity number already in use.";
            } else if (specificMessage.contains("phone_number") || specificMessage.contains(PHONE_NUMBER_CONSTRAINT)) {
                errorMsg = "Phone number already in use.";
            } else {
                errorMsg = "Registration failed due to a data conflict.";
            }
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", errorMsg));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }
        SecurityContextHolder.clearContext();
        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }

    @GetMapping("/me")
    public ResponseEntity<?> currentUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
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
