package com.example.asset360.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.asset360.model.User;

public interface UserRepository extends JpaRepository<User, Long> {
    User findByEmail(String email);
}
