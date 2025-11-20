// Toggle mobile menu (head-safe): initializes on DOMContentLoaded and is idempotent
(function () {
    if (window.__pearlSidebarInited) return;
    window.__pearlSidebarInited = true;

    function init() {
        const hamburger = document.querySelector('.hamburger');
        const mobileMenu = document.querySelector('.mobile-menu');
        const mobileClose = document.querySelector('.mobile-close');

        if (!hamburger || !mobileMenu || !mobileClose) return; // nothing to do

        let previouslyFocused = null;

        function openMenu() {
            previouslyFocused = document.activeElement;
            mobileMenu.hidden = false;
            mobileMenu.classList.add('open');
            hamburger.setAttribute('aria-expanded', 'true');
            hamburger.classList.add('open');
            document.body.style.overflow = 'hidden';

            // Move focus into the menu for accessibility
            const focusable = mobileMenu.querySelectorAll('a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])');
            if (focusable.length) focusable[0].focus();
        }

        function closeMenu() {
            mobileMenu.classList.remove('open');
            mobileMenu.hidden = true;
            hamburger.setAttribute('aria-expanded', 'false');
            hamburger.classList.remove('open');
            document.body.style.overflow = '';

            // restore focus
            try { if (previouslyFocused && previouslyFocused.focus) previouslyFocused.focus(); } catch (e) { /* ignore */ }
        }

        function toggleMenu() {
            const expanded = hamburger.getAttribute('aria-expanded') === 'true';
            if (expanded) closeMenu(); else openMenu();
        }

        hamburger.addEventListener('click', toggleMenu);
        mobileClose.addEventListener('click', closeMenu);

        // Close when clicking outside nav area
        mobileMenu.addEventListener('click', (e) => { if (e.target === mobileMenu) closeMenu(); });

        // Close on Escape key
        document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !mobileMenu.hidden) closeMenu(); });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();