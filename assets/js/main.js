/**
 * main.js - Simulación de Burbujas Ascendentes con Explosión
 * Programador: Christopher Rodríguez Pérez
 * Instituto Tecnológico de Pachuca
 */

(() => {
    const canvas = document.getElementById("canvas-rebote");
    const ctx = canvas.getContext("2d");
    let animationId;
    let circles = [];
    let particles = [];
    let window_width, window_height;

    const mouse = { x: null, y: null };

    canvas.addEventListener('mousemove', (event) => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = event.clientX - rect.left;
        mouse.y = event.clientY - rect.top;
    });

    canvas.addEventListener('mouseleave', () => {
        mouse.x = null;
        mouse.y = null;
    });

    function getDistance(x1, y1, x2, y2) { 
        return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2)); 
    }

    function getRandomColor() {
        const letters = '0123456789ABCDEF'; 
        let color = '#';
        for (let i = 0; i < 6; i++) color += letters[Math.floor(Math.random() * 16)];
        return color;
    }

    class Particle {
        constructor(x, y, color) {
            this.x = x;
            this.y = y;
            this.color = color;
            this.radius = Math.random() * 3 + 1;
            this.dx = (Math.random() - 0.5) * 6; 
            this.dy = (Math.random() - 0.5) * 6;
            this.alpha = 1;
            this.decay = Math.random() * 0.03 + 0.02;
        }

        draw(context) {
            context.save();
            context.globalAlpha = this.alpha;
            context.beginPath();
            context.fillStyle = this.color;
            context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
            context.fill();
            context.restore();
        }

        update(context) {
            this.x += this.dx;
            this.y += this.dy;
            this.alpha -= this.decay;
            this.draw(context);
        }
    }

    class Circle {
        constructor(x, y, radius, color, text, speed, isInitial = false) {
            this.radius = radius;
            this.originalRadius = radius;
            this.baseColor = color;
            this.color = color;
            this.text = text;
            this.speed = speed;
            this.isExploding = false;
            this.alpha = 1;

            // Resetear posición y velocidad
            this.reset(isInitial);
        }

        // Método para (re)ubicar el círculo abajo del canvas
        reset(isInitial) {
            this.isExploding = false;
            this.alpha = 1;
            this.radius = this.originalRadius;
            this.color = this.baseColor;
            
            // X aleatoria en todo el ancho
            this.posX = Math.random() * (window_width - this.radius * 2) + this.radius;
            
            // Si es la carga inicial, distribuirlos en pantalla. 
            // Si es un "respawn", mandarlos abajo del borde.
            if (isInitial) {
                this.posY = Math.random() * window_height;
            } else {
                this.posY = window_height + this.radius + Math.random() * 100;
            }

            // Movimiento: DX aleatorio (zig-zag ligero) y DY siempre hacia arriba (negativo)
            this.dx = (Math.random() - 0.5) * 1.5; 
            this.dy = -(Math.random() * this.speed + 0.5); 
        }

        draw(context) {
            context.save();
            if (this.isExploding) context.globalAlpha = this.alpha;
            
            context.beginPath();
            context.fillStyle = this.color;
            context.arc(this.posX, this.posY, this.radius, 0, Math.PI * 2, false);
            context.fill();
            context.lineWidth = 2; 
            context.strokeStyle = "rgba(255, 255, 255, 0.8)"; 
            context.stroke();

            if (!this.isExploding) {
                context.textAlign = "center"; 
                context.textBaseline = "middle";
                context.font = `bold ${this.radius * 0.6}px Arial`; 
                context.fillStyle = "white"; 
                context.fillText(this.text, this.posX, this.posY);
            }
            context.restore();
        }

        createExplosion() {
            this.isExploding = true;
            for (let i = 0; i < 15; i++) {
                particles.push(new Particle(this.posX, this.posY, this.baseColor));
            }
        }

        update(context) {
            if (!this.isExploding) {
                // Interacción Mouse
                if (mouse.x !== null && mouse.y !== null) {
                    let dist = getDistance(mouse.x, mouse.y, this.posX, this.posY);
                    if (dist < this.radius) {
                        this.createExplosion();
                        return;
                    }
                }

                // Movimiento ascendente
                this.posX += this.dx;
                this.posY += this.dy;

                // Si sale por arriba, reiniciar abajo
                if (this.posY + this.radius < 0) {
                    this.reset(false);
                }
                
                // Rebote lateral (opcional, para que no se pierdan por los lados)
                if (this.posX + this.radius > window_width || this.posX - this.radius < 0) {
                    this.dx = -this.dx;
                }

            } else {
                this.alpha -= 0.05;
                // Una vez que desaparece la explosión, reaparece abajo
                if (this.alpha <= 0) {
                    this.reset(false);
                }
            }
            this.draw(context);
        }
    }

    function initRebote() {
        if (animationId) cancelAnimationFrame(animationId);

        const parent = canvas.parentElement;
        const maxWidth = parent.clientWidth - 40; 
        const maxHeight = window.innerHeight * 0.45; 

        window_width = Math.min(parseInt(document.getElementById("w-rebote").value) || 800, maxWidth);
        window_height = Math.min(parseInt(document.getElementById("h-rebote").value) || 400, maxHeight);

        canvas.width = window_width; 
        canvas.height = window_height;
        
        circles = [];
        particles = []; 
        let numCirculos = parseInt(document.getElementById("n-rebote").value) || 12;

        for (let i = 0; i < numCirculos; i++) {
            let radius = Math.floor(Math.random() * 10 + 15);
            let speed = Math.random() * 1 + 0.5; // Velocidad lenta
            // isInitial = true para que no empiecen todos amontonados abajo al dar click en Reiniciar
            circles.push(new Circle(0, 0, radius, getRandomColor(), (i + 1).toString(), speed, true));
        }

        function animate() {
            animationId = requestAnimationFrame(animate);
            ctx.clearRect(0, 0, window_width, window_height);

            // Colisiones entre círculos (opcional en este modo, pero se mantiene)
            for (let i = 0; i < circles.length; i++) {
                if (circles[i].isExploding) continue;
                for (let j = i + 1; j < circles.length; j++) {
                    let cA = circles[i]; let cB = circles[j];
                    if (cB.isExploding) continue;

                    let dist = getDistance(cA.posX, cA.posY, cB.posX, cB.posY);
                    if (dist < cA.radius + cB.radius) {
                        let overlap = (cA.radius + cB.radius) - dist;
                        let nx = (cB.posX - cA.posX) / dist;
                        let ny = (cB.posY - cA.posY) / dist;
                        cA.posX -= nx * (overlap / 2); cA.posY -= ny * (overlap / 2);
                        cB.posX += nx * (overlap / 2); cB.posY += ny * (overlap / 2);
                        // Intercambio simple de dirección DX al chocar
                        let temp = cA.dx; cA.dx = cB.dx; cB.dx = temp;
                    }
                }
            }

            circles.forEach(c => c.update(ctx));
            particles = particles.filter(p => {
                p.update(ctx);
                return p.alpha > 0;
            });
        }
        animate();
    }

    document.getElementById("btn-rebote").addEventListener("click", initRebote);
    window.addEventListener('resize', initRebote);
    initRebote();
})();