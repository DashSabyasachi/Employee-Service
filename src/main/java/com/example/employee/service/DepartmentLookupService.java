package com.example.employee.service;

import java.util.Map;

import org.springframework.stereotype.Service;

import com.example.employee.client.DepartmentClient;

@Service
public class DepartmentLookupService {
	private final DepartmentClient departmentClient;

    public DepartmentLookupService(
            DepartmentClient departmentClient) {
        this.departmentClient = departmentClient;
    }

    public Map<String, Object> findDepartmentById(
            Long departmentId) {

        return departmentClient.getDepartmentById(
            departmentId
        );
    }
}
