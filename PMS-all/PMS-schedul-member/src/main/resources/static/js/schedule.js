const API_BASE = 'http://localhost:8080/api';
let currentDate = new Date();
let selectedDate = null;
let selectedProjectId = null;

document.addEventListener('DOMContentLoaded', () => {
    loadProjects();
    renderCalendar();
    setupEventListeners();
});

function setupEventListeners() {
    document.getElementById('projectId').addEventListener('change', (e) => {
        selectedProjectId = e.target.value;
        renderCalendar();
    });

    document.getElementById('prevMonth').addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    });

    document.getElementById('nextMonth').addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    });
}

async function loadProjects() {
    try {
        const response = await fetch(`${API_BASE}/projects`);
        if (!response.ok) throw new Error('프로젝트 로드 실패');
        
        const projects = await response.json();
        const projectSelect = document.getElementById('projectId');
        
        projectSelect.innerHTML = '<option value="">프로젝트 선택</option>';
        projects.forEach(project => {
            const option = document.createElement('option');
            option.value = project.id;
            option.textContent = project.title;
            projectSelect.appendChild(option);
        });
    } catch (error) {
        console.error('프로젝트 로드 오류:', error);
        // 테스트용 더미 데이터
        document.getElementById('projectId').innerHTML = `
            <option value="">프로젝트 선택</option>
            <option value="1">프로젝트 1</option>
            <option value="2">프로젝트 2</option>
        `;
    }
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
                cell.dataset.date = cellDate.toISOString().split('T')[0];
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
        
        const startStr = startDate.toISOString().replace('Z', '+00:00');
        const endStr = endDate.toISOString().replace('Z', '+00:00');
        
        const response = await fetch(
            `${API_BASE}/tasks/project/${selectedProjectId}/range?startAt=${encodeURIComponent(startStr)}&endAt=${encodeURIComponent(endStr)}`
        );
        
        if (!response.ok) throw new Error('Task 로드 실패');
        
        const tasks = await response.json();
        
        // 캘린더에 작업 표시
        tasks.forEach(task => {
            const startDate = task.startAt.split('T')[0];
            const cell = document.querySelector(`td[data-date="${startDate}"]`);
            if (cell && cell.querySelector('.tasks')) {
                const taskEl = document.createElement('div');
                taskEl.className = 'task';
                taskEl.textContent = task.content || '작업';
                taskEl.title = task.content;
                cell.querySelector('.tasks').appendChild(taskEl);
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
        const dateStr = date.toISOString().split('T')[0];
        
        const filteredTasks = tasks.filter(task => {
            const taskDate = task.startAt.split('T')[0];
            return taskDate === dateStr;
        });
        
        if (filteredTasks.length === 0) {
            document.getElementById('taskList').innerHTML = '<p>이 날짜에 작업이 없습니다</p>';
            return;
        }
        
        const taskListHTML = filteredTasks.map(task => `
            <div class="task-item">
                <div class="title">${task.content || '작업'}</div>
                <div class="dates">
                    시작: ${new Date(task.startAt).toLocaleString('ko-KR')} ~ 
                    종료: ${new Date(task.endAt).toLocaleString('ko-KR')}
                </div>
                <span class="status">${task.status || '대기'}</span>
                ${task.description ? `<div class="description">${task.description}</div>` : ''}
            </div>
        `).join('');
        
        document.getElementById('taskList').innerHTML = taskListHTML;
    } catch (error) {
        console.error('Task 표시 오류:', error);
        document.getElementById('taskList').innerHTML = '<p>작업 로드 중 오류가 발생했습니다</p>';
    }
}
