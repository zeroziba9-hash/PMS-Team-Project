const API_BASE = 'http://localhost:8080/api';
let currentDate = new Date();
let selectedDate = null;
let selectedProjectId = null;

// 날짜를 YYYY-MM-DD 형식의 로컬 문자열로 변환하는 헬퍼 함수 (타임존 문제 해결)
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

document.addEventListener('DOMContentLoaded', () => {
    // URL에서 projectId 추출 (예: /project/1/schedule -> 1)
    const pathParts = window.location.pathname.split('/');
    selectedProjectId = pathParts[2];

    renderCalendar();
    setupEventListeners();
});

function setupEventListeners() {
    document.getElementById('prevMonth').addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    });

    document.getElementById('nextMonth').addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    });
}

async function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    document.getElementById('monthYear').textContent = `${year}년 ${month + 1}월`;
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const calendarBody = document.getElementById('calendarBody');
    calendarBody.innerHTML = '';
    
    let date = 1;
    
    for (let i = 0; i < 6; i++) {
        const row = document.createElement('tr');
        
        for (let j = 0; j < 7; j++) {
            const cell = document.createElement('td');
            
            if (i === 0 && j < startingDayOfWeek) {
                // 지난 달의 날짜
                const prevDate = new Date(year, month, 0 - (startingDayOfWeek - j - 1));
                cell.classList.add('other-month');
                cell.innerHTML = `<div class="date-number other-month">${prevDate.getDate()}</div>`;
            } else if (date > daysInMonth) {
                // 다음 달의 날짜
                cell.classList.add('other-month');
                cell.innerHTML = `<div class="date-number other-month">${date - daysInMonth}</div>`;
                date++;
            } else {
                // 현재 달의 날짜
                const cellDate = new Date(year, month, date);
                const isToday = cellDate.toDateString() === new Date().toDateString();
                
                if (isToday) {
                    cell.classList.add('today');
                }
                
                cell.innerHTML = `<div class="date-number">${date}</div><div class="tasks"></div>`;
                cell.dataset.date = formatDate(cellDate);
                cell.onclick = () => selectDate(cell, cellDate);
                
                date++;
            }
            
            row.appendChild(cell);
        }
        
        calendarBody.appendChild(row);
    }
    
    // Task 데이터 로드
    if (selectedProjectId) {
        await loadTasksForMonth(year, month);
    }
}

async function loadTasksForMonth(year, month) {
    if (!selectedProjectId) return;
    
    try {
        const startDate = new Date(year, month, 1);
        const endDate = new Date(year, month + 1, 0);
        
        const startStr = formatDate(startDate);
        const endStr = formatDate(endDate);
        
        const response = await fetch(
            `${API_BASE}/tasks/project/${selectedProjectId}/range?startAt=${encodeURIComponent(startStr)}&endAt=${encodeURIComponent(endStr)}`
        );
        
        if (!response.ok) throw new Error('Task 로드 실패');
        
        const tasks = await response.json();
        
        // 캘린더에 작업 표시
        tasks.forEach(task => {
            // 시작일과 종료일을 로컬 데이트 객체로 변환
            const start = new Date(task.startAt);
            const end = new Date(task.endAt);
            const startStr = formatDate(start);
            const endStr = formatDate(end);
            
            // 시작 날짜부터 종료 날짜까지 루프를 돌며 모든 해당 셀에 표시
            let curr = new Date(start.getFullYear(), start.getMonth(), start.getDate());
            let last = new Date(end.getFullYear(), end.getMonth(), end.getDate());
            
            while (curr <= last) {
                const dateStr = formatDate(curr);
                const cell = document.querySelector(`td[data-date="${dateStr}"]`);
                
                if (cell && cell.querySelector('.tasks')) {
                    const taskEl = document.createElement('div');
                    taskEl.className = 'task';

                    // 클래스 추가 (CSS에서 둥근 모서리 및 간격 제어)
                    if (dateStr === startStr) taskEl.classList.add('task-start');
                    if (dateStr === endStr) taskEl.classList.add('task-end');
                    
                    // 텍스트가 없는 경우에도 막대 형태 유지를 위해 &nbsp; 또는 빈 문자열 처리
                    taskEl.textContent = ''; 

                    // 텍스트는 오직 시작일에만 표시함 (다음 주로 넘어가도 재표시 안 함)
                    if (dateStr === startStr) {
                        taskEl.textContent = task.content || '작업';
                    }

                    taskEl.title = task.content;
                    cell.querySelector('.tasks').appendChild(taskEl);
                }
                curr.setDate(curr.getDate() + 1); // 다음 날로 이동
            }
        });
    } catch (error) {
        console.error('Task 로드 오류:', error);
    }
}

function selectDate(cell, date) {
    // 이전 선택 제거
    document.querySelectorAll('td.selected').forEach(td => {
        td.classList.remove('selected');
    });
    
    // 새 선택 표시
    cell.classList.add('selected');
    selectedDate = date;
    
    // 선택된 날짜의 작업 표시
    displayTasksForDate(date);
}

async function displayTasksForDate(date) {
    if (!selectedProjectId) {
        document.getElementById('taskList').innerHTML = '<p>프로젝트를 선택하세요</p>';
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/tasks/project/${selectedProjectId}`);
        if (!response.ok) throw new Error('Task 로드 실패');
        
        const tasks = await response.json();
        const dateStr = formatDate(date);
        
        // 해당 날짜가 테스크 기간(시작~종료) 안에 포함되는지 필터링
        const filteredTasks = tasks.filter(task => {
            // LocalDate(YYYY-MM-DD)는 문자열로 전달되므로 날짜 비교가 용이함
            const taskStart = task.startAt;
            const taskEnd = task.endAt;
            return dateStr >= taskStart && dateStr <= taskEnd;
        });
        
        if (filteredTasks.length === 0) {
            document.getElementById('taskList').innerHTML = '<p>이 날짜에 작업이 없습니다</p>';
            return;
        }
        
        const taskListHTML = filteredTasks.map(task => {
        // 상태 값 매핑 (int 기준: 0-start, 1-progress, 2-end)
        const statusMap = { 0: 'start', 1: 'progress', 2: 'end' };
        const statusText = statusMap[task.status] ?? '대기';
        
        // 부담당자 이름 목록 생성
        const co_assignees = task.users && task.users.length > 0 
            ? task.users.map(u => u.name).join(', ') 
            : '없음';

        // 담당자 이름
        const assignee = task.user ? task.user.name : '미지정';

        return `
            <div class="task-item">
                <div class="title">${task.content || '작업'}</div>
                <div class="dates">
                    시작: ${formatDate(new Date(task.startAt))} ~ 
                    종료: ${formatDate(new Date(task.endAt))}
                </div>
                <div class="assignee" style="font-size: 12px; color: #888; margin-bottom: 4px;">
                    담당자: ${assignee}
                </div>
                <div class="co_assignees" style="font-size: 12px; color: #666; margin-bottom: 8px;">
                    부담당자: ${co_assignees}
                </div>
                <span class="status status-${statusText}">${statusText}</span>
                ${task.description ? `<div class="description">${task.description}</div>` : ''}
            </div>
            `;
        }).join('');
        
        document.getElementById('taskList').innerHTML = taskListHTML;
    } catch (error) {
        console.error('Task 표시 오류:', error);
        document.getElementById('taskList').innerHTML = '<p>작업 로드 중 오류가 발생했습니다</p>';
    }
}
