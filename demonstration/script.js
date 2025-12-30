/**
 * Light Church - Platform for Pastors
 * Interactive JavaScript for Landing Page
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
// SMOOTH SCROLL FOR ANCHORS
// ===================================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));

        if (target) {
            const offsetTop = target.offsetTop - 80;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// ===================================
// INTERSECTION OBSERVER FOR FEATURE CARDS
// ===================================

const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
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
// CTA BUTTON HANDLERS
// ===================================

const ctaButtons = document.querySelectorAll('.btn-cta-primary, .btn-cta-large, .btn-primary, .btn-revival');

ctaButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
        // Prevent default if it's a button
        if (btn.tagName === 'BUTTON') {
            e.preventDefault();
        }

        // Show modal or redirect
        showDemoModal();
    });
});

// Demo modal function
function showDemoModal() {
    // Create modal overlay
    const modal = document.createElement('div');
    modal.className = 'demo-modal';
    modal.innerHTML = `
        <div class="modal-overlay"></div>
        <div class="modal-content">
            <button class="modal-close">&times;</button>
            <div class="modal-header">
                <div class="modal-icon">✨</div>
                <h3>Créez votre profil d'église gratuitement</h3>
                <p>Rejoignez des milliers de pasteurs qui utilisent Light Church</p>
            </div>
            <form class="demo-form" id="demoForm">
                <div class="form-group">
                    <label>Nom de l'église *</label>
                    <input type="text" placeholder="Ex: Église Évangélique de Paris" required>
                </div>
                <div class="form-group">
                    <label>Votre nom *</label>
                    <input type="text" placeholder="Ex: Pasteur Jean Martin" required>
                </div>
                <div class="form-group">
                    <label>Email *</label>
                    <input type="email" placeholder="votre@email.com" required>
                </div>
                <div class="form-group">
                    <label>Téléphone</label>
                    <input type="tel" placeholder="06 12 34 56 78">
                </div>
                <div class="form-group">
                    <label>Ville *</label>
                    <input type="text" placeholder="Ex: Paris" required>
                </div>
                <button type="submit" class="btn-submit">
                    Créer mon profil gratuitement
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                </button>
                <p class="form-note">✓ 100% gratuit · Aucune carte requise · Confirmation immédiate</p>
            </form>
        </div>
    `;

    // Add styles
    const style = document.createElement('style');
    style.textContent = `
        .demo-modal {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }

        .modal-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.7);
            backdrop-filter: blur(5px);
        }

        .modal-content {
            position: relative;
            background: white;
            border-radius: 20px;
            max-width: 500px;
            width: 100%;
            max-height: 90vh;
            overflow-y: auto;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            animation: slideUp 0.3s ease;
        }

        @keyframes slideUp {
            from {
                transform: translateY(30px);
                opacity: 0;
            }
            to {
                transform: translateY(0);
                opacity: 1;
            }
        }

        .modal-close {
            position: absolute;
            top: 20px;
            right: 20px;
            background: none;
            border: none;
            font-size: 32px;
            color: #999;
            cursor: pointer;
            transition: color 0.3s;
            z-index: 1;
        }

        .modal-close:hover {
            color: #333;
        }

        .modal-header {
            text-align: center;
            padding: 50px 40px 30px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border-radius: 20px 20px 0 0;
        }

        .modal-icon {
            font-size: 48px;
            margin-bottom: 16px;
        }

        .modal-header h3 {
            font-size: 28px;
            font-weight: 800;
            margin-bottom: 12px;
        }

        .modal-header p {
            font-size: 16px;
            opacity: 0.9;
        }

        .demo-form {
            padding: 40px;
        }

        .form-group {
            margin-bottom: 24px;
        }

        .form-group label {
            display: block;
            font-weight: 600;
            margin-bottom: 8px;
            color: #333;
            font-size: 14px;
        }

        .form-group input {
            width: 100%;
            padding: 14px 16px;
            border: 2px solid #e0e0e0;
            border-radius: 8px;
            font-size: 16px;
            transition: all 0.3s;
            font-family: inherit;
        }

        .form-group input:focus {
            outline: none;
            border-color: #667eea;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .btn-submit {
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            padding: 16px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 10px;
            font-size: 16px;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.3s;
            margin-bottom: 16px;
        }

        .btn-submit:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
        }

        .form-note {
            text-align: center;
            font-size: 13px;
            color: #666;
        }

        @media (max-width: 600px) {
            .modal-content {
                margin: 0;
                max-height: 100vh;
                border-radius: 0;
            }
            .demo-form {
                padding: 30px 20px;
            }
        }
    `;

    document.head.appendChild(style);
    document.body.appendChild(modal);

    // Close modal on overlay click
    modal.querySelector('.modal-overlay').addEventListener('click', () => {
        modal.remove();
    });

    // Close modal on close button click
    modal.querySelector('.modal-close').addEventListener('click', () => {
        modal.remove();
    });

    // Handle form submission
    modal.querySelector('#demoForm').addEventListener('submit', (e) => {
        e.preventDefault();

        // Get form data
        const formData = new FormData(e.target);

        // Show success message
        modal.querySelector('.modal-content').innerHTML = `
            <div class="success-message" style="padding: 80px 40px; text-align: center;">
                <div style="font-size: 80px; margin-bottom: 24px;">🎉</div>
                <h3 style="font-size: 32px; font-weight: 800; margin-bottom: 16px; color: #333;">
                    Merci pour votre inscription!
                </h3>
                <p style="font-size: 18px; color: #666; margin-bottom: 32px;">
                    Vous allez recevoir un email avec les instructions pour accéder à votre dashboard.
                </p>
                <button onclick="this.closest('.demo-modal').remove()" style="
                    padding: 14px 32px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                    font-size: 16px;
                ">
                    Fermer
                </button>
            </div>
        `;

        // In a real app, you would send this to your backend
        console.log('Form submitted:', Object.fromEntries(formData));
    });

    // Focus first input
    setTimeout(() => {
        modal.querySelector('input').focus();
    }, 300);
}

// ===================================
// VIDEO DEMO BUTTON
// ===================================

document.querySelectorAll('.btn-cta-secondary').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        showVideoDemo();
    });
});

function showVideoDemo() {
    const videoModal = document.createElement('div');
    videoModal.className = 'video-modal';
    videoModal.innerHTML = `
        <div class="modal-overlay"></div>
        <div class="video-container">
            <button class="modal-close">&times;</button>
            <div class="video-wrapper">
                <div class="video-placeholder">
                    <div class="play-icon">▶</div>
                    <h3>Démo de la plateforme Light Church</h3>
                    <p>Découvrez comment gérer votre église en 5 minutes</p>
                    <p style="margin-top: 20px; font-size: 14px; color: #999;">
                        (Vidéo de démonstration à venir)
                    </p>
                </div>
            </div>
        </div>
    `;

    const style = document.createElement('style');
    style.textContent = `
        .video-modal {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            animation: fadeIn 0.3s ease;
        }

        .video-container {
            position: relative;
            max-width: 900px;
            width: 100%;
        }

        .video-wrapper {
            position: relative;
            padding-bottom: 56.25%;
            background: #000;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
        }

        .video-placeholder {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }

        .play-icon {
            width: 80px;
            height: 80px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 32px;
            margin-bottom: 24px;
            backdrop-filter: blur(10px);
        }

        .video-placeholder h3 {
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 12px;
        }

        .video-placeholder p {
            font-size: 16px;
            opacity: 0.9;
        }
    `;

    document.head.appendChild(style);
    document.body.appendChild(videoModal);

    videoModal.querySelector('.modal-overlay').addEventListener('click', () => {
        videoModal.remove();
    });

    videoModal.querySelector('.modal-close').addEventListener('click', () => {
        videoModal.remove();
    });
}

// ===================================
// ANIMATED COUNTERS IN STATS
// ===================================

const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const statNumber = entry.target.querySelector('.mini-stat-value');
            const target = parseInt(statNumber.textContent);
            animateCounter(statNumber, 0, target, 2000);
            statsObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

document.querySelectorAll('.mini-stat').forEach(stat => {
    statsObserver.observe(stat);
});

function animateCounter(element, start, end, duration) {
    const range = end - start;
    const increment = range / (duration / 16);
    let current = start;

    const timer = setInterval(() => {
        current += increment;
        if (current >= end) {
            element.textContent = end;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current);
        }
    }, 16);
}

// ===================================
// MOBILE MENU
// ===================================

function createMobileMenu() {
    const navContent = document.querySelector('.nav-content');
    const navLinks = document.querySelector('.nav-links');

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
        gap: 5px;
        background: none;
        border: none;
        cursor: pointer;
        padding: 8px;
    `;

    const spans = menuButton.querySelectorAll('span');
    spans.forEach(span => {
        span.style.cssText = `
            width: 26px;
            height: 3px;
            background: var(--dark);
            border-radius: 2px;
            transition: all 0.3s ease;
        `;
    });

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
                padding: 24px;
                box-shadow: 0 12px 40px rgba(0,0,0,0.15);
                transform: translateY(-120%);
                opacity: 0;
                pointer-events: none;
                transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            }
            .nav-links.active {
                transform: translateY(0);
                opacity: 1;
                pointer-events: all;
            }
            .nav-links a {
                padding: 12px 0;
                border-bottom: 1px solid #f0f0f0;
            }
        }
    `;
    document.head.appendChild(style);

    menuButton.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        menuButton.classList.toggle('active');

        if (menuButton.classList.contains('active')) {
            spans[0].style.transform = 'rotate(45deg) translate(6px, 6px)';
            spans[1].style.opacity = '0';
            spans[2].style.transform = 'rotate(-45deg) translate(6px, -6px)';
        } else {
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        }
    });

    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            menuButton.classList.remove('active');
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        });
    });

    const primaryBtn = navContent.querySelector('.btn-primary');
    navContent.insertBefore(menuButton, primaryBtn);
}

createMobileMenu();

// ===================================
// SCROLL REVEAL ANIMATIONS
// ===================================

const revealElements = document.querySelectorAll('.problem-card, .impact-card, .step-item, .need-point, .revival-point');

const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
            setTimeout(() => {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }, index * 100);
            revealObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

revealElements.forEach(element => {
    element.style.opacity = '0';
    element.style.transform = 'translateY(30px)';
    element.style.transition = 'all 0.6s ease';
    revealObserver.observe(element);
});

// ===================================
// CONSOLE BRANDING
// ===================================

console.log('%c🙏 Light Church - Plateforme pour Pasteurs', 'font-size: 20px; font-weight: bold; color: #667eea;');
console.log('%cParticipez au réveil spirituel avec la technologie', 'font-size: 14px; color: #764ba2;');
console.log('%c✨ Built with ❤️ for church leaders', 'font-size: 12px; color: #999;');

// ===================================
// PAGE LOAD ANIMATION
// ===================================

window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease';
        document.body.style.opacity = '1';
    }, 100);
});

// ===================================
// SCREENSHOT SLIDER NAVIGATION
// ===================================

const screenshotTabs = document.querySelectorAll('.screenshot-tab');
const screenshotSlides = document.querySelectorAll('.screenshot-slide');

if (screenshotTabs.length > 0 && screenshotSlides.length > 0) {
    screenshotTabs.forEach((tab, index) => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs and slides
            screenshotTabs.forEach(t => t.classList.remove('active'));
            screenshotSlides.forEach(s => s.classList.remove('active'));

            // Add active class to clicked tab and corresponding slide
            tab.classList.add('active');
            screenshotSlides[index].classList.add('active');
        });
    });
}
