(() => {
    const canvas = document.getElementById("canvas-rebote");
    const ctx = canvas.getContext("2d");
    let animationId;
    let circles = [];
    let particles = []; // Nuevo arreglo para gestionar las explosiones
    let window_width, window_height;

    // Objeto para rastrear la posición del mouse
    const mouse = { x: null, y: null };

    // Listeners para coordenadas del mouse
    canvas.addEventListener('mousemove', (event) => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = event.clientX - rect.left;
        mouse.y = event.clientY - rect.top;
    });

    canvas.addEventListener('mouseleave', () => {
        mouse.x = null;
        mouse.y = null;
    });

    // Utilidades matemáticas y de color
    function getDistance(x1, y1, x2, y2) { 
        return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2)); 
    }

    function getRandomColor() {
        const letters = '0123456789ABCDEF'; 
        let color = '#';
        for (let i = 0; i < 6; i++) color += letters[Math.floor(Math.random() * 16)];
        return color;
    }

    // --- NUEVA CLASE: Particle (para el efecto de explosión) ---
    class Particle {
        constructor(x, y, color) {
            this.x = x;
            this.y = y;
            this.color = color;
            this.radius = Math.random() * 3 + 1; // Tamaños variados pequeños
            // Velocidad y dirección aleatoria (explosión)
            this.dx = (Math.random() - 0.5) * 8; 
            this.dy = (Math.random() - 0.5) * 8;
            this.alpha = 1; // Opacidad inicial (totalmente visible)
            this.decay = Math.random() * 0.02 + 0.015; // Velocidad de desvanecimiento
        }

        draw(context) {
            context.save(); // Guarda el estado del contexto
            context.globalAlpha = this.alpha; // Establece la transparencia actual
            context.beginPath();
            context.fillStyle = this.color;
            context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
            context.fill();
            context.restore(); // Restaura el estado original (evita afectar a otros dibujos)
        }

        update(context) {
            this.x += this.dx;
            this.y += this.dy;
            this.alpha -= this.decay; // Se vuelve más transparente
            this.radius *= 0.98; // Se hace un poco más pequeña
            this.draw(context);
        }
    }

    // --- CLASE: Circle (Modificada para soportar explosión) ---
    class Circle {
        constructor(x, y, radius, color, text, speed) {
            this.posX = x; 
            this.posY = y; 
            this.radius = radius;
            this.originalRadius = radius;
            this.baseColor = color;
            this.color = color;
            this.text = text; 
            this.speed = speed;
            this.dx = (Math.random() - 0.5) * this.speed * 2;
            this.dy = (Math.random() - 0.5) * this.speed * 2;
            
            // NUEVOS ESTADOS PARA EXPLOSIÓN
            this.isExploding = false;
            this.alpha = 1; // Opacidad para el círculo principal
        }

        draw(context) {
            // Si está explotando, dibujamos con transparencia gradual
            if (this.isExploding) {
                context.save();
                context.globalAlpha = this.alpha;
            }

            context.beginPath();
            context.fillStyle = this.color;
            context.arc(this.posX, this.posY, this.radius, 0, Math.PI * 2, false);
            context.fill();
            
            // Borde neón
            context.lineWidth = 2; 
            context.strokeStyle = this.isExploding ? `rgba(255,255,255,${this.alpha})` : "rgba(255, 255, 255, 0.9)"; 
            context.stroke();

            // Texto interno (no se dibuja si está explotando para mejor efecto)
            if (!this.isExploding) {
                context.textAlign = "center"; 
                context.textBaseline = "middle";
                context.font = `bold ${this.radius * 0.7}px Arial`; 
                context.fillStyle = "white"; 
                context.fillText(this.text, this.posX, this.posY);
            }
            context.closePath();

            if (this.isExploding) {
                context.restore();
            }
        }

        // NUEVO MÉTODO: createExplosion
        createExplosion() {
            this.isExploding = true;
            this.dx = 0; this.dy = 0; // Detener el movimiento del círculo base
            
            // Crear múltiples partículas
            const particleCount = this.radius * 2; // Más partículas para círculos grandes
            for (let i = 0; i < particleCount; i++) {
                particles.push(new Particle(this.posX, this.posY, this.baseColor));
            }
        }

        update(context) {
            // Lógica si el círculo está "vivo"
            if (!this.isExploding) {
                // DETECCIÓN DE INTERACCIÓN (MOUSE)
                if (mouse.x !== null && mouse.y !== null) {
                    let distToMouse = getDistance(mouse.x, mouse.y, this.posX, this.posY);
                    
                    if (distToMouse < this.radius) {
                        // ¡TOCADO! Iniciar explosión
                        this.createExplosion();
                        return; // Salir del update para este círculo
                    }
                }

                // COLISIÓN CON BORDES (Solo si no está explotando)
                if (this.posX + this.radius > window_width || this.posX - this.radius < 0) {
                    this.dx = -this.dx;
                }
                if (this.posY + this.radius > window_height || this.posY - this.radius < 0) {
                    this.dy = -this.dy;
                }
                
                this.posX += this.dx; 
                this.posY += this.dy;
            } else {
                // LÓGICA DE DESVANECIMIENTO DEL CÍRCULO BASE
                this.alpha -= 0.03; // Se desvanece rápido
                if (this.alpha < 0) this.alpha = 0;
            }

            this.draw(context);
        }
    }

    function initRebote() {
        if (animationId) cancelAnimationFrame(animationId);

        // Ajuste dinámico responsivo (mismo código anterior)
        const parent = canvas.parentElement;
        const maxWidth = parent.clientWidth - 40; 
        const maxHeight = window.innerHeight * 0.45; 

        let inputW = parseInt(document.getElementById("w-rebote").value) || 800;
        let inputH = parseInt(document.getElementById("h-rebote").value) || 400;
        let numCirculos = parseInt(document.getElementById("n-rebote").value) || 12;

        window_width = Math.min(inputW, maxWidth);
        window_height = Math.min(inputH, maxHeight);

        canvas.width = window_width; 
        canvas.height = window_height;
        
        // Reiniciar arreglos
        circles = [];
        particles = []; 

        for (let i = 0; i < numCirculos; i++) {
            let radius = Math.floor(Math.random() * 10 + 15);
            let x = Math.random() * (window_width - radius * 2) + radius;
            let y = Math.random() * (window_height - radius * 2) + radius;
            let speed = Math.random() * 1.5 + 0.5;
            circles.push(new Circle(x, y, radius, getRandomColor(), (i + 1).toString(), speed));
        }

        function animate() {
            animationId = requestAnimationFrame(animate);
            ctx.clearRect(0, 0, window_width, window_height);

            // FÍSICA DE COLISIONES ENTRE CÍRCULOS (Solo para círculos no explotando)
            for (let i = 0; i < circles.length; i++) {
                if (circles[i].isExploding) continue; // Saltar si está explotando

                for (let j = i + 1; j < circles.length; j++) {
                    let cA = circles[i];
                    let cB = circles[j];
                    if (cB.isExploding) continue; // Saltar si está explotando

                    let dist = getDistance(cA.posX, cA.posY, cB.posX, cB.posY);

                    if (dist < cA.radius + cB.radius) {
                        let overlap = (cA.radius + cB.radius) - dist;
                        let nx = (cB.posX - cA.posX) / dist;
                        let ny = (cB.posY - cA.posY) / dist;
                        cA.posX -= nx * (overlap / 2); cA.posY -= ny * (overlap / 2);
                        cB.posX += nx * (overlap / 2); cB.posY += ny * (overlap / 2);

                        let dvx = cA.dx - cB.dx; let dvy = cA.dy - cB.dy;
                        let normalVel = dvx * nx + dvy * ny;
                        if (normalVel > 0) {
                            cA.dx -= normalVel * nx; cA.dy -= normalVel * ny;
                            cB.dx += normalVel * nx; cB.dy += normalVel * ny;
                            cA.baseColor = getRandomColor(); cB.baseColor = getRandomColor();
                        }
                    }
                }
            }

            // --- ACTUALIZAR Y LIMPIAR CÍRCULOS ---
            // Usamos filter para mantener solo los círculos que no han desaparecido totalmente
            circles = circles.filter(c => {
                c.update(ctx);
                return c.alpha > 0; // Mantener si aún es visible
            });

            // --- ACTUALIZAR Y LIMPIAR PARTÍCULAS ---
            particles = particles.filter(p => {
                p.update(ctx);
                return p.alpha > 0; // Mantener si aún es visible
            });
        }
        animate();
    }

    // Escuchar el botón y el cambio de tamaño de ventana
    document.getElementById("btn-rebote").addEventListener("click", initRebote);
    window.addEventListener('resize', initRebote);

    initRebote();
})();