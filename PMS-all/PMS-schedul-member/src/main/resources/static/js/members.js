const API_BASE = 'http://localhost:8080/api';

const token     = sessionStorage.getItem('pms_token');
const curUserId = sessionStorage.getItem('pms_userId');
if (!token) window.location.href = '/login';

function authFetch(url, options = {}) {
    return fetch(url, {
        ...options,
        headers: { ...(options.headers || {}), 'Authorization': `Bearer ${token}` }
    });
}

const AVATAR_COLORS = ['#4f6ef7','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#ec4899','#14b8a6'];

let allUsers       = [];
let projectMembers = [];
let selectedProjectId = null;
let pendingUsers   = [];
let selectedAvailableUser = null;

document.addEventListener('DOMContentLoaded', () => {
    const pathParts = window.location.pathname.split('/');
    selectedProjectId = pathParts[2];
    if (selectedProjectId) initProjectData();
    setupEventListeners();
});

async function initProjectData() {
    showSkeletonTable();
    await loadMembers();
    renderMembersTable();
}

function showSkeletonTable() {
    const tbody = document.getElementById('membersTableBody');
    tbody.innerHTML = Array(3).fill(`
        <tr>
            <td style="padding:12px 16px;"><div class="skeleton" style="width:32px;height:32px;border-radius:50%;"></div></td>
            <td><div class="skeleton" style="width:80px;height:14px;"></div></td>
            <td><div class="skeleton" style="width:60px;height:14px;"></div></td>
            <td><div class="skeleton" style="width:70px;height:20px;border-radius:99px;"></div></td>
            <td><div class="skeleton" style="width:100px;height:28px;border-radius:6px;"></div></td>
        </tr>`).join('');
}

function setupEventListeners() {
    document.getElementById('addMemberBtn').addEventListener('click', openAddMemberModal);
    document.querySelector('#addMemberModal .modal-close').addEventListener('click', closeAddMemberModal);
    document.querySelector('#addMemberModal .btn-cancel').addEventListener('click', closeAddMemberModal);
    document.getElementById('confirmAddBtn').addEventListener('click', confirmAddMember);

    const searchInput = document.getElementById('userSearch');
    if (searchInput) searchInput.addEventListener('input', renderDualLists);
    const moveBtn = document.getElementById('moveToRightBtn');
    if (moveBtn) moveBtn.addEventListener('click', moveToRight);

    document.getElementById('addMemberModal').addEventListener('click', e => {
        if (e.target.id === 'addMemberModal') closeAddMemberModal();
    });

    document.getElementById('role-modal-close').addEventListener('click', closeRoleModal);
    document.getElementById('role-btn-cancel').addEventListener('click', closeRoleModal);
    document.getElementById('confirmRoleBtn').addEventListener('click', confirmRoleChange);
    document.getElementById('roleModal').addEventListener('click', e => {
        if (e.target.id === 'roleModal') closeRoleModal();
    });

    document.querySelectorAll('input[name="roleSelect"]').forEach(radio => {
        radio.addEventListener('change', () => {
            document.querySelectorAll('.role-option').forEach(opt => opt.classList.remove('checked'));
            radio.closest('.role-option').classList.add('checked');
        });
    });
}

let isLoadingUsers = false;

async function loadMembers() {
    if (isLoadingUsers) return;
    isLoadingUsers = true;
    try {
        if (allUsers.length === 0) {
            const usersRes = await authFetch(`${API_BASE}/users`);
            if (!usersRes.ok) throw new Error('사용자 로드 실패');
            allUsers = await usersRes.json();
        }
        const membersRes = await authFetch(`${API_BASE}/members/project/${selectedProjectId}`);
        if (!membersRes.ok) throw new Error('멤버 로드 실패');
        projectMembers = await membersRes.json();
    } catch (error) {
        console.error('멤버 로드 오류:', error);
    } finally {
        isLoadingUsers = false;
    }
}

