package com.example.employee.controller;

import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.employee.service.DepartmentLookupService;

@RestController
@RequestMapping("/api/employee-dept")
public class DepartmentLookupController {
	private final DepartmentLookupService departmentLookupService;

    public DepartmentLookupController(
            DepartmentLookupService departmentLookupService) {
        this.departmentLookupService = departmentLookupService;
    }

    @GetMapping("/{departmentId}")
    public Map<String, Object> getDepartment(
            @PathVariable Long departmentId) {

        return departmentLookupService
                .findDepartmentById(departmentId);
    }
}
