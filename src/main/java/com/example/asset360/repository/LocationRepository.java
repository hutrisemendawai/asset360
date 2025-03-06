package com.example.asset360.repository;

import com.example.asset360.model.Location;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface LocationRepository extends JpaRepository<Location, Integer> {
    List<Location> findByRegion(String region);
}
