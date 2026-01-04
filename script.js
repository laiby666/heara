/**
 * UI Component Base Class
 * Establishes a pattern for modular UI elements.
 */
class UIComponent {
    constructor(elementId) {
        this.element = document.getElementById(elementId);
        if (this.element) this.init();
    }
    init() { console.warn('Init method not implemented'); }
}

/**
 * Navbar Controller
 * Handles scroll effects for the glassmorphism header.
 */
class Navbar extends UIComponent {
    init() {
        window.addEventListener('scroll', () => this.handleScroll());
    }

    handleScroll() {
        if (window.scrollY > 50) {
            this.element.classList.add('glass-nav');
        } else {
            this.element.classList.remove('glass-nav');
        }
    }
}

/**
 * Mobile Menu Controller
 */
class MobileMenu {
    constructor() {
        this.toggle = document.getElementById('mobile-toggle');
        this.menu = document.getElementById('mobile-menu');
        this.links = document.querySelectorAll('.mobile-nav-links a');

        if (this.toggle && this.menu) {
            this.init();
        }
    }

    init() {
        this.toggle.addEventListener('click', () => {
            this.toggle.classList.toggle('active');
            this.menu.classList.toggle('active');
            document.body.classList.toggle('no-scroll');
        });

        // Close menu when clicking a link
        this.links.forEach(link => {
            link.addEventListener('click', () => {
                this.toggle.classList.remove('active');
                this.menu.classList.remove('active');
                document.body.classList.remove('no-scroll');
            });
        });
    }
}

/**
 * Carousel Component
 * Handles image sliding logic.
 */
class Carousel extends UIComponent {
    init() {
        this.track = this.element.querySelector('.carousel-track');
        this.slides = Array.from(this.track.children);
        this.nextBtn = this.element.querySelector('.next');
        this.prevBtn = this.element.querySelector('.prev');
        this.currentIndex = 0;

        // Remove existing event listeners to prevent duplicates if re-initialized
        const newNextBtn = this.nextBtn.cloneNode(true);
        const newPrevBtn = this.prevBtn.cloneNode(true);
        this.nextBtn.parentNode.replaceChild(newNextBtn, this.nextBtn);
        this.prevBtn.parentNode.replaceChild(newPrevBtn, this.prevBtn);
        this.nextBtn = newNextBtn;
        this.prevBtn = newPrevBtn;

        if (this.nextBtn && this.prevBtn) {
            this.nextBtn.addEventListener('click', () => this.moveSlide(1));
            this.prevBtn.addEventListener('click', () => this.moveSlide(-1));
        }
    }

    moveSlide(direction) {
        if (this.slides.length === 0) return;
        this.currentIndex = (this.currentIndex + direction + this.slides.length) % this.slides.length;
        // For LTR/RTL agnostic sliding, we simply translate X by percentage
        const amount = this.currentIndex * -100;
        this.track.style.transform = `translateX(${amount}%)`;
    }
}

/**
 * Product Manager
 * Fetches products from API and renders them into the carousel.
 */
class ProductManager {
    constructor(carouselId) {
        this.carouselId = carouselId;
        this.track = document.querySelector(`#${carouselId} .carousel-track`);
        this.apiUrl = 'http://127.0.0.1:8000/api/products';
    }

    async init() {
        try {
            const response = await fetch(this.apiUrl);
            const products = await response.json();

            this.track.innerHTML = ''; // Clear placeholder

            products.forEach(product => {
                const slide = document.createElement('div');
                slide.className = 'carousel-slide';
                slide.innerHTML = `
                    <img src="${product.imageUrl}" alt="${product.name}">
                    <div class="slide-caption">
                        ${product.name}
                        <span style="margin: 0 0.5rem; color: var(--brand-gold);">$${product.price}</span>
                    </div>
                `;
                this.track.appendChild(slide);
            });

            // Initialize Carousel logic after DOM is populated
            new Carousel(this.carouselId);
        } catch (error) {
            console.error('Error loading products:', error);
            this.track.innerHTML = '<div style="color:white; text-align:center; padding:2rem;">Unable to load products</div>';
        }
    }
}

