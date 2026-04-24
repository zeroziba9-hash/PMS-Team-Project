const AUTH_API = 'http://localhost:8081/api/auth';

document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const loginId  = document.getElementById('loginId').value.trim();
    const password = document.getElementById('password').value;
    const btn      = document.getElementById('loginBtn');
    const errorMsg = document.getElementById('errorMsg');

    if (!loginId || !password) {
        errorMsg.textContent = '아이디와 비밀번호를 입력하세요.';
        return;
    }

    btn.disabled    = true;
    btn.textContent = '로그인 중...';
    errorMsg.textContent = '';

    try {
        const res = await fetch(`${AUTH_API}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ loginId, password })
        });

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            errorMsg.textContent = err.message || '아이디 또는 비밀번호가 올바르지 않습니다.';
            return;
        }

        const data = await res.json();

        // 토큰 + 사용자 정보 저장
        sessionStorage.setItem('pms_token',  data.token);
        sessionStorage.setItem('pms_userId', data.userId);
        sessionStorage.setItem('pms_name',   data.name);

        // 프로젝트 1번 대시보드로 이동 (데모용)
        window.location.href = '/project/1/index';

    } catch (err) {
        errorMsg.textContent = 'auth-api 서버(8081)에 연결할 수 없습니다.';
    } finally {
        btn.disabled    = false;
        btn.textContent = '로그인';
    }
});
