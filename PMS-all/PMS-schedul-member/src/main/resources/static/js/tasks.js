const API_BASE = 'http://localhost:8080/api';

const token     = sessionStorage.getItem('pms_token');
const curUserId = sessionStorage.getItem('pms_userId');
const curName   = sessionStorage.getItem('pms_name') || '나';
if (!token) window.location.href = '/login';

function authFetch(url, options = {}) {
    return fetch(url, {
        ...options,
        headers: { ...(options.headers || {}), 'Authorization': `Bearer ${token}` }
    });
}

let selectedProjectId   = null;
let projectMembers      = [];
let projectTasks        = [];
let taskMembers         = [];
let selectedAvailableUser = null;
let dragTaskId          = null;
let activeTaskId        = null;
let commentCounts       = {};

// 필터 상태
let filterStatus  = 'all';
let filterMember  = 'all';
let filterKeyword = '';

// ── 초기화 ────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    const pathParts = window.location.pathname.split('/');
    selectedProjectId = pathParts[2];
    setTodayDates();
    if (selectedProjectId) initProjectData();
    setupEventListeners();
});

function setTodayDates() {
    const today = new Date();
    const fmt = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    const todayStr = fmt(today);
    const el = document.getElementById('taskStartAt');
    const el2 = document.getElementById('taskEndAt');
    if (el)  el.value  = todayStr;
    if (el2) el2.value = todayStr;
}

async function initProjectData() {
    await loadData();
    await loadCommentCounts();
    populateMemberFilter();
    renderKanban();
    checkDeadlines();
}

async function loadData() {
    try {
        const [membersRes, tasksRes] = await Promise.all([
            authFetch(`${API_BASE}/members/project/${selectedProjectId}`),
            authFetch(`${API_BASE}/tasks/project/${selectedProjectId}`)
        ]);
        projectMembers = membersRes.ok ? await membersRes.json() : [];
        projectTasks   = tasksRes.ok  ? await tasksRes.json()   : [];
    } catch (e) { console.error('데이터 로드 오류:', e); }
}

async function loadCommentCounts() {
    for (const task of projectTasks) {
        try {
            const res = await authFetch(`${API_BASE}/comments/task/${task.id}`);
            if (res.ok) commentCounts[task.id] = (await res.json()).length;
        } catch {}
    }
}

function populateMemberFilter() {
    const sel = document.getElementById('filterMember');
    if (!sel) return;
    sel.innerHTML = '<option value="all">전체 멤버</option>' +
        projectMembers.map(m =>
            `<option value="${m.user.id}">${m.user.name}</option>`
        ).join('');
}

// ── 필터 ─────────────────────────────────────────────
function getFilteredTasks() {
    const todayStr = new Date().toISOString().slice(0,10);
    return projectTasks.filter(t => {
        if (filterStatus !== 'all' && t.status !== parseInt(filterStatus)) return false;
        if (filterMember !== 'all' && !(t.users || []).some(u => String(u.id) === String(filterMember))) return false;
        if (filterKeyword && !(t.content || '').toLowerCase().includes(filterKeyword.toLowerCase())) return false;
        return true;
    });
}

function updateFilterCount(filtered) {
    const el = document.getElementById('filterCount');
    if (el) el.textContent = `${filtered.length}개 표시 중`;
}

// ── 칸반 렌더링 ───────────────────────────────────────
function renderKanban() {
    const todayStr = new Date().toISOString().slice(0,10);
    const filtered = getFilteredTasks();
    updateFilterCount(filtered);

    [0, 1, 2].forEach(s => {
        const cards = document.getElementById(`cards-${s}`);
        const col   = filtered.filter(t => t.status === s);
        document.getElementById(`count-${s}`).textContent = col.length;
        if (col.length === 0) {
            cards.innerHTML = `<div class="card-empty">${['할 일 없음','진행 중인 작업 없음','완료된 작업 없음'][s]}</div>`;
        } else {
            cards.innerHTML = '';
            col.forEach(task => cards.appendChild(createCard(task, todayStr)));
        }
    });
    setupDragDrop();
}

