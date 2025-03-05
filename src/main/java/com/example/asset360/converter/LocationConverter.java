package com.example.asset360.converter;

import com.example.asset360.model.Location;
import com.example.asset360.repository.LocationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.convert.converter.Converter;
import org.springframework.stereotype.Component;

@Component
public class LocationConverter implements Converter<String, Location> {

    @Autowired
    private LocationRepository locationRepository;

    @Override
    public Location convert(String source) {
        if (source == null || source.isEmpty()) {
            return null;
        }
        try {
            Integer id = Integer.valueOf(source);
            return locationRepository.findById(id).orElse(null);
        } catch (NumberFormatException e) {
            return null;
        }
    }
}