function renderMembersTable() {
    const tbody = document.getElementById('membersTableBody');
    if (projectMembers.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:var(--g-400);padding:48px 0;font-size:14px;">
            <div style="font-size:28px;margin-bottom:8px;">👥</div>
            아직 프로젝트 멤버가 없습니다
        </td></tr>`;
        return;
    }
    tbody.innerHTML = projectMembers.map((member, i) => {
        const color = AVATAR_COLORS[i % AVATAR_COLORS.length];
        return `
        <tr>
            <td style="padding:10px 16px;">
                <div class="table-avatar" style="background:${color};">${member.user.name.charAt(0)}</div>
            </td>
            <td style="font-weight:600;color:var(--g-900);font-size:13.5px;">${member.user.name}</td>
            <td style="color:var(--g-500);font-size:13px;">${member.user.loginId ?? member.user.id}</td>
            <td>
                <span class="role-badge ${member.isLeader ? 'role-admin' : 'role-contributor'}">
                    ${member.isLeader ? '👑 ADMIN' : '👤 MEMBER'}
                </span>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="btn-action" onclick="openRoleModal(${member.id}, '${member.user.name}', ${member.isLeader})">역할 변경</button>
                    <button class="btn-action btn-delete" onclick="deleteMember(${member.id})">제거</button>
                </div>
            </td>
        </tr>`;
    }).join('');
}

// ── 멤버 추가 ─────────────────────────────────────────
async function openAddMemberModal() {
    document.getElementById('addMemberModal').classList.add('show');
    pendingUsers = [];
    selectedAvailableUser = null;
    document.getElementById('userSearch').value = '';
    await loadMembers();
    renderDualLists();
}

function renderDualLists() {
    const searchTerm = document.getElementById('userSearch')?.value.toLowerCase() || '';
    const projectMemberIds = new Set(projectMembers.map(m => m.user.id));
    const pendingUserIds   = new Set(pendingUsers.map(u => u.id));

    const available = allUsers.filter(u =>
        !projectMemberIds.has(u.id) && !pendingUserIds.has(u.id) &&
        (u.name.toLowerCase().includes(searchTerm) || u.id.toString().includes(searchTerm))
    );

    document.getElementById('availableUsersList').innerHTML = available.length
        ? available.map(u => `
            <div class="user-item ${selectedAvailableUser?.id == u.id ? 'selected' : ''}"
                 onclick="selectAvailableUser('${u.id}')">
                <span>${u.name}</span>
                <span style="font-size:11px;color:var(--g-400);">${u.loginId || u.id}</span>
            </div>`).join('')
        : '<div style="padding:14px;color:var(--g-400);font-size:13px;text-align:center;">검색 결과 없음</div>';

    document.getElementById('selectedUsersList').innerHTML = pendingUsers.length
        ? pendingUsers.map(u => `
            <div class="user-item">
                <span>${u.name}</span>
                <button class="btn-remove-item" onclick="removePendingUser('${u.id}')">×</button>
            </div>`).join('')
        : '<div style="padding:14px;color:var(--g-400);font-size:13px;text-align:center;">선택된 멤버 없음</div>';
}

function selectAvailableUser(userId) { selectedAvailableUser = allUsers.find(u => u.id == userId); renderDualLists(); }
function moveToRight() {
    if (selectedAvailableUser) {
        pendingUsers.push(selectedAvailableUser);
        selectedAvailableUser = null;
        renderDualLists();
    } else {
        showWarning('추가할 멤버를 선택하세요');
    }
}
function removePendingUser(userId) { pendingUsers = pendingUsers.filter(u => u.id != userId); renderDualLists(); }
function closeAddMemberModal() { document.getElementById('addMemberModal').classList.remove('show'); }

async function confirmAddMember() {
    if (pendingUsers.length === 0) { showWarning('추가할 멤버를 선택하세요'); return; }
    try {
        for (const user of pendingUsers) {
            const res = await authFetch(
                `${API_BASE}/members?projectId=${selectedProjectId}&userId=${user.id}&isLeader=false&requesterId=${curUserId}`,
                { method: 'POST' }
            );
            if (!res.ok) {
                let errMsg = `${user.name} 추가 실패`;
                try { const d = await res.json(); errMsg = d.error || errMsg; } catch {}
                throw new Error(errMsg);
            }
        }
        showSuccess(`${pendingUsers.length}명의 멤버가 추가되었습니다`);
        closeAddMemberModal();
        allUsers = [];
        await loadMembers();
        renderMembersTable();
    } catch (error) {
        showError(`멤버 추가 실패: ${error.message}`);
    }
}

// ── 멤버 제거 ─────────────────────────────────────────
async function deleteMember(memberId) {
    if (!confirm('이 멤버를 프로젝트에서 제거하시겠습니까?')) return;
    try {
        const res = await authFetch(
            `${API_BASE}/members/${memberId}?requesterId=${curUserId}`,
            { method: 'DELETE' }
        );
        if (!res.ok) throw new Error('멤버 제거 실패');
        showSuccess('멤버가 제거되었습니다');
        allUsers = [];
        await loadMembers();
        renderMembersTable();
    } catch (error) {
        showError('멤버 제거 중 오류가 발생했습니다: ' + error.message);
    }
}

// ── 역할 변경 ─────────────────────────────────────────
function openRoleModal(memberId, memberName, isLeader) {
    document.getElementById('roleMemberId').value = memberId;
    document.getElementById('roleMemberName').textContent = `${memberName}의 역할을 변경합니다`;
    const radios = document.querySelectorAll('input[name="roleSelect"]');
    radios.forEach(r => {
        r.checked = (r.value === String(isLeader));
        r.closest('.role-option').classList.toggle('checked', r.checked);
    });
    document.getElementById('roleModal').classList.add('show');
}

function closeRoleModal() { document.getElementById('roleModal').classList.remove('show'); }

async function confirmRoleChange() {
    const memberId = document.getElementById('roleMemberId').value;
    const selected = document.querySelector('input[name="roleSelect"]:checked');
    if (!selected) return;
    const isLeader = selected.value === 'true';
    try {
        const res = await authFetch(
            `${API_BASE}/members/${memberId}?isLeader=${isLeader}&requesterId=${curUserId}`,
            { method: 'PATCH' }
        );
        if (!res.ok) {
            let msg = '역할 변경 실패';
            try { const d = await res.json(); msg = d.error || msg; } catch {}
            throw new Error(msg);
        }
        showSuccess('역할이 변경되었습니다');
        closeRoleModal();
        await loadMembers();
        renderMembersTable();
    } catch (error) {
        showError(`역할 변경 실패: ${error.message}`);
    }
}