function createCard(task, todayStr) {
    const card = document.createElement('div');
    card.className = 'kanban-card';
    card.draggable = true;
    card.dataset.taskId = task.id;

    const overdue = task.status !== 2 && task.endAt && task.endAt < todayStr;
    if (overdue) card.classList.add('overdue');

    const avatars = (task.users || []).map(u =>
        `<div class="card-avatar" title="${u.name}">${u.name.charAt(0)}</div>`
    ).join('');

    const cnt   = commentCounts[task.id] || 0;
    const badge = cnt > 0 ? `<span class="card-badge-comment">💬 ${cnt}</span>` : '';
    const dateClass = overdue ? 'card-dates overdue-date' : 'card-dates';
    const datePrefix = overdue ? '⚠️ ' : '📅 ';

    card.innerHTML = `
        ${badge}
        <div class="card-title">${escapeHtml(task.content || '(제목 없음)')}</div>
        <div class="${dateClass}">${datePrefix}${task.startAt || ''} ~ ${task.endAt || ''}</div>
        <div class="card-members">${avatars}</div>
        <div class="card-footer">
            <button class="card-btn card-btn-edit"   onclick="event.stopPropagation();openEditTaskModal(${task.id},'${escapeQ(task.content)}',${task.status},'${task.startAt||''}','${task.endAt||''}')">✏️ 수정</button>
            <button class="card-btn card-btn-member" onclick="event.stopPropagation();editMember(${task.id})">👥 멤버</button>
            <button class="card-btn card-btn-del"    onclick="event.stopPropagation();deleteTask(${task.id})">🗑️ 삭제</button>
        </div>`;

    card.addEventListener('click', () => openDetailPanel(task.id));
    card.addEventListener('dragstart', e => { dragTaskId = task.id; card.classList.add('dragging'); e.dataTransfer.effectAllowed = 'move'; });
    card.addEventListener('dragend',   () => card.classList.remove('dragging'));
    return card;
}

