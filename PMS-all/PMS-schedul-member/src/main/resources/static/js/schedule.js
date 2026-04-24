const API_BASE = 'http://localhost:8080/api';

const token = sessionStorage.getItem('pms_token');
if (!token) window.location.href = '/login';

function authFetch(url, options = {}) {
    return fetch(url, {
        ...options,
        headers: { ...(options.headers || {}), 'Authorization': `Bearer ${token}` }
    });
}

let currentDate       = new Date();
let selectedDate      = null;
let selectedCell      = null;
let selectedProjectId = null;
let allTasks          = [];

const DOW_LABELS = ['일', '월', '화', '수', '목', '금', '토'];
const STATUS_COLOR = { 0: '#9ca3af', 1: '#4f6ef7', 2: '#10b981' };

function formatDate(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

document.addEventListener('DOMContentLoaded', () => {
    const pathParts = window.location.pathname.split('/');
    selectedProjectId = pathParts[2];
    if (selectedProjectId) loadAllTasks().then(() => renderCalendar());
    else renderCalendar();
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

async function loadAllTasks() {
    try {
        const res = await authFetch(`${API_BASE}/tasks/project/${selectedProjectId}`);
        if (res.ok) allTasks = await res.json();
    } catch (e) {
        console.error('태스크 로드 오류:', e);
    }
}

function getOrCreateGrid() {
    let grid = document.getElementById('calGrid');
    if (!grid) {
        // 구버전 HTML 폴백: calGrid가 없으면 calendarBody의 부모 table을 대체
        const oldTable = document.querySelector('table.calendar');
        if (oldTable) {
            grid = document.createElement('div');
            grid.id = 'calGrid';
            grid.className = 'cal-grid';
            oldTable.parentNode.replaceChild(grid, oldTable);
        } else {
            // 마지막 폴백: main-content 안에 삽입
            const main = document.querySelector('.main-content .content') || document.querySelector('.main-content');
            grid = document.createElement('div');
            grid.id = 'calGrid';
            grid.className = 'cal-grid';
            if (main) main.appendChild(grid);
        }
    }
    return grid;
}

function renderCalendar() {
    const year  = currentDate.getFullYear();
    const month = currentDate.getMonth();
    document.getElementById('monthYear').textContent = `${year}년 ${month + 1}월`;

    const grid = getOrCreateGrid();
    if (!grid) return;
    grid.innerHTML = '';

    // 요일 헤더
    DOW_LABELS.forEach((label, i) => {
        const h = document.createElement('div');
        h.className = 'cal-header-cell' + (i === 0 ? ' sun' : i === 6 ? ' sat' : '');
        h.textContent = label;
        grid.appendChild(h);
    });

    const firstDay    = new Date(year, month, 1);
    const lastDay     = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDow    = firstDay.getDay();
    const today       = formatDate(new Date());

    // 이전 달 빈 칸
    for (let j = 0; j < startDow; j++) {
        const d = new Date(year, month, 1 - (startDow - j));
        grid.appendChild(makeCell(d, true, today));
    }

    // 이번 달
    for (let d = 1; d <= daysInMonth; d++) {
        const date = new Date(year, month, d);
        grid.appendChild(makeCell(date, false, today));
    }

    // 다음 달 빈 칸 (총 셀 수를 7의 배수로)
    const totalCells = startDow + daysInMonth;
    const remainder  = totalCells % 7;
    if (remainder > 0) {
        const extra = 7 - remainder;
        for (let j = 1; j <= extra; j++) {
            const d = new Date(year, month + 1, j);
            grid.appendChild(makeCell(d, true, today));
        }
    }

    renderTaskBars();
}

function makeCell(date, isOther, today) {
    const dateStr = formatDate(date);
    const isToday = dateStr === today;
    const dow     = date.getDay();

    const cell = document.createElement('div');
    cell.className = 'cal-cell' +
        (isOther ? ' other-month' : '') +
        (isToday  ? ' today'      : '') +
        (dow === 0 ? ' sun' : dow === 6 ? ' sat' : '');
    cell.dataset.date = dateStr;

    const numEl = document.createElement('div');
    numEl.className = 'cal-date-num' + (isToday ? ' is-today' : '');
    numEl.textContent = date.getDate();
    cell.appendChild(numEl);

    const tasksEl = document.createElement('div');
    tasksEl.className = 'cal-tasks';
    cell.appendChild(tasksEl);

    if (!isOther) {
        cell.addEventListener('click', () => selectDate(cell, date));
    }
    return cell;
}

function renderTaskBars() {
    document.querySelectorAll('.cal-tasks').forEach(el => el.innerHTML = '');

    allTasks.forEach(task => {
        if (!task.startAt || !task.endAt) return;
        const barColor = STATUS_COLOR[task.status] ?? '#4f6ef7';
        let curr = new Date(task.startAt + 'T00:00:00');
        const last = new Date(task.endAt + 'T00:00:00');
        if (isNaN(curr) || isNaN(last) || curr > last) return;

        while (curr <= last) {
            const dateStr = formatDate(curr);
            const cell = document.querySelector(`.cal-cell[data-date="${dateStr}"]`);
            if (cell) {
                const tasksEl = cell.querySelector('.cal-tasks');
                const isStart = dateStr === task.startAt;
                const isEnd   = dateStr === task.endAt;

                const bar = document.createElement('div');
                bar.className = 'cal-task-bar' +
                    (isStart ? ' bar-start' : ' bar-mid') +
                    (isEnd   ? ' bar-end'   : '');
                bar.style.background = barColor;
                bar.textContent = isStart ? (task.content || '태스크') : '';
                bar.title = `${task.content || '태스크'} (${['시작전','진행중','완료'][task.status] ?? ''})`;
                bar.addEventListener('click', e => {
                    e.stopPropagation();
                    selectDate(cell, new Date(dateStr + 'T00:00:00'));
                });
                tasksEl.appendChild(bar);
            }
            curr.setDate(curr.getDate() + 1);
        }
    });
}

function selectDate(cell, date) {
    if (selectedCell) selectedCell.classList.remove('selected');
    cell.classList.add('selected');
    selectedCell = cell;
    selectedDate = date;
    displayTasksForDate(date);
}

function displayTasksForDate(date) {
    const taskList = document.getElementById('taskList');
    const titleEl  = document.getElementById('selectedDateTitle');
    const dateStr  = formatDate(date);

    if (titleEl) titleEl.textContent = `${date.getMonth() + 1}월 ${date.getDate()}일 태스크`;

    const filtered = allTasks.filter(t =>
        t.startAt && t.endAt && dateStr >= t.startAt && dateStr <= t.endAt
    );

    if (filtered.length === 0) {
        taskList.innerHTML = '<p class="empty-hint">이 날짜에 태스크가 없습니다</p>';
        return;
    }

    const statusLabel = { 0: '시작 전', 1: '진행중', 2: '완료' };

    taskList.innerHTML = filtered.map(task => {
        const bc = STATUS_COLOR[task.status] || '#4f6ef7';
        return `
        <div class="task-item" style="border-left-color:${bc};">
            <div class="task-item-title">${task.content || '(제목 없음)'}</div>
            <div class="task-item-dates">📅 ${task.startAt} ~ ${task.endAt}</div>
            <div class="task-item-assignees">담당자: ${task.users?.map(u => u.name).join(', ') || '미지정'}</div>
            <span class="task-item-status" style="background:${bc}22;color:${bc};">
                ${statusLabel[task.status] ?? ''}
            </span>
            ${task.description ? `<div class="task-item-desc">${task.description}</div>` : ''}
        </div>`;
    }).join('');
}
