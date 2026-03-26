/**
 * main.js - Juego de Burbujas Progresivo (Velocidad + Cantidad)
 * Programador: Christopher Rodríguez Pérez
 * Instituto Tecnológico de Pachuca
 */

(() => {
    const canvas = document.getElementById("canvas-rebote");
    const ctx = canvas.getContext("2d");
    
    const displayNum = document.getElementById("score-num");
    const displayPercent = document.getElementById("score-percent");
    const levelSelector = document.getElementById("level-selector");
    const gameMsg = document.getElementById("game-msg");

    let animationId;
    let circles = [];
    let particles = [];
    let window_width, window_height;

    // Estado del Juego
    let eliminatedInLevel = 0;
    let totalToEliminate = 10; // Cambia según el nivel
    let isLevelActive = false;
    let currentSpeed = 1;

    const mouse = { x: null, y: null };

    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
    });

    // Evento Pointerdown para respuesta inmediata
    canvas.addEventListener('pointerdown', (e) => {
        if (!isLevelActive) return;
        
        const rect = canvas.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;

        for (let i = 0; i < circles.length; i++) {
            const c = circles[i];
            if (!c.isExploding && !c.isDone) {
                const dist = Math.sqrt(Math.pow(clickX - c.posX, 2) + Math.pow(clickY - c.posY, 2));
                if (dist < c.radius + 5) {
                    c.explode();
                    break; 
                }
            }
        }
    });

    class Particle {
        constructor(x, y, color) {
            this.x = x; this.y = y; this.color = color;
            this.radius = Math.random() * 2 + 1;
            this.dx = (Math.random() - 0.5) * 10;
            this.dy = (Math.random() - 0.5) * 10;
            this.alpha = 1;
            this.decay = 0.04;
        }
        update(context) {
            this.x += this.dx; this.y += this.dy;
            this.alpha -= this.decay;
            context.save();
            context.globalAlpha = Math.max(0, this.alpha);
            context.beginPath();
            context.fillStyle = this.color;
            context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            context.fill();
            context.restore();
        }
    }

    class Circle {
        constructor(id, speed) {
            this.id = id;
            this.radius = 20;
            this.color = `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`;
            this.isDone = false;
            this.speed = speed;
            this.resetPos(true);
        }

        resetPos(isInitial = false) {
            this.isExploding = false;
            this.alpha = 1;
            this.posX = Math.random() * (window_width - this.radius * 2) + this.radius;
            // Distribución inicial aleatoria, después siempre desde abajo
            this.posY = isInitial ? Math.random() * window_height : window_height + this.radius + (Math.random() * 200);
            this.dx = (Math.random() - 0.5) * 2.5;
            this.dy = -(Math.random() * this.speed + 1.5);
        }

        explode() {
            this.isExploding = true;
            for (let i = 0; i < 15; i++) {
                particles.push(new Particle(this.posX, this.posY, this.color));
            }
        }

        update(context) {
            if (this.isDone) return;

            if (!this.isExploding) {
                // Hover effect
                let isHover = false;
                if (mouse.x !== null) {
                    const d = Math.sqrt(Math.pow(mouse.x - this.posX, 2) + Math.pow(mouse.y - this.posY, 2));
                    if (d < this.radius) isHover = true;
                }
                this.displayColor = isHover ? "#FFFFFF" : this.color;

                this.posX += this.dx;
                this.posY += this.dy;

                if (this.posY + this.radius < 0) this.resetPos(false);
                if (this.posX + this.radius > window_width || this.posX - this.radius < 0) this.dx = -this.dx;
            } else {
                this.alpha -= 0.15;
                if (this.alpha <= 0) {
                    this.isDone = true;
                    eliminatedInLevel++;
                    updateStats();
                }
            }
            this.draw(context);
        }

        draw(context) {
            context.save();
            context.globalAlpha = Math.max(0, this.alpha);
            context.beginPath();
            context.fillStyle = this.isExploding ? "#FFFFFF" : this.displayColor;
            context.arc(this.posX, this.posY, this.radius, 0, Math.PI * 2);
            context.fill();
            context.strokeStyle = "white";
            context.lineWidth = 2;
            context.stroke();
            context.restore();
        }
    }

    function updateStats() {
        displayNum.innerText = eliminatedInLevel;
        // El porcentaje ahora se basa en el total de círculos del nivel
        let progress = Math.floor((eliminatedInLevel / totalToEliminate) * 100);
        displayPercent.innerText = progress + "%";
        
        if (eliminatedInLevel >= totalToEliminate) {
            isLevelActive = false;
            gameMsg.innerText = "¡Nivel Superado! Sube al siguiente.";
            gameMsg.style.color = "#00ff00";
        }
    }

    function startLevel() {
        if (animationId) cancelAnimationFrame(animationId);
        
        const level = parseInt(levelSelector.value);
        
        // --- NUEVA LÓGICA DE ESCALADO ---
        totalToEliminate = level * 10; // Nivel 1 = 10, Nivel 2 = 20...
        currentSpeed = 1 + (level * 0.7); // La velocidad aumenta con el nivel
        
        eliminatedInLevel = 0;
        isLevelActive = true;
        updateStats();
        
        gameMsg.innerText = `Nivel ${level}: Elimina ${totalToEliminate} burbujas.`;
        gameMsg.style.color = "rgba(255,255,255,0.6)";

        const parent = canvas.parentElement;
        window_width = Math.min(850, parent.clientWidth - 40);
        window_height = Math.min(400, window.innerHeight * 0.45);
        canvas.width = window_width; 
        canvas.height = window_height;
        
        circles = [];
        particles = [];
        // Creamos la cantidad de círculos correspondiente al nivel
        for (let i = 0; i < totalToEliminate; i++) {
            circles.push(new Circle(i, currentSpeed));
        }

        function animate() {
            animationId = requestAnimationFrame(animate);
            ctx.clearRect(0, 0, window_width, window_height);
            circles.forEach(c => c.update(ctx));
            particles = particles.filter(p => {
                p.update(ctx);
                return p.alpha > 0;
            });
        }
        animate();
    }

    document.getElementById("btn-rebote").addEventListener("click", startLevel);
})();