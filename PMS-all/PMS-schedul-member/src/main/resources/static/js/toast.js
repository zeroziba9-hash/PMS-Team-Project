/* ── Toast Notification System ── */
(function() {
    const COLORS = {
        success: { bg:'#ECFDF5', border:'#6EE7B7', icon:'✓', text:'#065F46' },
        error:   { bg:'#FEF2F2', border:'#FCA5A5', icon:'✕', text:'#991B1B' },
        warning: { bg:'#FFFBEB', border:'#FCD34D', icon:'!', text:'#92400E' },
        info:    { bg:'#EEF1FE', border:'#A5B4FC', icon:'i', text:'#3730A3' },
    };

    let container = null;

    function getContainer() {
        if (container) return container;
        container = document.createElement('div');
        container.style.cssText = [
            'position:fixed',
            'bottom:24px',
            'right:24px',
            'z-index:9999',
            'display:flex',
            'flex-direction:column-reverse',
            'gap:8px',
            'pointer-events:none',
        ].join(';');
        document.body.appendChild(container);
        return container;
    }

    window.showToast = function(message, type = 'info', duration = 3200) {
        const c = COLORS[type] || COLORS.info;
        const wrap = document.createElement('div');
        wrap.style.cssText = [
            'pointer-events:auto',
            'display:flex',
            'align-items:center',
            'gap:10px',
            `background:${c.bg}`,
            `border:1px solid ${c.border}`,
            'border-radius:10px',
            'padding:11px 16px',
            'box-shadow:0 4px 16px rgba(0,0,0,0.10)',
            'font-family:Inter,-apple-system,sans-serif',
            'font-size:13.5px',
            'font-weight:500',
            `color:${c.text}`,
            'min-width:240px',
            'max-width:360px',
            'opacity:0',
            'transform:translateY(12px)',
            'transition:opacity 0.22s ease, transform 0.22s ease',
            'cursor:pointer',
        ].join(';');

        const icon = document.createElement('span');
        icon.style.cssText = [
            'width:20px',
            'height:20px',
            'border-radius:50%',
            `background:${c.border}`,
            `color:${c.text}`,
            'display:flex',
            'align-items:center',
            'justify-content:center',
            'font-size:11px',
            'font-weight:700',
            'flex-shrink:0',
        ].join(';');
        icon.textContent = c.icon;

        const text = document.createElement('span');
        text.style.flex = '1';
        text.textContent = message;

        const close = document.createElement('span');
        close.textContent = '×';
        close.style.cssText = 'font-size:16px;opacity:0.5;flex-shrink:0;';

        wrap.appendChild(icon);
        wrap.appendChild(text);
        wrap.appendChild(close);

        const ct = getContainer();
        ct.appendChild(wrap);

        requestAnimationFrame(() => {
            wrap.style.opacity = '1';
            wrap.style.transform = 'translateY(0)';
        });

        const dismiss = () => {
            wrap.style.opacity = '0';
            wrap.style.transform = 'translateY(8px)';
            setTimeout(() => wrap.remove(), 250);
        };

        wrap.addEventListener('click', dismiss);
        setTimeout(dismiss, duration);
    };

    window.showSuccess = (msg) => showToast(msg, 'success');
    window.showError   = (msg) => showToast(msg, 'error');
    window.showWarning = (msg) => showToast(msg, 'warning');
})();
