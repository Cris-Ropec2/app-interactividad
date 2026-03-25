(() => {
    const canvas = document.getElementById("canvas-rebote");
    const ctx = canvas.getContext("2d");
    
    // Elementos de la Interfaz
    const displayNum = document.getElementById("score-num");
    const displayPercent = document.getElementById("score-percent");
    const displayLevel = document.getElementById("current-level");

    let animationId;
    let circles = [];
    let particles = [];
    let window_width, window_height;

    // Lógica de Juego
    let totalEliminated = 0;
    let levelEliminated = 0; 
    let currentLevel = 1;
    let baseSpeed = 0.8;

    const mouse = { x: null, y: null };

    // 1. Rastrear posición para el cambio de color (Hover)
    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
    });

    // 2. Evento de CLIC para eliminar (Explosión)
    canvas.addEventListener('mousedown', (e) => {
        const rect = canvas.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;

        // Revisar qué círculo fue cliqueado
        circles.forEach(circle => {
            if (!circle.isExploding) {
                const dist = getDistance(clickX, clickY, circle.posX, circle.posY);
                if (dist < circle.radius) {
                    circle.explode();
                }
            }
        });
    });

    canvas.addEventListener('mouseleave', () => { mouse.x = null; mouse.y = null; });

    function getDistance(x1, y1, x2, y2) { return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2)); }
    
    function getRandomColor() {
        const colors = ['#00fbff', '#ff00ff', '#00ff00', '#ffff00', '#ff4500', '#adff2f'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    class Particle {
        constructor(x, y, color) {
            this.x = x; this.y = y; this.color = color;
            this.radius = Math.random() * 2 + 1;
            this.dx = (Math.random() - 0.5) * 8;
            this.dy = (Math.random() - 0.5) * 8;
            this.alpha = 1;
            this.decay = Math.random() * 0.03 + 0.02;
        }
        update(context) {
            this.x += this.dx; this.y += this.dy;
            this.alpha -= this.decay;
            context.save();
            context.globalAlpha = this.alpha;
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
            this.radius = Math.floor(Math.random() * 8 + 18); // Un poco más grandes para facilitar el clic
            this.baseColor = getRandomColor();
            this.currentColor = this.baseColor;
            this.initPos(true);
        }

        initPos(isStart = false) {
            this.isExploding = false;
            this.alpha = 1;
            this.posX = Math.random() * (window_width - this.radius * 2) + this.radius;
            this.posY = isStart ? Math.random() * window_height : window_height + this.radius + Math.random() * 100;
            this.dx = (Math.random() - 0.5) * 2;
            this.dy = -(Math.random() * baseSpeed + 0.5);
        }

        draw(context) {
            context.save();
            if (this.isExploding) context.globalAlpha = this.alpha;
            
            context.beginPath();
            context.fillStyle = this.isExploding ? "#FFFFFF" : this.currentColor;
            context.arc(this.posX, this.posY, this.radius, 0, Math.PI * 2);
            context.fill();
            
            // Borde resaltado
            context.lineWidth = 2;
            context.strokeStyle = "rgba(255,255,255,0.8)";
            context.stroke();
            context.restore();
        }

        explode() {
            this.isExploding = true;
            totalEliminated++;
            levelEliminated++;
            checkLevelUp();
            for (let i = 0; i < 15; i++) {
                particles.push(new Particle(this.posX, this.posY, this.currentColor));
            }
        }

        update(context) {
            if (!this.isExploding) {
                // LÓGICA DE HOVER: Cambiar color si el mouse pasa por encima
                if (mouse.x !== null && mouse.y !== null) {
                    const dist = getDistance(mouse.x, mouse.y, this.posX, this.posY);
                    if (dist < this.radius) {
                        this.currentColor = "#FFFFFF"; // Cambia a blanco neón al pasar el cursor
                    } else {
                        this.currentColor = this.baseColor;
                    }
                }

                this.posX += this.dx;
                this.posY += this.dy;

                if (this.posY + this.radius < 0) this.initPos(false);
                if (this.posX + this.radius > window_width || this.posX - this.radius < 0) this.dx = -this.dx;
            } else {
                this.alpha -= 0.1;
                if (this.alpha <= 0) this.initPos(false);
            }
            this.draw(context);
        }
    }

    function checkLevelUp() {
        if (levelEliminated >= 10) {
            levelEliminated = 0;
            currentLevel++;
            baseSpeed += 0.7; // Aumentar dificultad
        }
        updateInterface();
    }

    function updateInterface() {
        displayNum.innerText = totalEliminated;
        displayLevel.innerText = currentLevel;
        let progress = (levelEliminated / 10) * 100;
        displayPercent.innerText = `${Math.floor(progress)}%`;
    }

    function initGame() {
        if (animationId) cancelAnimationFrame(animationId);
        
        totalEliminated = 0;
        levelEliminated = 0;
        currentLevel = 1;
        baseSpeed = 0.8;
        updateInterface();

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
            
            circles.forEach(c => c.update(ctx));

            particles = particles.filter(p => {
                p.update(ctx);
                return p.alpha > 0;
            });
        }
        animate();
    }

    document.getElementById("btn-rebote").addEventListener("click", initGame);
    window.addEventListener('resize', initGame);
    initGame();
})();