function escapeQ(s)   { return (s || '').replace(/'/g, "\\'"); }
function escapeHtml(s){ return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

// ── 드래그앤드롭 ──────────────────────────────────────
function setupDragDrop() {
    document.querySelectorAll('.kanban-col').forEach(col => {
        col.addEventListener('dragover',  e => { e.preventDefault(); col.classList.add('drag-over'); });
        col.addEventListener('dragleave', () => col.classList.remove('drag-over'));
        col.addEventListener('drop', async e => {
            e.preventDefault(); col.classList.remove('drag-over');
            const newStatus = parseInt(col.dataset.status);
            if (dragTaskId == null) return;
            const task = projectTasks.find(t => t.id == dragTaskId);
            if (!task || task.status === newStatus) return;
            await authFetch(`${API_BASE}/tasks/modify?taskId=${dragTaskId}&status=${newStatus}`, { method: 'POST' });
            task.status = newStatus;
            renderKanban();
        });
    });
}

// ── 마감 알림 ─────────────────────────────────────────
function checkDeadlines() {
    const today = new Date(); today.setHours(0,0,0,0);
    const tmr   = new Date(today); tmr.setDate(tmr.getDate() + 1);
    const fmt   = d => d.toISOString().slice(0,10);
    const urgent = projectTasks.filter(t => t.status !== 2 && (t.endAt === fmt(today) || t.endAt === fmt(tmr)));
    if (urgent.length > 0) {
        document.getElementById('notifBar').style.display = 'flex';
        document.getElementById('notifTasks').textContent =
            urgent.map(t => `"${t.content}"(${t.endAt === fmt(today) ? '오늘' : '내일'} 마감)`).join(' / ');
    }
}

// ── 상세 패널 ─────────────────────────────────────────
async function openDetailPanel(taskId) {
    activeTaskId = taskId;
    const task   = projectTasks.find(t => t.id == taskId);
    if (!task) return;

    const statusLabel = { 0:'시작 전', 1:'진행중', 2:'완료' };
    document.getElementById('detailTitle').textContent = task.content || '(제목 없음)';
    document.getElementById('detailMeta').innerHTML  =
        `📅 ${task.startAt || '?'} ~ ${task.endAt || '?'}&nbsp;&nbsp;|&nbsp;&nbsp;` +
        `${statusLabel[task.status] || ''}` +
        `${(task.users||[]).length > 0 ? `&nbsp;&nbsp;|&nbsp;&nbsp;담당: ${task.users.map(u=>u.name).join(', ')}` : ''}`;

    const descArea = document.getElementById('descArea');
    descArea.value = task.description || '';

    document.getElementById('commentInput').value = '';
    await loadComments(taskId);
    await loadFiles(taskId);

    document.getElementById('detailOverlay').classList.add('show');
    document.getElementById('detailPanel').classList.add('show');
}

function closeDetailPanel() {
    activeTaskId = null;
    document.getElementById('detailOverlay').classList.remove('show');
    document.getElementById('detailPanel').classList.remove('show');
}

async function saveDescription() {
    if (!activeTaskId) return;
    const content = document.getElementById('descArea').value;
    try {
        const res = await authFetch(
            `${API_BASE}/tasks/modify?taskId=${activeTaskId}&description=${encodeURIComponent(content)}`,
            { method: 'POST' }
        );
        if (res.ok) {
            const task = projectTasks.find(t => t.id == activeTaskId);
            if (task) task.description = content;
            const btn = document.getElementById('descSaveBtn');
            btn.textContent = '저장됨 ✓';
            btn.style.background = '#10b981';
            setTimeout(() => { btn.textContent = '저장'; btn.style.background = ''; }, 1500);
        }
    } catch { showError('저장에 실패했습니다'); }
}

// ── 댓글 ──────────────────────────────────────────────
async function loadComments(taskId) {
    const list = document.getElementById('commentList');
    list.innerHTML = '<div style="color:#d1d5db;font-size:13px;padding:6px 0;">로딩 중...</div>';
    try {
        const res = await authFetch(`${API_BASE}/comments/task/${taskId}`);
        const comments = res.ok ? await res.json() : [];
        commentCounts[taskId] = comments.length;
        if (comments.length === 0) {
            list.innerHTML = '<div style="color:#d1d5db;font-size:13px;padding:6px 0;">아직 댓글이 없습니다</div>';
            return;
        }
        list.innerHTML = comments.map(c => {
            const name   = c.user?.name || '?';
            const time   = c.createdAt ? c.createdAt.substring(0,16).replace('T',' ') : '';
            const isMine = String(c.user?.id) === String(curUserId);
            return `<div class="comment-item">
                <div class="comment-avatar">${name.charAt(0)}</div>
                <div class="comment-body">
                    <div class="comment-author">${escapeHtml(name)}</div>
                    <div class="comment-text">${escapeHtml(c.content)}</div>
                    <div class="comment-time">${time}</div>
                </div>
                ${isMine ? `<button class="comment-del" onclick="deleteComment(${c.id})" title="삭제">×</button>` : ''}
            </div>`;
        }).join('');
    } catch { list.innerHTML = '<div style="color:#ef4444;font-size:13px;">댓글 로드 실패</div>'; }
}

async function sendComment() {
    const input   = document.getElementById('commentInput');
    const content = input.value.trim();
    if (!content || !activeTaskId) return;
    try {
        const res = await authFetch(
            `${API_BASE}/comments?taskId=${activeTaskId}&userId=${curUserId}&content=${encodeURIComponent(content)}`,
            { method: 'POST' }
        );
        if (!res.ok) throw new Error();
        input.value = '';
        await loadComments(activeTaskId);
        renderKanban();
    } catch { showError('댓글 전송에 실패했습니다'); }
}

async function deleteComment(commentId) {
    if (!confirm('댓글을 삭제하시겠습니까?')) return;
    await authFetch(`${API_BASE}/comments/${commentId}`, { method: 'DELETE' });
    await loadComments(activeTaskId);
    renderKanban();
}

// ── 파일 ──────────────────────────────────────────────
async function loadFiles(taskId) {
    const list = document.getElementById('fileList');
    list.innerHTML = '';
    try {
        const res   = await authFetch(`${API_BASE}/files/task/${taskId}`);
        const files = res.ok ? await res.json() : [];
        if (files.length === 0) {
            list.innerHTML = '<div style="color:#d1d5db;font-size:13px;margin-bottom:4px;">첨부파일 없음</div>';
            return;
        }
        const icons = { pdf:'📄',doc:'📝',docx:'📝',xls:'📊',xlsx:'📊',png:'🖼️',jpg:'🖼️',jpeg:'🖼️',zip:'📦',txt:'📃' };
        list.innerHTML = files.map(f => {
            const ext  = f.originalName.split('.').pop().toLowerCase();
            const icon = icons[ext] || '📎';
            const size = f.fileSize ? (f.fileSize > 1048576
                ? `${(f.fileSize/1048576).toFixed(1)}MB`
                : `${Math.round(f.fileSize/1024)}KB`) : '';
            return `<div class="file-item">
                <span class="file-icon">${icon}</span>
                <div class="file-info">
                    <div class="file-name">${escapeHtml(f.originalName)}</div>
                    <div class="file-size">${size}</div>
                </div>
                <a class="file-download" href="${API_BASE}/files/download/${f.id}" target="_blank">다운로드</a>
                <button class="file-del" onclick="deleteFile(${f.id})" title="삭제">×</button>
            </div>`;
        }).join('');
    } catch { list.innerHTML = '<div style="color:#ef4444;font-size:13px;">파일 목록 로드 실패</div>'; }
}

async function uploadFiles(files) {
    if (!activeTaskId) return;
    for (const file of files) {
        const fd = new FormData();
        fd.append('taskId', activeTaskId);
        fd.append('file', file);
        try { await authFetch(`${API_BASE}/files/upload`, { method: 'POST', body: fd }); }
        catch { showError(`업로드 실패: ${file.name}`); }
    }
    await loadFiles(activeTaskId);
}

async function deleteFile(fileId) {
    if (!confirm('파일을 삭제하시겠습니까?')) return;
    await authFetch(`${API_BASE}/files/${fileId}`, { method: 'DELETE' });
    await loadFiles(activeTaskId);
}

// ── 이벤트 설정 ───────────────────────────────────────
function setupEventListeners() {
    document.getElementById('addTaskBtn').addEventListener('click', openAddTaskModal);
    document.getElementById('task-modal-close').addEventListener('click', closeAddTaskModal);
    document.getElementById('task-edit-modal-close').addEventListener('click', closeEditTaskModal);
    document.getElementById('member-modal-close').addEventListener('click', closeAddMemberModal);
    document.getElementById('task-btn-cancel').addEventListener('click', closeAddTaskModal);
    document.getElementById('task-edit-btn-cancel').addEventListener('click', closeEditTaskModal);
    document.getElementById('member-btn-cancel').addEventListener('click', closeAddMemberModal);
    document.getElementById('confirmAddTaskBtn').addEventListener('click', confirmAddTask);
    document.getElementById('confirmEditTaskBtn').addEventListener('click', confirmEditTask);
    document.getElementById('confirmAddBtn').addEventListener('click', confirmAddMember);
    document.getElementById('detailClose').addEventListener('click', closeDetailPanel);
    document.getElementById('detailOverlay').addEventListener('click', closeDetailPanel);
    document.getElementById('commentSend').addEventListener('click', sendComment);
    document.getElementById('commentInput').addEventListener('keydown', e => { if (e.key === 'Enter') sendComment(); });
    document.getElementById('fileInput').addEventListener('change', e => uploadFiles(Array.from(e.target.files)));
    document.getElementById('descSaveBtn').addEventListener('click', saveDescription);

    const searchInput = document.getElementById('userSearch');
    if (searchInput) searchInput.addEventListener('input', renderDualLists);
    const moveBtn = document.getElementById('moveToRightBtn');
    if (moveBtn) moveBtn.addEventListener('click', moveToRight);

    document.getElementById('addMemberModal').addEventListener('click', e => { if (e.target.id === 'addMemberModal') closeAddMemberModal(); });
    document.getElementById('addTaskModal').addEventListener('click',   e => { if (e.target.id === 'addTaskModal') closeAddTaskModal(); });
    document.getElementById('editTaskModal').addEventListener('click',  e => { if (e.target.id === 'editTaskModal') closeEditTaskModal(); });

    // 필터
    document.getElementById('filterSearch').addEventListener('input', e => {
        filterKeyword = e.target.value; renderKanban();
    });
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            filterStatus = btn.dataset.status;
            renderKanban();
        });
    });
    document.getElementById('filterMember').addEventListener('change', e => {
        filterMember = e.target.value; renderKanban();
    });
}

