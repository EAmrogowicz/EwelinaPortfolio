document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.querySelector('.menu-toggle');
    const mobileMenu = document.querySelector('.mobile-menu');
    let isMenuOpen = false;

    // Handle menu toggle
    menuToggle.addEventListener('click', (e) => {
        e.preventDefault();
        toggleMenu();
    });

    // Handle escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isMenuOpen) {
            toggleMenu();
        }
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (isMenuOpen && !mobileMenu.contains(e.target) && !menuToggle.contains(e.target)) {
            toggleMenu();
        }
    });

    // Close menu when clicking on a link
    const mobileMenuLinks = document.querySelectorAll('.mobile-menu a');
    mobileMenuLinks.forEach(link => {
        link.addEventListener('click', () => {
            toggleMenu();
        });
    });

    // Toggle menu function
    function toggleMenu() {
        isMenuOpen = !isMenuOpen;
        mobileMenu.classList.toggle('active');
        menuToggle.classList.toggle('active');
        
        // Change menu icon
        const menuIcon = menuToggle.querySelector('i');
        menuIcon.classList.toggle('fa-bars');
        menuIcon.classList.toggle('fa-times');

        // Prevent body scroll when menu is open
        document.body.style.overflow = isMenuOpen ? 'hidden' : '';
    }
});

