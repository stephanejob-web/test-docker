/**
 * Light Church Website - Interactive JavaScript
 * Professional landing page with smooth animations
 */

// ===================================
// NAVBAR SCROLL EFFECT
// ===================================

const navbar = document.querySelector('.navbar');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    // Add shadow when scrolled
    if (currentScroll > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }

    lastScroll = currentScroll;
});

// ===================================
// SMOOTH SCROLL FOR NAVIGATION
// ===================================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));

        if (target) {
            const offsetTop = target.offsetTop - 80; // Account for fixed navbar
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// ===================================
// INTERSECTION OBSERVER FOR ANIMATIONS
// ===================================

const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
            // Stagger animation delay
            setTimeout(() => {
                entry.target.classList.add('animated');
            }, index * 100);
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe all feature cards
document.querySelectorAll('.feature-card[data-animate]').forEach(card => {
    observer.observe(card);
});

// ===================================
// PARALLAX EFFECT FOR HERO MOCKUP
// ===================================

const heroMockup = document.querySelector('.mockup-container');
const heroSection = document.querySelector('.hero');

if (heroMockup && heroSection) {
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const heroHeight = heroSection.offsetHeight;

        // Only apply parallax while hero is visible
        if (scrolled < heroHeight) {
            const parallaxSpeed = 0.3;
            const yPos = scrolled * parallaxSpeed;
            heroMockup.style.transform = `translateY(${yPos}px)`;
        }
    });
}

// ===================================
// STATISTICS COUNTER ANIMATION
// ===================================

const stats = document.querySelectorAll('.stat-number');
let hasAnimated = false;

const animateStats = () => {
    if (hasAnimated) return;

    const heroPosition = document.querySelector('.hero-stats').getBoundingClientRect().top;
    const screenPosition = window.innerHeight;

    if (heroPosition < screenPosition) {
        stats.forEach(stat => {
            const target = stat.textContent;
            const isNumber = !isNaN(target.replace('+', '').replace('%', ''));

            if (isNumber) {
                const number = parseInt(target.replace(/[^0-9]/g, ''));
                const suffix = target.replace(/[0-9]/g, '');
                let current = 0;
                const increment = number / 50; // 50 steps
                const duration = 1500; // 1.5 seconds
                const stepTime = duration / 50;

                const counter = setInterval(() => {
                    current += increment;
                    if (current >= number) {
                        stat.textContent = number + suffix;
                        clearInterval(counter);
                    } else {
                        stat.textContent = Math.ceil(current) + suffix;
                    }
                }, stepTime);
            }
        });

        hasAnimated = true;
    }
};

window.addEventListener('scroll', animateStats);
window.addEventListener('load', animateStats);

// ===================================
// DOWNLOAD BUTTONS CLICK HANDLERS
// ===================================

const iosButtons = document.querySelectorAll('.btn-ios');
const androidButtons = document.querySelectorAll('.btn-android');

iosButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        // TODO: Replace with actual App Store link
        console.log('Redirecting to App Store...');
        alert('L\'application sera bientôt disponible sur l\'App Store!');
        // window.location.href = 'https://apps.apple.com/...';
    });
});

androidButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        // TODO: Replace with actual Google Play link
        console.log('Redirecting to Google Play...');
        alert('L\'application sera bientôt disponible sur Google Play!');
        // window.location.href = 'https://play.google.com/store/apps/...';
    });
});

// ===================================
// MOBILE MENU TOGGLE
// ===================================

