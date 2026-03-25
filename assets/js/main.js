/**
 * main.js - Juego de Burbujas por Niveles
 * Programador: Christopher Rodríguez Pérez
 * Instituto Tecnológico de Pachuca
 */

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
    let levelEliminated = 0; // Contador para llegar a 10
    let currentLevel = 1;
    let baseSpeed = 0.8; // Velocidad inicial lenta

    const mouse = { x: null, y: null };

    // Captura de movimiento del mouse
    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
    });

    canvas.addEventListener('mouseleave', () => { mouse.x = null; mouse.y = null; });

    function getDistance(x1, y1, x2, y2) { return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2)); }
    function getRandomColor() {
        const colors = ['#00fbff', '#ff00ff', '#00ff00', '#ffff00', '#ff4500', '#adff2f'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    // Partículas para la explosión
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
            this.radius = Math.floor(Math.random() * 8 + 15);
            this.baseColor = getRandomColor();
            this.initPos(true);
        }

        // Posicionamiento inicial y reinicio
        initPos(isStart = false) {
            this.isExploding = false;
            this.alpha = 1;
            this.posX = Math.random() * (window_width - this.radius * 2) + this.radius;
            // Si es el inicio del juego, distribuirlos. Si no, mandarlos al fondo.
            this.posY = isStart ? Math.random() * window_height : window_height + this.radius + Math.random() * 100;
            this.dx = (Math.random() - 0.5) * 2;
            this.dy = -(Math.random() * baseSpeed + 0.5);
        }

        draw(context) {
            context.save();
            if (this.isExploding) context.globalAlpha = this.alpha;
            context.beginPath();
            context.fillStyle = this.isExploding ? "#FFFFFF" : this.baseColor;
            context.arc(this.posX, this.posY, this.radius, 0, Math.PI * 2);
            context.fill();
            context.strokeStyle = "rgba(255,255,255,0.5)";
            context.stroke();
            context.restore();
        }

        explode() {
            this.isExploding = true;
            totalEliminated++;
            levelEliminated++;
            checkLevelUp();
            for (let i = 0; i < 12; i++) particles.push(new Particle(this.posX, this.posY, this.baseColor));
        }

        update(context) {
            if (!this.isExploding) {
                // Colisión con mouse
                if (mouse.x !== null && mouse.y !== null) {
                    if (getDistance(mouse.x, mouse.y, this.posX, this.posY) < this.radius) {
                        this.explode();
                        return;
                    }
                }
                // Movimiento ascendente
                this.posX += this.dx;
                this.posY += this.dy;

                // Salida por arriba -> Reaparece abajo
                if (this.posY + this.radius < 0) this.initPos(false);
                // Rebote lateral
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
            baseSpeed += 0.6; // Incremento de velocidad por nivel
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
        
        // Reset de lógica
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
        // Grupo constante de 10 elementos
        for (let i = 0; i < 10; i++) {
            circles.push(new Circle(i));
        }

        function animate() {
            animationId = requestAnimationFrame(animate);
            ctx.clearRect(0, 0, window_width, window_height);
            
            // Actualizar velocidad dy de los círculos según el nivel actual
            circles.forEach(c => {
                if (!c.isExploding) {
                    // Mantener la velocidad actualizada al nivel
                    if (Math.abs(c.dy) < baseSpeed) c.dy = -(Math.random() * baseSpeed + 0.5);
                }
                c.update(ctx);
            });

            // Partículas
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