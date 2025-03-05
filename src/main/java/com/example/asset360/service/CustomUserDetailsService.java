package com.example.asset360.service;

import com.example.asset360.model.User;
import com.example.asset360.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.*;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Service;
import java.util.Collections;

@Service
public class CustomUserDetailsService implements UserDetailsService {
    
    @Autowired
    private UserRepository userRepository;
    
    // Untuk proses login
    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
         User user = userRepository.findByEmail(email);
         if (user == null) {
             throw new UsernameNotFoundException("User tidak ditemukan");
         }
         return new org.springframework.security.core.userdetails.User(
                 user.getEmail(),
                 user.getPassword(),
                 Collections.singleton(new SimpleGrantedAuthority("ROLE_USER"))
         );
    }
    
    public User save(User user) {
        return userRepository.save(user);
    }
    
    public boolean userExists(String email) {
        return userRepository.findByEmail(email) != null;
    }
    
    public User findByEmail(String email) {
        return userRepository.findByEmail(email);
    }
}
