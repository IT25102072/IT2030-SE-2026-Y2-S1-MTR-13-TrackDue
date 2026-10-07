/**
 * TrackDue Sidebar Navigation Component
 * Manages active navigation links, role-based views, and sidebar collapsing.
 */

const SidebarComponent = (() => {
    function init(user, activeNav = 'nav-my-day') {
        const isAdmin = user && (
            (user.role || '').toUpperCase() === 'SYSTEM_ADMINISTRATOR' ||
            (user.role || '').toUpperCase() === 'ADMIN' ||
            (user.email || '').toLowerCase() === 'admin@trackdue.com'
        );

        // Toggle admin section visibility
        const adminSection = document.getElementById('admin-sidebar-section');
        if (adminSection) {
            adminSection.style.display = isAdmin ? 'block' : 'none';
        }

        // Setup active indicator
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            if (item.id === activeNav) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }

    return {
        init
    };
})();

window.SidebarComponent = SidebarComponent;
