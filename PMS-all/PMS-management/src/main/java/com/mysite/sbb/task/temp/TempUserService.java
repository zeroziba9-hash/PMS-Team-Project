package com.mysite.sbb.task.temp;

import java.util.Collections;
import java.util.Comparator;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TempUserService {
	private final TempUserRepository userRepository;

	public TempUser getUser(String name){
		TempUser p = userRepository.getById(name);
        return p;
    }
	
	public List<TempUser> getAll(){
		List<TempUser> users = userRepository.findAll();
		return users;
	}
// 사용자 처리 되고나서 할 것
//	public Page<TempUser> getList(int page,Integer pid, String name) {
//		Pageable pageable = PageRequest.of(page, 10, Sort.by(Sort.Direction.DESC,"name"));
//		Specification<TempUser> spec = search
//	}
//	
//	private Specification<TempUser> search(Integer pid, String name) {
//		return new Specification<TempUser>() {
//			
//			@Override
//			public Predicate toPredicate(Root<TempUser> u, CriteriaQuery<?> query, CriteriaBuilder cb) {
//				query.distinct(true);
//				Join<Project,TempUser> member = u.join(")
//				return null;
//			}
//		};
//	}
}
