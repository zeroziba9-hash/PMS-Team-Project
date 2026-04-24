
(function () {
    const API = 'http://localhost:8080/api';
    const token = sessionStorage.getItem('pms_token');
    const userStr = sessionStorage.getItem('pms_user');  // fallback
    const _userId = sessionStorage.getItem('pms_userId');
    const _name   = sessionStorage.getItem('pms_name');

    // 현재 projectId를 URL에서 추출
    const pathParts = window.location.pathname.split('/');
    const currentProjectId = pathParts[2] && !isNaN(pathParts[2]) ? Number(pathParts[2]) : null;

    // ── 유저 정보 표시 ────────────────────────────────────────────────────────
    {
        const name = _name || (userStr ? (()=>{try{const u=JSON.parse(userStr);return u.name||u.loginId||'?';}catch(e){return'?';}})() : '?');
        const el = document.getElementById('sidebarUserName');
        const av = document.getElementById('sidebarAvatar');
        if (el) el.textContent = name;
        if (av) av.textContent = name.charAt(0);
    }

    // ── 내 프로젝트 목록 로드 ─────────────────────────────────────────────────
    const COLORS = ['#4f6ef7','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4'];

    function getColor(id) { return COLORS[id % COLORS.length]; }
    function getInitial(title) { return title ? title.charAt(0).toUpperCase() : 'P'; }

    async function loadMyProjects() {
        if (!token) return;
        try {
            const res = await fetch(`${API}/projects/my`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) return;
            const projects = await res.json();
            renderSwitcher(projects);
            renderDropList(projects);
        } catch (e) {
            console.error('프로젝트 로드 실패', e);
        }
    }

    function renderSwitcher(projects) {
        const cur = projects.find(p => p.id === currentProjectId) || projects[0];
        if (!cur) {
            document.getElementById('projName').textContent = '프로젝트 없음';
            document.getElementById('projAvatar').textContent = '?';
            return;
        }
        const color = getColor(cur.id);
        document.getElementById('projName').textContent = cur.title;
        const av = document.getElementById('projAvatar');
        av.textContent = getInitial(cur.title);
        av.style.background = color;
    }

    function renderDropList(projects) {
        const list = document.getElementById('projDropList');
        if (!list) return;
        list.innerHTML = projects.map(p => {
            const color = getColor(p.id);
            const isCurrent = p.id === currentProjectId;
            return `
            <div class="proj-drop-item${isCurrent ? ' active' : ''}"
                 onclick="switchProject(${p.id})">
                <div class="proj-drop-icon" style="background:${color};">${getInitial(p.title)}</div>
                <span class="proj-drop-label">${p.title}</span>
                ${isCurrent ? '<span class="proj-drop-check">✓</span>' : ''}
            </div>`;
        }).join('');
    }

    // ── 드롭다운 토글 ─────────────────────────────────────────────────────────
    window.toggleProjDropdown = function () {
        const d = document.getElementById('projDropdown');
        const c = document.getElementById('projChevron');
        const isOpen = d.classList.contains('show');
        d.classList.toggle('show');
        c.style.transform = isOpen ? '' : 'rotate(180deg)';
        if (!isOpen) {
            setTimeout(() => document.addEventListener('click', closeOnOutside), 0);
        }
    };

    function closeOnOutside(e) {
        if (!document.getElementById('projSwitcher').contains(e.target)) {
            document.getElementById('projDropdown').classList.remove('show');
            document.getElementById('projChevron').style.transform = '';
            document.removeEventListener('click', closeOnOutside);
        }
    }

    // ── 프로젝트 전환 ─────────────────────────────────────────────────────────
    window.switchProject = function (projectId) {
        const page = pathParts[3] || 'index';
        window.location.href = `/project/${projectId}/${page}`;
    };

    // ── 로그아웃 ──────────────────────────────────────────────────────────────
    window.logout = function () {
        sessionStorage.removeItem('pms_token');
        sessionStorage.removeItem('pms_user');
        window.location.href = '/login';
    };

    // ── 새 프로젝트 모달 ──────────────────────────────────────────────────────
    window.openNewProjectModal = function () {
        document.getElementById('projDropdown').classList.remove('show');
        document.getElementById('projDropdown').style.display = 'none';
        document.getElementById('projChevron').style.transform = '';
        const modal = document.getElementById('newProjectModal');
        modal.style.display = 'flex';
        setTimeout(() => document.getElementById('newProjTitle').focus(), 50);
    };

    window.closeNewProjectModal = function () {
        document.getElementById('newProjectModal').style.display = 'none';
        document.getElementById('newProjTitle').value = '';
        document.getElementById('newProjDesc').value = '';
    };

    window.submitNewProject = async function () {
        const title = document.getElementById('newProjTitle').value.trim();
        if (!title) {
            document.getElementById('newProjTitle').focus();
            document.getElementById('newProjTitle').style.borderColor = '#ef4444';
            return;
        }
        const desc = document.getElementById('newProjDesc').value.trim();
        const btn = document.querySelector('#newProjectModal button:last-child');
        btn.textContent = '생성 중...'; btn.disabled = true;

        try {
            // 1) 프로젝트 생성
            const res = await fetch(`${API}/projects`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ title, description: desc })
            });
            if (!res.ok) throw new Error('프로젝트 생성 실패');
            const project = await res.json();

            // 2) 생성자를 ADMIN으로 멤버 추가
            const uid = Number(_userId) || null;
            if (uid) {
                // 첫 멤버 = 생성자 본인을 admin으로 추가 (requesterId=userId 동일)
                const params = new URLSearchParams({
                    projectId: project.id,
                    userId: uid,
                    isLeader: true,
                    requesterId: uid
                });
                await fetch(`${API}/members?${params}`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
            }

            closeNewProjectModal();
            // 새 프로젝트로 이동
            window.location.href = `/project/${project.id}/index`;
        } catch (e) {
            btn.textContent = '만들기'; btn.disabled = false;
            alert('프로젝트 생성에 실패했습니다.');
        }
    };

    // 초기화
    loadMyProjects();
})();
