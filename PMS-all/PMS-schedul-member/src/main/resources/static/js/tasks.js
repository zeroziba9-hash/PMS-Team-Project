const API_BASE = 'http://localhost:8080/api';
let allUsers = [];
let projectMembers = [];
let selectedProjectId = null;
let projectTasks = [];

document.addEventListener('DOMContentLoaded', () => {
    // URL에서 projectId 추출 (예: /project/1/members -> 1)
    const pathParts = window.location.pathname.split('/');
    selectedProjectId = pathParts[2];

    if (selectedProjectId) {
        initProjectData();
    }
    
    setupEventListeners();
});

async function initProjectData() {
    await loadMembers();
    renderMembersTable();
}

function setupEventListeners() {
    // 일감 추가 버튼
    document.getElementById('addTaskBtn').addEventListener('click', () => {
        openAddTaskModal();
    });

    // 모달 닫기 버튼
    document.getElementById('task-modal-close').addEventListener('click', closeAddTaskModal);
    document.getElementById('task-edit-modal-close').addEventListener('click', closeEditTaskModal);
    document.getElementById('member-modal-close').addEventListener('click', closeAddMemberModal);
    document.getElementById('task-btn-cancel').addEventListener('click', closeAddTaskModal);
    document.getElementById('task-edit-btn-cancel').addEventListener('click', closeEditTaskModal);
    document.getElementById('member-btn-cancel').addEventListener('click', closeAddMemberModal);

    // 모달 확인 버튼
    document.getElementById('confirmAddTaskBtn').addEventListener('click', confirmAddTask);
    document.getElementById('confirmEditTaskBtn').addEventListener('click', confirmEditTask);
    document.getElementById('confirmAddBtn').addEventListener('click', confirmAddMember);

    // 사용자 검색 입력 이벤트
    const searchInput = document.getElementById('userSearch');
    if (searchInput) {
        searchInput.addEventListener('input', () => renderDualLists());
    }
    
    // 테스크 내용 입력 이벤트
    const contentInput = document.getElementById('taskContent');
    if (contentInput) {
        contentInput.addEventListener('input', () => renderDualLists());
    }

    // 화살표 버튼 이벤트 (오른쪽으로 이동)
    const moveBtn = document.getElementById('moveToRightBtn');
    if (moveBtn) {
        moveBtn.addEventListener('click', moveToRight);
    }

    // 모달 배경 클릭시 닫기
    document.getElementById('addMemberModal').addEventListener('click', (e) => {
        if (e.target.id === 'addMemberModal') closeAddMemberModal();
    });
    document.getElementById('addTaskModal').addEventListener('click', (e) => {
        if (e.target.id === 'addTaskModal') closeAddTaskModal();
    });
}

// 사용자 데이터 로드 플래그 (중복 로드 방지)
let isLoadingUsers = false;

async function loadMembers() {
    if (isLoadingUsers) return; // 이미 로드 중이면 중단
    
    isLoadingUsers = true;
    
    try {
        // 전체 사용자 로드 (한 번만)
        const usersResponse = await fetch(`${API_BASE}/members/project/${selectedProjectId}`);
        if (!usersResponse.ok) throw new Error('사용자 로드 실패');
        allUsers = await usersResponse.json();

        // 프로젝트 멤버 로드
        const membersResponse = await fetch(`${API_BASE}/members/project/${selectedProjectId}`);
        if (!membersResponse.ok) throw new Error('멤버 로드 실패');
        projectMembers = await membersResponse.json();

        // 프로젝트 일감 로드
        const tasksResponse = await fetch(`${API_BASE}/tasks/project/${selectedProjectId}`);
        if (!tasksResponse.ok) throw new Error('일감 로드 실패');
        projectTasks = await tasksResponse.json();
    } catch (error) {
        console.error('멤버 로드 오류:', error);
    } finally {
        isLoadingUsers = false;
    }
}

function renderMembersTable() {
    const tbody = document.getElementById('membersTableBody');
    
    if (projectTasks.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: #999; padding: 30px;">테스크가 없습니다</td></tr>';
        return;
    }

    tbody.innerHTML = projectTasks.map(task => `
        <tr>
            <td>${task.content}</td>
            <td>${task.status}</td>
            <td>${task.startAt}</td>
            <td>${task.endAt}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-action" onclick="openEditTaskModal(${task.id}, '${task.content}', ${task.status})">테스크 수정</button>
                    <button class="btn-action btn-delete" onclick="editMember(${task.id})">멤버 변경</button>
                </div>
            </td>
        </tr>
    `).join('');
}

async function openAddTaskModal() {
    // 1. 모달을 먼저 표시 (사용자 경험 개선)
    document.getElementById('addTaskModal').classList.add('show');
    
    // 2. 초기화
    const searchInput = document.getElementById('userSearch');
    if (searchInput) searchInput.value = '';
    
    const contentInput = document.getElementById('taskContent');
    if (contentInput) contentInput.value = '';
}

async function openEditTaskModal(taskId, taskContent, taskStatus) {
    // 1. 모달을 먼저 표시 (사용자 경험 개선)
    document.getElementById('editTaskModal').classList.add('show');
    console.log(taskContent);
    // 2. 초기화    
    const contentInput = document.getElementById('taskEditContent');
    if (contentInput) {
        contentInput.value = taskContent;
    }
}

async function editMember(taskId) {
    // 1. 모달을 먼저 표시 (사용자 경험 개선)
    document.getElementById('addMemberModal').classList.add('show');
    
    // 2. 초기화
    const searchInput = document.getElementById('userSearch');
    if (searchInput) searchInput.value = '';
    
    // 3. 데이터 로드 및 렌더링
    await loadMembers();
    renderDualLists();
}

function renderDualLists() {
    const searchTerm = document.getElementById('userSearch')?.value.toLowerCase() || '';
    const projectMemberIds = new Set(projectMembers.map(m => m.user.id));

    // 왼쪽 리스트: 프로젝트 멤버가 아니고, 추가 대기 목록에도 없는 사용자 검색
    const availableUsers = allUsers.filter(user => 
        !projectMemberIds.has(user.id) && 
        !pendingUserIds.has(user.id) &&
        (user.name.toLowerCase().includes(searchTerm) || user.id.toString().includes(searchTerm))
    );
}

function selectAvailableUser(userId) {
    renderDualLists();
}

function moveToRight() {
    renderDualLists();
}

function removePendingUser(userId) {
    renderDualLists();
}

function closeAddMemberModal() {
    document.getElementById('addMemberModal').classList.remove('show');
}

function closeAddTaskModal() {
    document.getElementById('addTaskModal').classList.remove('show');
}

function closeEditTaskModal() {
    document.getElementById('editTaskModal').classList.remove('show');
}

async function confirmAddMember() {
    
}

async function confirmAddTask() {
    
}

async function confirmEditTask() {
    
}

async function deleteMember(memberId) {
    if (!confirm('이 멤버를 프로젝트에서 제거하시겠습니까?')) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/members/${memberId}`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error('멤버 제거 실패');
        
        alert('멤버가 제거되었습니다');
        await loadMembers();
        renderMembersTable();
    } catch (error) {
        console.error('멤버 제거 오류:', error);
        alert('멤버 제거 중 오류가 발생했습니다');
    }
}
