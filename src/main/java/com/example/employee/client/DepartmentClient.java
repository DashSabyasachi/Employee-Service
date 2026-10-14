package com.example.employee.client;

import java.util.Map;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(
	    name = "department-service",
	    path = "/departments"
	)
public interface DepartmentClient {
	@GetMapping("/{id}")
    Map<String, Object> getDepartmentById(
        @PathVariable("id") Long id
    );
	
}