// ── 태스크 CRUD ───────────────────────────────────────
async function openAddTaskModal() {
    document.getElementById('addTaskModal').classList.add('show');
    document.getElementById('taskContent').value = '';
    document.getElementById('taskDesc').value    = '';
}
function closeAddTaskModal()  { document.getElementById('addTaskModal').classList.remove('show'); }
function closeEditTaskModal() { document.getElementById('editTaskModal').classList.remove('show'); }
function closeAddMemberModal(){ document.getElementById('addMemberModal').classList.remove('show'); }

async function confirmAddTask() {
    const content  = document.getElementById('taskContent').value.trim();
    const startAt  = document.getElementById('taskStartAt').value;
    const endAt    = document.getElementById('taskEndAt').value;
    if (!content)  { showWarning('태스크 제목을 입력하세요'); return; }
    if (!startAt || !endAt) { showWarning('시작일과 마감일을 입력하세요'); return; }
    if (startAt > endAt)    { showWarning('시작일이 마감일보다 클 수 없습니다'); return; }

    const res = await authFetch(
        `${API_BASE}/tasks?projectId=${selectedProjectId}&content=${encodeURIComponent(content)}&creatorId=${curUserId}&startAt=${startAt}&endAt=${endAt}`,
        { method: 'POST' }
    );
    if (!res.ok) { showError('태스크 추가에 실패했습니다'); return; }

    // description 있으면 저장
    const desc = document.getElementById('taskDesc')?.value.trim();
    if (desc) {
        const newTask = await res.json().catch(() => null);
        if (newTask?.id) {
            await authFetch(`${API_BASE}/tasks/modify?taskId=${newTask.id}&description=${encodeURIComponent(desc)}`, { method: 'POST' });
        }
    }

    showSuccess('태스크가 추가되었습니다');
    closeAddTaskModal();
    await refresh();
}

