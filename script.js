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
        if (!this.track) return;

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
            this.track.innerHTML = '<div style="color:white; text-align:center; padding:2rem;">Unable to load products. Is the server running?</div>';
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

/**
 * Registration Form Controller
 * Handles form submission to the backend API.
 */
class RegistrationForm {
    constructor(formSelector) {
        this.form = document.querySelector(formSelector);
        this.apiUrl = 'http://127.0.0.1:8000/api/leads';

        if (this.form) {
            this.init();
        }
    }

    init() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    async handleSubmit(e) {
        e.preventDefault();

        const submitBtn = this.form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;

        // Gather data
        const formData = {
            name: this.form.querySelector('input[type="text"]').value,
            email: this.form.querySelector('input[type="email"]').value,
            phone: this.form.querySelector('input[type="tel"]').value,
            source: 'website',
            status: 'new'
        };

        try {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Sending...';

            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Submission failed');
            }

            alert('Thank you! Your details have been saved.');
            this.form.reset();
        } catch (error) {
            console.error('Submission error:', error);
            alert('Error: ' + error.message + '\n\nPlease ensure the backend server is running.');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    }
}

/**
 * Admin Dashboard Controller
 * Fetches and manages leads.
 */
class AdminDashboard {
    constructor(tableId) {
        this.table = document.getElementById(tableId);
        this.tbody = this.table ? this.table.querySelector('tbody') : null;
        this.apiUrl = 'http://127.0.0.1:8000/api/leads';

        if (this.tbody) {
            this.init();
        }
    }

    async init() {
        await this.fetchLeads();
    }

    async fetchLeads() {
        try {
            const response = await fetch(this.apiUrl);
            const leads = await response.json();
            this.renderLeads(leads);
        } catch (error) {
            console.error('Error fetching leads:', error);
            this.tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding: 2rem; color: #ef4444;">Error loading leads. Ensure backend is running.</td></tr>';
        }
    }

    renderLeads(leads) {
        this.tbody.innerHTML = '';

        // Sort by date desc (newest first)
        leads.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        leads.forEach(lead => {
            const tr = document.createElement('tr');
            const date = new Date(lead.createdAt).toLocaleDateString();

            tr.innerHTML = `
                <td>${date}</td>
                <td><strong>${lead.name}</strong></td>
                <td>${lead.email}</td>
                <td>${lead.phone}</td>
                <td><span class="status-badge status-${lead.status}">${lead.status}</span></td>
                <td></td>
            `;

            // Create select element for actions
            const select = document.createElement('select');
            select.className = 'status-select';
            select.innerHTML = `
                <option value="new" ${lead.status === 'new' ? 'selected' : ''}>New</option>
                <option value="contacted" ${lead.status === 'contacted' ? 'selected' : ''}>Contacted</option>
                <option value="converted" ${lead.status === 'converted' ? 'selected' : ''}>Converted</option>
                <option value="closed" ${lead.status === 'closed' ? 'selected' : ''}>Closed</option>
            `;
            select.addEventListener('change', async (e) => {
                const success = await this.updateStatus(lead.id, e.target.value);
                if (success) this.fetchLeads(); // Refresh table to update badge color
            });

            tr.lastElementChild.appendChild(select);
            this.tbody.appendChild(tr);
        });
    }

    async updateStatus(id, newStatus) {
        try {
            const response = await fetch(`${this.apiUrl}/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });

            if (!response.ok) throw new Error('Failed to update');
            return true;
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Error updating status');
            return false;
        }
    }
}

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
    new Navbar('navbar');
    new MobileMenu();
    // Carousel is initialized inside ProductManager after data fetch
    new ProductManager('gallery-carousel').init();
    new LanguageManager();
    new RegistrationForm('.registration-form');
    new AdminDashboard('leads-table');
});