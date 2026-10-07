/**
 * TrackDue UI Modal & Notification Component
 */

const ModalComponent = (() => {
    function show(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            const firstInput = modal.querySelector('input:not([type="hidden"]), select, textarea');
            if (firstInput) firstInput.focus();
        }
    }

    function close(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
        }
    }

    function toast(message, type = 'info') {
        const existing = document.getElementById('trackdue-toast');
        if (existing) existing.remove();

        const toastEl = document.createElement('div');
        toastEl.id = 'trackdue-toast';
        toastEl.style.cssText = `
            position: fixed;
            bottom: 24px;
            right: 24px;
            padding: 14px 22px;
            background: ${type === 'error' ? '#ef4444' : type === 'success' ? '#10b981' : '#6366f1'};
            color: #ffffff;
            border-radius: 10px;
            font-size: 14px;
            font-weight: 600;
            box-shadow: 0 10px 25px rgba(0,0,0,0.25);
            z-index: 99999;
            transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
            transform: translateY(20px);
            opacity: 0;
            display: flex;
            align-items: center;
            gap: 10px;
        `;
        toastEl.innerHTML = `<span>${type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}</span><span>${message}</span>`;
        document.body.appendChild(toastEl);

        setTimeout(() => {
            toastEl.style.transform = 'translateY(0)';
            toastEl.style.opacity = '1';
        }, 10);

        setTimeout(() => {
            toastEl.style.opacity = '0';
            toastEl.style.transform = 'translateY(20px)';
            setTimeout(() => toastEl.remove(), 300);
        }, 3500);
    }

    return {
        show,
        close,
        toast
    };
})();

window.ModalComponent = ModalComponent;
