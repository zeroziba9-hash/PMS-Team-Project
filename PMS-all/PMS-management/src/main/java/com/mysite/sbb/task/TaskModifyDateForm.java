package com.mysite.sbb.task;

import java.time.LocalDate;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TaskModifyDateForm {

	@NotBlank(message = "시작일은 필수 항목입니다.")
	private LocalDate startDate;

	private LocalDate endDate;
}