function openEditTaskModal(taskId, taskContent, taskStatus, startAt, endAt) {
    document.getElementById('editTaskModal').classList.add('show');
    document.getElementById('taskEditContent').value = taskContent || '';
    document.getElementById('status').value          = taskStatus;
    document.getElementById('curTaskId').value       = taskId;
    document.getElementById('editStartAt').value     = startAt || '';
    document.getElementById('editEndAt').value       = endAt   || '';
}

async function confirmEditTask() {
    const taskId  = document.getElementById('curTaskId').value;
    const content = document.getElementById('taskEditContent').value.trim();
    const status  = document.getElementById('status').value;
    const startAt = document.getElementById('editStartAt').value;
    const endAt   = document.getElementById('editEndAt').value;
    if (!content) { showWarning('태스크 제목을 입력하세요'); return; }
    if (startAt && endAt && startAt > endAt) { showWarning('시작일이 마감일보다 클 수 없습니다'); return; }

    await authFetch(`${API_BASE}/tasks/modify?taskId=${taskId}&content=${encodeURIComponent(content)}&status=${status}`, { method: 'POST' });
    if (startAt) await authFetch(`${API_BASE}/tasks/modifyStart?taskId=${taskId}&start=${startAt}`, { method: 'POST' });
    if (endAt)   await authFetch(`${API_BASE}/tasks/modifyEnd?taskId=${taskId}&end=${endAt}`, { method: 'POST' });

    showSuccess('태스크가 수정되었습니다');
    closeEditTaskModal();
    await refresh();
}

