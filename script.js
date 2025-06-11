document.addEventListener('DOMContentLoaded', () => {

    // --- INICIALIZACIÓN DE SWIPERS ---
    const heroSwiper = new Swiper('.hero-swiper', {
        loop: true,
        // effect: 'fade',
        // fadeEffect: {
        //     crossFade: true
        // },
        autoplay: {
            delay: 2000,
            disableOnInteraction: false,
        },
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
        },
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
    });

    const initProductSwiper = (sectionId) => {
        new Swiper(`${sectionId} .product-swiper`, {
            spaceBetween: 16,
            loop: true, 
            navigation: {
                nextEl: `${sectionId} .next`,
                prevEl: `${sectionId} .prev`,
            },
            pagination: {
            el: `${sectionId} .swiper-pagination`,
            clickable: true,
            },
            // Responsive Breakpoints para el carrusel de productos
            breakpoints: {
                320: { slidesPerView: 1, spaceBetween: 10 },
                768: { slidesPerView: 2, spaceBetween: 20 },
                1024: { slidesPerView: 'auto', spaceBetween: 24 }
            }
        });
    };
    

    if (document.getElementById('recomendados-section')) {
        initProductSwiper('#recomendados-section');
    }
    if (document.getElementById('promociones-section')) {
        initProductSwiper('#promociones-section');
    }


    // --- LÓGICA DEL ACORDEÓN DEL FOOTER ---
    const accordionItems = document.querySelectorAll('.footer-column.accordion-item');
    accordionItems.forEach(item => {
        const header = item.querySelector('.accordion-header');
        if (header) {
            header.addEventListener('click', () => {
                item.classList.toggle('is-open');
            });
        }
    });


    // --- LÓGICA PARA EL BOTÓN DE FAVORITOS ---
    const favoriteButtons = document.querySelectorAll('.favorite-btn');
    favoriteButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const icon = button.querySelector('i');
            icon.classList.toggle('far'); // Corazón vacío
            icon.classList.toggle('fas'); // Corazón lleno
        });
    });


    // --- LÓGICA PARA EL BOTÓN DE VOLVER ARRIBA ---
    const backToTopButton = document.getElementById('back-to-top');
    if (backToTopButton) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                backToTopButton.classList.add('visible');
            } else {
                backToTopButton.classList.remove('visible');
            }
        });

        backToTopButton.addEventListener('click', (event) => {
            event.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
      // --- EFECTO NAVBAR TRANSPARENTE ---
    const navbar = document.querySelector('.navbar');
    
    // Aplicar la clase transparente inmediatamente al cargar
    navbar.classList.add('navbar-transparent');
    
    // Función para manejar la transparencia del navbar
    function handleNavbarTransparency() {
        if (window.scrollY < 50) {
            navbar.classList.add('navbar-transparent');
        } else {
            navbar.classList.remove('navbar-transparent');
        }
    }
    
    // Escuchar el evento scroll
    window.addEventListener('scroll', handleNavbarTransparency);

});