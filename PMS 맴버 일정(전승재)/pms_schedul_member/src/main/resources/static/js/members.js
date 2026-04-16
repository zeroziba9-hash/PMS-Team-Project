const API_BASE = 'http://localhost:8080/api';
let allUsers = [];
let projectMembers = [];
let selectedProjectId = null;

document.addEventListener('DOMContentLoaded', () => {
    loadProjects();
    setupEventListeners();
});

function setupEventListeners() {
    // 프로젝트 선택
    document.getElementById('projectId').addEventListener('change', async (e) => {
        selectedProjectId = e.target.value;
        
        if (selectedProjectId) {
            await loadMembers();
            renderMembersTable();
        } else {
            document.getElementById('membersTableBody').innerHTML = 
                '<tr><td colspan="5" style="text-align: center; color: #999; padding: 30px;">프로젝트를 선택하세요</td></tr>';
        }
    });

    // 멤버 추가 버튼
    document.getElementById('addMemberBtn').addEventListener('click', () => {
        openAddMemberModal();
    });

    // 모달 닫기 버튼
    document.querySelector('.modal-close').addEventListener('click', closeAddMemberModal);
    document.querySelector('.btn-cancel').addEventListener('click', closeAddMemberModal);

    // 모달 확인 버튼
    document.getElementById('confirmAddBtn').addEventListener('click', confirmAddMember);

    // 모달 배경 클릭시 닫기
    document.getElementById('addMemberModal').addEventListener('click', (e) => {
        if (e.target.id === 'addMemberModal') {
            closeAddMemberModal();
        }
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

async function loadMembers() {
    try {
        // 전체 사용자 로드
        const usersResponse = await fetch(`${API_BASE}/users`);
        if (!usersResponse.ok) throw new Error('사용자 로드 실패');
        allUsers = await usersResponse.json();

        // 프로젝트 멤버 로드
        const membersResponse = await fetch(`${API_BASE}/members/project/${selectedProjectId}`);
        if (!membersResponse.ok) throw new Error('멤버 로드 실패');
        projectMembers = await membersResponse.json();
    } catch (error) {
        console.error('멤버 로드 오류:', error);
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

function openAddMemberModal() {
    if (!selectedProjectId) {
        alert('프로젝트를 먼저 선택하세요');
        return;
    }

    // 프로젝트에 속하지 않은 사용자만 드롭다운에 표시
    const projectMemberIds = new Set(projectMembers.map(m => m.user.id));
    const availableUsers = allUsers.filter(user => !projectMemberIds.has(user.id));

    const userSelect = document.getElementById('userSelect');
    userSelect.innerHTML = '<option value="">사용자를 선택하세요</option>';
    
    availableUsers.forEach(user => {
        const option = document.createElement('option');
        option.value = user.id;
        option.textContent = `${user.name} (ID: ${user.id})`;
        userSelect.appendChild(option);
    });

    if (availableUsers.length === 0) {
        alert('추가할 수 있는 사용자가 없습니다');
        return;
    }

    document.getElementById('addMemberModal').classList.add('show');
}

function closeAddMemberModal() {
    document.getElementById('addMemberModal').classList.remove('show');
    document.getElementById('userSelect').value = '';
    document.getElementById('roleSelect').value = 'false';
}

async function confirmAddMember() {
    const userId = parseInt(document.getElementById('userSelect').value);
    const isLeader = document.getElementById('roleSelect').value === 'true';

    if (!userId) {
        alert('사용자를 선택하세요');
        return;
    }

    try {
        const response = await fetch(
            `${API_BASE}/members?projectId=${selectedProjectId}&userId=${userId}&isLeader=${isLeader}`,
            { method: 'POST' }
        );

        if (!response.ok) throw new Error('멤버 추가 실패');
        
        alert('멤버가 추가되었습니다');
        closeAddMemberModal();
        await loadMembers();
        renderMembersTable();
    } catch (error) {
        console.error('멤버 추가 오류:', error);
        alert('멤버 추가 중 오류가 발생했습니다');
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
