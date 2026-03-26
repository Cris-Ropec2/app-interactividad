/**
 * main.js - Juego de Burbujas: Respuesta Inmediata al Clic
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

    let eliminatedInLevel = 0;
    let isLevelActive = false;
    let currentSpeed = 1;

    const mouse = { x: null, y: null };

    // Actualizar posición para el efecto Hover
    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
    });

    // DETECCIÓN INMEDIATA: Usamos pointerdown para evitar retrasos de 300ms en navegadores
    canvas.addEventListener('pointerdown', (e) => {
        if (!isLevelActive) return;
        
        const rect = canvas.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;

        // Comprobamos la colisión de forma directa e inmediata
        for (let i = 0; i < circles.length; i++) {
            const c = circles[i];
            if (!c.isExploding && !c.isDone) {
                const dist = Math.sqrt(Math.pow(clickX - c.posX, 2) + Math.pow(clickY - c.posY, 2));
                
                // Si el clic está dentro del radio (añadimos un margen de 5px para facilitar el toque)
                if (dist < c.radius + 5) {
                    c.explode();
                    break; // Rompemos el ciclo para solo explotar uno a la vez si están encimados
                }
            }
        }
    });

    canvas.addEventListener('mouseleave', () => { mouse.x = null; mouse.y = null; });

    class Particle {
        constructor(x, y, color) {
            this.x = x; this.y = y; this.color = color;
            this.radius = Math.random() * 2 + 1;
            this.dx = (Math.random() - 0.5) * 10;
            this.dy = (Math.random() - 0.5) * 10;
            this.alpha = 1;
            this.decay = 0.04; // Explosión más rápida
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
        constructor(id) {
            this.id = id;
            this.radius = 22; // Un poco más grande para mejor jugabilidad
            this.color = `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`;
            this.isDone = false;
            this.resetPos(true);
        }

        resetPos(isInitial = false) {
            this.isExploding = false;
            this.alpha = 1;
            this.posX = Math.random() * (window_width - this.radius * 2) + this.radius;
            this.posY = isInitial ? (window_height / 1.2) + Math.random() * window_height : window_height + this.radius + 20;
            this.dx = (Math.random() - 0.5) * 3;
            this.dy = -(Math.random() * currentSpeed + 1.2);
        }

        explode() {
            this.isExploding = true;
            // Creamos las partículas inmediatamente
            for (let i = 0; i < 15; i++) {
                particles.push(new Particle(this.posX, this.posY, this.color));
            }
        }

        update(context) {
            if (this.isDone) return;

            if (!this.isExploding) {
                // Lógica de Hover (Cambio de color visual)
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
                // Desvanecimiento acelerado del círculo original
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
        displayPercent.innerText = (eliminatedInLevel * 10) + "%";
        
        if (eliminatedInLevel >= 10) {
            isLevelActive = false;
            gameMsg.innerText = "¡Nivel Completado! Elige el siguiente.";
            gameMsg.style.color = "#00ff00";
        }
    }

    function startLevel() {
        if (animationId) cancelAnimationFrame(animationId);
        
        const level = parseInt(levelSelector.value);
        currentSpeed = level * 1.1; // Velocidad ajustada
        
        eliminatedInLevel = 0;
        isLevelActive = true;
        updateStats();
        
        gameMsg.innerText = `Nivel ${level} - ¡Haz clic en las burbujas!`;
        gameMsg.style.color = "rgba(255,255,255,0.6)";

        const parent = canvas.parentElement;
        window_width = Math.min(850, parent.clientWidth - 40);
        window_height = Math.min(400, window.innerHeight * 0.45);
        canvas.width = window_width; 
        canvas.height = window_height;
        
        circles = [];
        particles = [];
        for (let i = 0; i < 10; i++) {
            circles.push(new Circle(i));
        }

        function animate() {
            animationId = requestAnimationFrame(animate);
            ctx.clearRect(0, 0, window_width, window_height);
            
            // Dibujar círculos
            circles.forEach(c => c.update(ctx));
            
            // Dibujar y limpiar partículas
            particles = particles.filter(p => {
                p.update(ctx);
                return p.alpha > 0;
            });
        }
        animate();
    }

    document.getElementById("btn-rebote").addEventListener("click", startLevel);
})();