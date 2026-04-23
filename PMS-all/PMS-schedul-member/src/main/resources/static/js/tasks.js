const API_BASE = 'http://localhost:8080/api';
let projectMembers = [];
let selectedProjectId = null;
let projectTasks = [];
let taskMembers = []; // 현재 태스크 멤버 목록
let selectedAvailableUser = null; // 왼쪽 리스트에서 현재 선택된 사용자
let curUserId = -1;

document.addEventListener('DOMContentLoaded', () => {
    // URL에서 projectId 추출 (예: /project/1/members -> 1)
    const pathParts = window.location.pathname.split('/');
    selectedProjectId = pathParts[2];

    if (selectedProjectId) {
        initProjectData();
    }

    curUserId = document.getElementById("userId").value;

    setupEventListeners();
});

async function initProjectData() {
    await loadDatas();
    renderTaskTable();
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

async function loadDatas() {
    if (isLoadingUsers) return; // 이미 로드 중이면 중단
    
    isLoadingUsers = true;
    
    try {
        // 프로젝트 멤버 로드
        const membersResponse = await fetch(`${API_BASE}/members/project/${selectedProjectId}`);
        if (!membersResponse.ok) throw new Error('멤버 로드 실패');
        projectMembers = await membersResponse.json();

        // 본인 일감 로드
        const tasksResponse = await fetch(`${API_BASE}/tasks/project/${selectedProjectId}/${curUserId}`);
        if (!tasksResponse.ok) throw new Error('일감 로드 실패');
        projectTasks = await tasksResponse.json();
    } catch (error) {
        console.error('멤버 로드 오류:', error);
    } finally {
        isLoadingUsers = false;
    }
}

function renderTaskTable() {
    const tbody = document.getElementById('membersTableBody');
    
    if (projectTasks.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: #999; padding: 30px;">테스크가 없습니다</td></tr>';
        return;
    }

    tbody.innerHTML = projectTasks.map(task => `
        <tr>
            <td>${task.content}</td>
            <td>${task.status==0?"시작":task.status==1?"진행중":task.status==2?"완료":"오류"}</td>
            <td>${task.startAt}</td>
            <td>${task.endAt}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-action" onclick="openEditTaskModal(${task.id}, '${task.content}', ${task.status})">테스크 수정</button>
                    <button class="btn-action" onclick="editMember(${task.id})">멤버 변경</button>
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
    const statusInput = document.getElementById('status');
    if (statusInput) {
        statusInput.value = taskStatus;
    }
    const curTask = document.getElementById('curTaskId');
    if(curTask){
        curTask.value = taskId;        
    }
}

async function editMember(taskId) {
    // 1. 모달을 먼저 표시 (사용자 경험 개선)
    document.getElementById('addMemberModal').classList.add('show');
    
    // 2. 초기화
    const searchInput = document.getElementById('userSearch');
    if (searchInput) searchInput.value = '';
    const curTask = document.getElementById('curTaskIdMember');
    if(curTask){
        curTask.value = taskId;
    }    
    
    // 3. 데이터 로드 및 렌더링
    await loadDatas();
    taskMembers = projectTasks.find(f=>f.id == taskId).users;
    renderDualLists();
}

function renderDualLists() {
    const searchTerm = document.getElementById('userSearch')?.value.toLowerCase() || '';
    const projectMemberIds = new Set(projectMembers.map(m => m.user.id));
    const pendingUserIds = new Set(taskMembers.map(u => u.id));
    const taskUserIds = new Set(taskMembers.map(u => u.id));

    // 왼쪽 리스트: 프로젝트 멤버이고 일감 멤버 아니고
    const availableUsers = projectMembers.filter(user => 
        !taskUserIds.has(user.id) &&
        (user.user.name.toLowerCase().includes(searchTerm) || user.id.toString().includes(searchTerm))
    );

    const availableList = document.getElementById('availableUsersList');
    if (availableList) {
        availableList.innerHTML = availableUsers.map(user => `
            <div class="user-item ${selectedAvailableUser?.id == user.id ? 'selected' : ''}" 
                 onclick="selectAvailableUser('${user.id}')">
                ${user.user.name} (${user.id})
            </div>
        `).join('');
    }

    const selectedList = document.getElementById('selectedUsersList');
    if (selectedList) {
        selectedList.innerHTML = taskMembers.map(user => `
            <div class="user-item">
                ${user.name} (${user.id})
                <button class="btn-remove-item" onclick="removePendingUser('${user.id}')">×</button>
            </div>
        `).join('');
    }
}

function selectAvailableUser(userId) {
    selectedAvailableUser = projectMembers.find(u => u.id == userId);
    renderDualLists();
}

function moveToRight() {
    if (selectedAvailableUser) {
        taskMembers.push(selectedAvailableUser.user);
        selectedAvailableUser = null;
        renderDualLists();
    }
    renderDualLists();
}

function removePendingUser(userId) {
    taskMembers = taskMembers.filter(u => u.id != userId);
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
    if (taskMembers.length === 0) {
        alert('일감의 멤버는 비워둘 수 없습니다.');
        return;
    }

    let curTaskId = -1;
    const curTask = document.getElementById('curTaskIdMember');
    if(curTask){
        curTaskId = curTask.value;
    }

    let taskMemberIds = taskMembers.map(f=>f.id);
    let removeUsers = projectMembers.filter(f=>!taskMemberIds.includes(f.user.id));

    try {
        for (const user of removeUsers) {
            const response = await fetch(
                `${API_BASE}/tasks/removeMember?taskId=${curTaskId}&memberId=${user.id}`,
                { method: 'POST' }
            );

            if (!response.ok) {
                const errorMessage = await response.text();
                throw new Error(`${user.name} 제거 실패: ${errorMessage || response.status}`);
            }
        }
        for (const user of taskMembers) {
            const response = await fetch(
                `${API_BASE}/tasks/addMember?taskId=${curTaskId}&memberId=${user.id}`,
                { method: 'POST' }
            );

            if (!response.ok) {
                const errorMessage = await response.text();
                throw new Error(`${user.name} 추가 실패: ${errorMessage || response.status}`);
            }
        }

    } catch (error) {
        console.error('멤버 오류:', error);
        alert(`멤버 변경 실패: ${error.message}`);
    } finally {
        closeAddMemberModal();
        await loadDatas();
        renderTaskTable();
    }
}

async function confirmAddTask() {
    let content = document.getElementById("taskContent").value;

    const response = await fetch(
        `${API_BASE}/tasks?projectId=${selectedProjectId}&content=${content}&creatorId=${curUserId}`,
        { method: 'POST' }
    );

    if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(`${content} 추가 실패: ${errorMessage || response.status}`);
    }
    closeAddTaskModal();
    await loadDatas();
    renderTaskTable();
}

async function confirmEditTask() {
    let content = document.getElementById("taskEditContent").value;
    let statusTxt = document.getElementById("status").value;
    let status  = Number.parseInt(statusTxt);
    let curTaskId = -1;
    const curTask = document.getElementById('curTaskId');
    if(curTask){
        curTaskId = curTask.value;
    }
    if(Number.isNaN(status)){
        //솔직히 이럴 일은 없을텐데
        return;
    }

    const response = await fetch(
        `${API_BASE}/tasks/modify?taskId=${curTaskId}&content=${content}&status=${status}`,
        { method: 'POST' }
    );

    if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(`${content} 추가 실패: ${errorMessage || response.status}`);
    }

    closeEditTaskModal();
    await loadDatas();
    renderTaskTable();
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
        await loadDatas();
        renderTaskTable();
    } catch (error) {
        console.error('멤버 제거 오류:', error);
        alert('멤버 제거 중 오류가 발생했습니다');
    }
}