// Create mobile menu button
const createMobileMenu = () => {
    const navContent = document.querySelector('.nav-content');
    const navLinks = document.querySelector('.nav-links');

    // Create hamburger button
    const menuButton = document.createElement('button');
    menuButton.className = 'mobile-menu-btn';
    menuButton.innerHTML = `
        <span></span>
        <span></span>
        <span></span>
    `;
    menuButton.style.cssText = `
        display: none;
        flex-direction: column;
        gap: 4px;
        background: none;
        border: none;
        cursor: pointer;
        padding: 8px;
    `;

    const spans = menuButton.querySelectorAll('span');
    spans.forEach(span => {
        span.style.cssText = `
            width: 24px;
            height: 3px;
            background: var(--dark);
            border-radius: 2px;
            transition: all 0.3s ease;
        `;
    });

    // Show on mobile
    const style = document.createElement('style');
    style.textContent = `
        @media (max-width: 768px) {
            .mobile-menu-btn {
                display: flex !important;
            }
            .nav-links {
                position: fixed;
                top: 72px;
                left: 0;
                right: 0;
                background: white;
                flex-direction: column;
                padding: 20px;
                box-shadow: var(--shadow-lg);
                transform: translateY(-100%);
                opacity: 0;
                pointer-events: none;
                transition: all 0.3s ease;
            }
            .nav-links.active {
                transform: translateY(0);
                opacity: 1;
                pointer-events: all;
            }
        }
    `;
    document.head.appendChild(style);

    // Toggle menu
    menuButton.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        menuButton.classList.toggle('active');

        if (menuButton.classList.contains('active')) {
            spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
            spans[1].style.opacity = '0';
            spans[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
        } else {
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        }
    });

    // Close menu when link clicked
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            menuButton.classList.remove('active');
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        });
    });

    // Insert before primary button
    const primaryBtn = navContent.querySelector('.btn-primary');
    navContent.insertBefore(menuButton, primaryBtn);
};

createMobileMenu();

// ===================================
// SCREENSHOTS SLIDER AUTO-SCROLL
// ===================================

const screenshotsSlider = document.querySelector('.screenshots-slider');
let isScrolling = false;

if (screenshotsSlider) {
    // Auto-scroll on hover (desktop only)
    screenshotsSlider.addEventListener('mouseenter', () => {
        if (window.innerWidth > 768) {
            isScrolling = true;
            autoScroll();
        }
    });

    screenshotsSlider.addEventListener('mouseleave', () => {
        isScrolling = false;
    });

    function autoScroll() {
        if (!isScrolling) return;

        screenshotsSlider.scrollLeft += 1;

        // Reset to start when reaching end
        if (screenshotsSlider.scrollLeft >= screenshotsSlider.scrollWidth - screenshotsSlider.clientWidth) {
            screenshotsSlider.scrollLeft = 0;
        }

        requestAnimationFrame(autoScroll);
    }
}

// ===================================
// FADE IN ON SCROLL ANIMATIONS
// ===================================

const fadeElements = document.querySelectorAll('.problem-card, .benefit-item, .screenshot-item');

const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            fadeObserver.unobserve(entry.target);
        }
    });
}, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
});

fadeElements.forEach((element, index) => {
    element.style.opacity = '0';
    element.style.transform = 'translateY(30px)';
    element.style.transition = `all 0.6s ease ${index * 0.1}s`;
    fadeObserver.observe(element);
});

// ===================================
// PRELOADER (OPTIONAL)
// ===================================

window.addEventListener('load', () => {
    document.body.classList.add('loaded');

    // Trigger initial animations
    setTimeout(() => {
        animateStats();
    }, 500);
});

// ===================================
// CONSOLE LOG
// ===================================

console.log('%c🙏 Light Church Website', 'font-size: 20px; font-weight: bold; color: #4285F4;');
console.log('%cBuilt with ❤️ using Vanilla JavaScript', 'font-size: 12px; color: #5F6368;');
console.log('%cPerformance: 60 FPS | Modern Design | Fully Responsive', 'font-size: 12px; color: #34A853;');

// ===================================
// EASTER EGG - KONAMI CODE
// ===================================

let konamiCode = [];
const konamiSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

document.addEventListener('keydown', (e) => {
    konamiCode.push(e.key);
    konamiCode.splice(-konamiSequence.length - 1, konamiCode.length - konamiSequence.length);

    if (konamiCode.join('').includes(konamiSequence.join(''))) {
        // Easter egg triggered!
        document.body.style.transform = 'rotate(360deg)';
        document.body.style.transition = 'transform 2s ease';

        setTimeout(() => {
            document.body.style.transform = 'none';
            alert('🎉 Easter Egg trouvé! Light Church vous remercie! 🙏');
        }, 2000);

        konamiCode = [];
    }
});