/**
 * Language Manager
 * Handles translations and RTL/LTR switching.
 */
class LanguageManager {
    constructor() {
        this.currentLang = 'en';
        this.toggleBtns = document.querySelectorAll('.lang-toggle');
        this.translations = {
            en: {
                nav_product: "Siman 3",
                nav_tech: "Technology",
                nav_specs: "Specifications",
                nav_preorder: "Pre-Order",
                hero_label: "The New Standard",
                hero_title: "Control Light.<br />Master Atmosphere.",
                hero_desc: "The Siman 3 Triple Circuit Switch. Precision intensity and temperature control in a singular, architectural interface.",
                hero_btn_discover: "Discover Siman 3",
                hero_btn_watch: "Watch Film",
                lang_btn: "HE",
                gallery_title: "Moods & Atmospheres",
                gallery_subtitle: "Experience the spectrum of light.",
                slide_1_caption: "Romantic Evening",
                slide_2_caption: "Morning Clarity",
                slide_3_caption: "Deep Relaxation",
                gallery_quote: "\"Light is the fourth dimension of architecture.\"",
                gallery_desc: "Seamlessly transition between scenes. Our API-driven presets allow you to curate your environment with a single touch.",
                footer_title: "Stay Illuminated",
                footer_desc: "Join the waitlist for exclusive updates.",
                footer_name: "Full Name",
                footer_email: "Email Address",
                footer_phone: "Phone Number",
                footer_btn: "Subscribe"
            },
            he: {
                nav_product: "סימן 3",
                nav_tech: "טכנולוגיה",
                nav_specs: "מפרט טכני",
                nav_preorder: "הזמנה מוקדמת",
                hero_label: "הסטנדרט החדש",
                hero_title: "לשלוט באור.<br />לנהל את האווירה.",
                hero_desc: "מתג המעגל המשולש סימן 3. שליטה מדויקת בעוצמה ובטמפרטורה בממשק אדריכלי יחיד.",
                hero_btn_discover: "גלה את סימן 3",
                hero_btn_watch: "צפה בסרטון",
                lang_btn: "EN",
                gallery_title: "מצבי רוח ואווירה",
                gallery_subtitle: "חווה את כל ספקטרום האור.",
                slide_1_caption: "ערב רומנטי",
                slide_2_caption: "צלילות של בוקר",
                slide_3_caption: "רגיעה עמוקה",
                gallery_quote: "\"אור הוא המימד הרביעי של הארכיטקטורה.\"",
                gallery_desc: "עבור בצורה חלקה בין סצנות. ההגדרות החכמות שלנו מאפשרות לך לעצב את הסביבה שלך בנגיעה אחת.",
                footer_title: "הישאר מואר",
                footer_desc: "הצטרף לרשימת ההמתנה לעדכונים בלעדיים.",
                footer_name: "שם מלא",
                footer_email: "כתובת מייל",
                footer_phone: "מספר טלפון",
                footer_btn: "הרשמה"
            }
        };

        if (this.toggleBtns.length > 0) {
            this.toggleBtns.forEach(btn => {
                btn.addEventListener('click', () => this.toggleLanguage());
            });
        }
    }

    toggleLanguage() {
        this.currentLang = this.currentLang === 'en' ? 'he' : 'en';
        document.documentElement.dir = this.currentLang === 'he' ? 'rtl' : 'ltr';
        document.documentElement.lang = this.currentLang;

        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (this.translations[this.currentLang][key]) {
                if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                    el.placeholder = this.translations[this.currentLang][key];
                } else {
                    el.innerHTML = this.translations[this.currentLang][key];
                }
            }
        });

        this.toggleBtns.forEach(btn => {
            btn.textContent = this.translations[this.currentLang].lang_btn;
        });
    }
}

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
    new Navbar('navbar');
    new MobileMenu();
    // Carousel is initialized inside ProductManager after data fetch
    new ProductManager('gallery-carousel').init();
    new LanguageManager();
});