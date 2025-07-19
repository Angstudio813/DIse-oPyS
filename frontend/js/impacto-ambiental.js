// Animación de contadores en el hero
function animateCounters() {
    const counters = document.querySelectorAll('.stat-number');
    
    counters.forEach(counter => {
        const target = parseFloat(counter.textContent);
        const increment = target / 100;
        let current = 0;
        
        const updateCounter = () => {
            if (current < target) {
                current += increment;
                if (counter.id === 'co2Ahorrado') {
                    counter.textContent = current.toFixed(1);
                } else {
                    counter.textContent = Math.floor(current).toLocaleString();
                }
                requestAnimationFrame(updateCounter);
            } else {
                if (counter.id === 'co2Ahorrado') {
                    counter.textContent = target.toFixed(1);
                } else {
                    counter.textContent = target.toLocaleString();
                }
            }
        };
        
        updateCounter();
    });
}

// Animación de aparición de elementos al hacer scroll
function setupScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Elementos a animar
    const elementsToAnimate = document.querySelectorAll(
        '.solucion-card, .diferenciador, .compromiso-item, .impact-list li'
    );
    
    elementsToAnimate.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(element);
    });
}

// Efecto parallax suave para las secciones hero
function setupParallax() {
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const parallaxElements = document.querySelectorAll('.hero, .cta-section');
        
        parallaxElements.forEach(element => {
            const speed = 0.5;
            element.style.transform = `translateY(${scrolled * speed}px)`;
        });
    });
}

// Actualización dinámica de estadísticas
function updateStats() {
    // Simulamos datos que se actualizarían desde el backend
    const stats = {
        co2Ahorrado: 2.5 + (Math.random() * 0.1),
        objetosReutilizados: 1247 + Math.floor(Math.random() * 10),
        residuosEvitados: 850 + Math.floor(Math.random() * 20)
    };
    
    document.getElementById('co2Ahorrado').textContent = stats.co2Ahorrado.toFixed(1);
    document.getElementById('objetosReutilizados').textContent = stats.objetosReutilizados.toLocaleString();
    document.getElementById('residuosEvitados').textContent = stats.residuosEvitados.toLocaleString();
}

// Efecto hover mejorado para las cards
function setupCardEffects() {
    const cards = document.querySelectorAll('.solucion-card, .diferenciador, .compromiso-item');
    
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
}

// Smooth scroll para navegación interna
function setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Lazy loading para imágenes
function setupLazyLoading() {
    const images = document.querySelectorAll('img');
    
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.style.opacity = '0';
                img.style.transition = 'opacity 0.5s ease';
                
                img.onload = () => {
                    img.style.opacity = '1';
                };
                
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

// Función para crear partículas flotantes (efecto visual)
function createFloatingParticles() {
    const hero = document.querySelector('.hero');
    if (!hero) return;
    
    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.style.cssText = `
            position: absolute;
            width: ${Math.random() * 4 + 2}px;
            height: ${Math.random() * 4 + 2}px;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            pointer-events: none;
            animation: float ${Math.random() * 10 + 10}s linear infinite;
            left: ${Math.random() * 100}%;
            top: 100%;
            z-index: 1;
        `;
        hero.appendChild(particle);
    }
    
    // CSS para la animación de partículas
    const style = document.createElement('style');
    style.textContent = `
        @keyframes float {
            0% {
                transform: translateY(0) rotate(0deg);
                opacity: 0;
            }
            10% {
                opacity: 1;
            }
            90% {
                opacity: 1;
            }
            100% {
                transform: translateY(-100vh) rotate(360deg);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}

// Inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    // Retraso para la animación de entrada
    setTimeout(() => {
        animateCounters();
    }, 500);
    
    setupScrollAnimations();
    setupParallax();
    setupCardEffects();
    setupSmoothScroll();
    setupLazyLoading();
    createFloatingParticles();
    
    // Actualizar estadísticas cada 30 segundos
    setInterval(updateStats, 30000);
    
    console.log('🌱 Página de Impacto Ambiental cargada correctamente');
});

// Función para manejar el redimensionamiento de ventana
window.addEventListener('resize', function() {
    // Reajustar efectos si es necesario
    const cards = document.querySelectorAll('.solucion-card, .diferenciador, .compromiso-item');
    cards.forEach(card => {
        card.style.transform = 'translateY(0) scale(1)';
    });
});

// Función para mostrar mensaje de compromiso ambiental
function showEnvironmentalCommitment() {
    const messages = [
        "🌱 Cada acción cuenta para nuestro planeta",
        "♻️ La reutilización es la nueva revolución",
        "🌍 Juntos construimos un futuro sostenible",
        "💚 Tu donación salva al medio ambiente"
    ];
    
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    
    // Crear notificación temporal
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: linear-gradient(135deg, #10b981, #059669);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 12px;
        box-shadow: 0 10px 30px rgba(16, 185, 129, 0.3);
        z-index: 1000;
        font-weight: 600;
        transform: translateX(400px);
        transition: transform 0.3s ease;
    `;
    notification.textContent = randomMessage;
    
    document.body.appendChild(notification);
    
    // Animar entrada
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remover después de 4 segundos
    setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 4000);
}

// Mostrar mensaje cada 2 minutos
setInterval(showEnvironmentalCommitment, 120000);