async function editMember(taskId) {
    document.getElementById('editMemberTaskId').value = taskId;
    document.getElementById('userSearch').value       = '';
    taskMembers = projectTasks.find(t => t.id == taskId)?.users ?? [];
    selectedAvailableUser = null;
    renderDualLists();
    document.getElementById('addMemberModal').classList.add('show');
}

function renderDualLists() {
    const keyword     = (document.getElementById('userSearch')?.value || '').toLowerCase();
    const taskUserIds = new Set(taskMembers.map(u => u.id));

    const available = projectMembers
        .filter(m => !taskUserIds.has(m.user.id))
        .filter(m => !keyword || m.user.name.toLowerCase().includes(keyword));

    document.getElementById('userList').innerHTML = available.length === 0
        ? '<div style="color:#d1d5db;font-size:12px;padding:8px;">멤버 없음</div>'
        : available.map(m => `
            <div class="user-item ${selectedAvailableUser === m.user.id ? 'selected' : ''}"
                 onclick="selectedAvailableUser=${m.user.id}; renderDualLists()">
                ${escapeHtml(m.user.name)}
            </div>`).join('');

    document.getElementById('assignedList').innerHTML = taskMembers.length === 0
        ? '<div style="color:#d1d5db;font-size:12px;padding:8px;">담당자 없음</div>'
        : taskMembers.map(u => `
            <div class="user-item" style="justify-content:space-between;">
                ${escapeHtml(u.name)}
                <button class="btn-remove-item" onclick="removeMemberLocal(${u.id})">×</button>
            </div>`).join('');
}

function removeMemberLocal(userId) {
    taskMembers = taskMembers.filter(u => u.id !== userId);
    renderDualLists();
}

function moveToRight() {
    if (!selectedAvailableUser) { showWarning('추가할 멤버를 선택하세요'); return; }
    const member = projectMembers.find(m => m.user.id === selectedAvailableUser);
    if (member && !taskMembers.find(u => u.id === member.user.id)) taskMembers.push(member.user);
    selectedAvailableUser = null;
    renderDualLists();
}

async function confirmAddMember() {
    const taskId     = document.getElementById('editMemberTaskId').value;
    if (!taskId) return;
    const newIds     = new Set(taskMembers.map(u => u.id));
    const original   = projectTasks.find(t => t.id == taskId)?.users || [];
    const originalIds = new Set(original.map(u => u.id));
    try {
        for (const u of original)    if (!newIds.has(u.id))      await authFetch(`${API_BASE}/tasks/removeMember?taskId=${taskId}&memberId=${u.id}`, { method: 'POST' });
        for (const u of taskMembers) if (!originalIds.has(u.id)) await authFetch(`${API_BASE}/tasks/addMember?taskId=${taskId}&memberId=${u.id}`, { method: 'POST' });
    } catch (err) { showError(`멤버 변경 실패: ${err.message}`); return; }
    showSuccess('담당자가 업데이트되었습니다');
    closeAddMemberModal();
    await refresh();
}

async function deleteTask(taskId) {
    if (!confirm('태스크를 삭제하시겠습니까?')) return;
    const res = await authFetch(`${API_BASE}/tasks/${taskId}`, { method: 'DELETE' });
    if (!res.ok) { showError('삭제에 실패했습니다'); return; }
    showSuccess('태스크가 삭제되었습니다');
    if (activeTaskId == taskId) closeDetailPanel();
    await refresh();
}

async function refresh() {
    await loadData();
    await loadCommentCounts();
    populateMemberFilter();
    renderKanban();
    checkDeadlines();
}
