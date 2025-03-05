package com.example.asset360.converter;

import com.example.asset360.model.AssetCategory;
import com.example.asset360.repository.AssetCategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.convert.converter.Converter;
import org.springframework.stereotype.Component;

@Component
public class AssetCategoryConverter implements Converter<String, AssetCategory> {

    @Autowired
    private AssetCategoryRepository assetCategoryRepository;

    @Override
    public AssetCategory convert(String source) {
        if (source == null || source.isEmpty()) {
            return null;
        }
        try {
            Integer id = Integer.valueOf(source);
            return assetCategoryRepository.findById(id).orElse(null);
        } catch (NumberFormatException e) {
            return null;
        }
    }
}
