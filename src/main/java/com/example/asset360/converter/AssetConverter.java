package com.example.asset360.converter;

import com.example.asset360.model.Asset;
import com.example.asset360.repository.AssetRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.convert.converter.Converter;
import org.springframework.stereotype.Component;

@Component
public class AssetConverter implements Converter<String, Asset> {

    @Autowired
    private AssetRepository assetRepository;

    @Override
    public Asset convert(String source) {
        if (source == null || source.isEmpty()) {
            return null;
        }
        try {
            Integer id = Integer.valueOf(source);
            return assetRepository.findById(id).orElse(null);
        } catch (NumberFormatException e) {
            return null;
        }
    }
}
