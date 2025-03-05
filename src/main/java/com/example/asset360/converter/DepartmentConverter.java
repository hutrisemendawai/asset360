package com.example.asset360.converter;

import com.example.asset360.model.Department;
import com.example.asset360.repository.DepartmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.convert.converter.Converter;
import org.springframework.stereotype.Component;

@Component
public class DepartmentConverter implements Converter<String, Department> {

    @Autowired
    private DepartmentRepository departmentRepository;

    @Override
    public Department convert(String source) {
        if (source == null || source.isEmpty()) {
            return null;
        }
        try {
            Integer id = Integer.valueOf(source);
            return departmentRepository.findById(id).orElse(null);
        } catch (NumberFormatException e) {
            return null;
        }
    }
}
