const API_BASE = 'http://localhost:8080/api';
let allUsers = [];
let projectMembers = [];
let selectedProjectId = null;
let pendingUsers = []; // 추가 대기 중인 사용자 목록
let selectedAvailableUser = null; // 왼쪽 리스트에서 현재 선택된 사용자

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
    // 멤버 추가 버튼
    document.getElementById('addMemberBtn').addEventListener('click', () => {
        openAddMemberModal();
    });

    // 모달 닫기 버튼
    document.querySelector('.modal-close').addEventListener('click', closeAddMemberModal);
    document.querySelector('.btn-cancel').addEventListener('click', closeAddMemberModal);

    // 모달 확인 버튼
    document.getElementById('confirmAddBtn').addEventListener('click', confirmAddMember);

    // 사용자 검색 입력 이벤트
    const searchInput = document.getElementById('userSearch');
    if (searchInput) {
        searchInput.addEventListener('input', () => renderDualLists());
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
}

// 사용자 데이터 로드 플래그 (중복 로드 방지)
let isLoadingUsers = false;

async function loadMembers() {
    if (isLoadingUsers) return; // 이미 로드 중이면 중단
    
    isLoadingUsers = true;
    
    try {
        // 전체 사용자 로드 (한 번만)
        if (allUsers.length === 0) {
            const usersResponse = await fetch(`${API_BASE}/users`);
            if (!usersResponse.ok) throw new Error('사용자 로드 실패');
            allUsers = await usersResponse.json();
        }

        // 프로젝트 멤버 로드
        const membersResponse = await fetch(`${API_BASE}/members/project/${selectedProjectId}`);
        if (!membersResponse.ok) throw new Error('멤버 로드 실패');
        projectMembers = await membersResponse.json();
    } catch (error) {
        console.error('멤버 로드 오류:', error);
    } finally {
        isLoadingUsers = false;
    }
}

function renderMembersTable() {
    const tbody = document.getElementById('membersTableBody');
    
    if (projectMembers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: #999; padding: 30px;">멤버가 없습니다</td></tr>';
        return;
    }

    tbody.innerHTML = projectMembers.map(member => `
        <tr>
            <td>${member.user.name}</td>
            <td>${member.user.id}</td>
            <td>
                <span class="role-badge ${member.isLeader ? 'role-admin' : 'role-contributor'}">
                    ${member.isLeader ? 'ADMIN' : 'CONTRIBUTOR'}
                </span>
            </td>
            <td>-</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-action" onclick="editMember(${member.id})">역할 변경</button>
                    <button class="btn-action btn-delete" onclick="deleteMember(${member.id})">제거</button>
                </div>
            </td>
        </tr>
    `).join('');
}

async function openAddMemberModal() {
    if (!selectedProjectId) {
        alert('프로젝트를 먼저 선택하세요');
        return;
    }

    // 1. 모달을 먼저 표시 (사용자 경험 개선)
    document.getElementById('addMemberModal').classList.add('show');
    
    // 2. 초기화
    pendingUsers = [];
    selectedAvailableUser = null;
    const searchInput = document.getElementById('userSearch');
    if (searchInput) searchInput.value = '';
    
    // 3. 데이터 로드 및 렌더링
    await loadMembers();
    renderDualLists();
}

function renderDualLists() {
    const searchTerm = document.getElementById('userSearch')?.value.toLowerCase() || '';
    const projectMemberIds = new Set(projectMembers.map(m => m.user.id));
    const pendingUserIds = new Set(pendingUsers.map(u => u.id));

    // 왼쪽 리스트: 프로젝트 멤버가 아니고, 추가 대기 목록에도 없는 사용자 검색
    const availableUsers = allUsers.filter(user => 
        !projectMemberIds.has(user.id) && 
        !pendingUserIds.has(user.id) &&
        (user.name.toLowerCase().includes(searchTerm) || user.id.toString().includes(searchTerm))
    );

    const availableList = document.getElementById('availableUsersList');
    if (availableList) {
        availableList.innerHTML = availableUsers.map(user => `
            <div class="user-item ${selectedAvailableUser?.id == user.id ? 'selected' : ''}" 
                 onclick="selectAvailableUser('${user.id}')">
                ${user.name} (${user.id})
            </div>
        `).join('');
    }

    const selectedList = document.getElementById('selectedUsersList');
    if (selectedList) {
        selectedList.innerHTML = pendingUsers.map(user => `
            <div class="user-item">
                ${user.name} (${user.id})
                <button class="btn-remove-item" onclick="removePendingUser('${user.id}')">×</button>
            </div>
        `).join('');
    }
}

function selectAvailableUser(userId) {
    selectedAvailableUser = allUsers.find(u => u.id == userId);
    renderDualLists();
}

function moveToRight() {
    if (selectedAvailableUser) {
        pendingUsers.push(selectedAvailableUser);
        selectedAvailableUser = null;
        renderDualLists();
    }
}

function removePendingUser(userId) {
    // 선택한 유저를 제외한 나머지만 남김 (삭제 로직)
    pendingUsers = pendingUsers.filter(u => u.id != userId);
    renderDualLists();
}

function closeAddMemberModal() {
    document.getElementById('addMemberModal').classList.remove('show');
}

async function confirmAddMember() {
    if (pendingUsers.length === 0) {
        alert('추가할 멤버를 선택하세요');
        return;
    }

    try {
        // 선택된 모든 사용자를 CONTRIBUTOR(isLeader=false)로 추가
        for (const user of pendingUsers) {
            const response = await fetch(
                `${API_BASE}/members?projectId=${selectedProjectId}&userId=${user.id}&isLeader=false`,
                { method: 'POST' }
            );

            if (!response.ok) {
                const errorMessage = await response.text();
                throw new Error(`${user.name} 추가 실패: ${errorMessage || response.status}`);
            }
        }

        alert('멤버가 추가되었습니다');
        closeAddMemberModal();
        await loadMembers();
        renderMembersTable();
    } catch (error) {
        console.error('멤버 추가 오류:', error);
        alert(`멤버 추가 실패: ${error.message}`);
    }
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

function editMember(memberId) {
    alert('역할 변경 기능은 준비 중입니다');
}
