package com.mysite.sbb.task.temp;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TempUserRepository extends JpaRepository<TempUser, String> {
	Page<TempUser> findAll(Specification<TempUser> spec, Pageable pageable);
}
