document.addEventListener('DOMContentLoaded', () => {

    // --- Mobile Menu Toggle ---
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }

    // --- Active Nav Link Logic ---
    // Sets the 'active' class on the correct nav link based on the current page URL.
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(link => {
        const linkPage = link.getAttribute('href');
        if (linkPage === currentPage) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    // --- Aircraft Details Page: Image Gallery & 3D Viewer ---
    const mainImage = document.getElementById('main-jet-image');
    const thumbnails = document.querySelectorAll('.thumbnail-image');
    const viewer3D = document.getElementById('3d-viewer');
    const thumb3D = document.querySelector('.thumbnail-3d');

    if (mainImage) {
        thumbnails.forEach(thumb => {
            thumb.addEventListener('click', () => {
                // Update main image
                mainImage.src = thumb.src;
                mainImage.style.display = 'block';
                if(viewer3D) viewer3D.classList.add('hidden');
                
                // Update active border
                document.querySelectorAll('.thumbnail-image, .thumbnail-3d').forEach(t => t.classList.remove('sunlit-gold-border'));
                thumb.classList.add('sunlit-gold-border');
            });
        });
    }

    if (thumb3D) {
        thumb3D.addEventListener('click', () => {
             if(viewer3D) {
                viewer3D.classList.remove('hidden');
                mainImage.style.display = 'none';

                // Update active border
                document.querySelectorAll('.thumbnail-image, .thumbnail-3d').forEach(t => t.classList.remove('sunlit-gold-border'));
                thumb3D.classList.add('sunlit-gold-border');
             }
        });
    }
});
