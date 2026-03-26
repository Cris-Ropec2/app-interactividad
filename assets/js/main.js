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
    let totalToEliminate = 10; 
    let isLevelActive = false;
    let currentSpeed = 0.5;

    const mouse = { x: null, y: null };

    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
    });

    canvas.addEventListener('pointerdown', (e) => {
        if (!isLevelActive) return;
        const rect = canvas.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;

        for (let i = 0; i < circles.length; i++) {
            const c = circles[i];
            if (!c.isExploding && !c.isDone) {
                const dist = Math.sqrt(Math.pow(clickX - c.posX, 2) + Math.pow(clickY - c.posY, 2));
                if (dist < c.radius + 8) {
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
            this.dx = (Math.random() - 0.5) * 8;
            this.dy = (Math.random() - 0.5) * 8;
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
            this.resetPos(); // Siempre inicia desde abajo
        }

        resetPos() {
            this.isExploding = false;
            this.alpha = 1;
            this.posX = Math.random() * (window_width - this.radius * 2) + this.radius;
            
            // MODIFICACIÓN: Todos los círculos inician fuera de la pantalla (abajo)
            // Se añade un margen aleatorio grande para que no salgan todos al mismo tiempo
            this.posY = window_height + this.radius + (Math.random() * 600); 
            
            this.dx = (Math.random() - 0.5) * 1.5;
            this.dy = -(Math.random() * this.speed + 0.4); 
        }

        explode() {
            this.isExploding = true;
            for (let i = 0; i < 12; i++) {
                particles.push(new Particle(this.posX, this.posY, this.color));
            }
        }

        update(context) {
            if (this.isDone) return;

            if (!this.isExploding) {
                let isHover = (mouse.x && Math.sqrt(Math.pow(mouse.x - this.posX, 2) + Math.pow(mouse.y - this.posY, 2)) < this.radius);
                this.displayColor = isHover ? "#FFFFFF" : this.color;

                this.posX += this.dx;
                this.posY += this.dy;

                // Si sale por arriba, se reinicia abajo para volver a intentarlo
                if (this.posY + this.radius < -50) this.resetPos();
                
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
        let progress = Math.floor((eliminatedInLevel / totalToEliminate) * 100);
        displayPercent.innerText = progress + "%";
        
        if (eliminatedInLevel >= totalToEliminate) {
            isLevelActive = false;
            gameMsg.innerText = "¡Nivel Superado! Selecciona el siguiente reto.";
            gameMsg.style.color = "#00ff00";
        }
    }

    function startLevel() {
        if (animationId) cancelAnimationFrame(animationId);
        
        const level = parseInt(levelSelector.value);
        totalToEliminate = level * 10;
        currentSpeed = 0.5 + (level * 0.35); // Velocidad base corregida
        
        eliminatedInLevel = 0;
        isLevelActive = true;
        updateStats();
        
        gameMsg.innerText = `Nivel ${level}: Objetivo ${totalToEliminate} burbujas.`;
        gameMsg.style.color = "rgba(255,255,255,0.6)";

        const parent = canvas.parentElement;
        window_width = Math.min(850, parent.clientWidth - 40);
        window_height = Math.min(400, window.innerHeight * 0.45);
        canvas.width = window_width; 
        canvas.height = window_height;
        
        circles = [];
        particles = [];
        for (let i = 0; i < totalToEliminate; i++) {
            circles.push(new Circle(i, currentSpeed));
        }

        function animate() {
            animationId = requestAnimationFrame(animate);
            ctx.clearRect(0, 0, window_width, window_height);
            circles.forEach(c => c.update(ctx));
            particles = particles.filter(p => { p.update(ctx); return p.alpha > 0; });
        }
        animate();
    }

    document.getElementById("btn-rebote").addEventListener("click", startLevel);
})();