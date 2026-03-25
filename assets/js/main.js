(() => {
    const canvas = document.getElementById("canvas-rebote");
    const ctx = canvas.getContext("2d");
    let animationId;
    let circles = [];
    let window_width, window_height;

    // Objeto para rastrear la posición del mouse relativo al canvas
    const mouse = { x: null, y: null };

    // Event Listeners para interacción con el mouse
    canvas.addEventListener('mousemove', (event) => {
        const rect = canvas.getBoundingClientRect();
        // Ajuste de coordenadas considerando el scroll y la posición del canvas
        mouse.x = event.clientX - rect.left;
        mouse.y = event.clientY - rect.top;
    });

    canvas.addEventListener('mouseleave', () => {
        mouse.x = null;
        mouse.y = null;
    });

    // Funciones de utilidad
    function getDistance(x1, y1, x2, y2) { 
        return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2)); 
    }

    function getRandomColor() {
        const letters = '0123456789ABCDEF'; 
        let color = '#';
        for (let i = 0; i < 6; i++) color += letters[Math.floor(Math.random() * 16)];
        return color;
    }

    // Clase Circle con lógica de colisión y detección de mouse
    class Circle {
        constructor(x, y, radius, color, text, speed) {
            this.posX = x; 
            this.posY = y; 
            this.radius = radius;
            this.originalRadius = radius; // Guardamos el tamaño original para el efecto hover
            this.baseColor = color;       // Color asignado aleatoriamente
            this.color = color;
            this.text = text; 
            this.speed = speed;
            this.dx = (Math.random() < 0.5 ? 1 : -1) * this.speed;
            this.dy = (Math.random() < 0.5 ? 1 : -1) * this.speed;
        }

        draw(context) {
            context.beginPath();
            context.fillStyle = this.color;
            context.arc(this.posX, this.posY, this.radius, 0, Math.PI * 2, false);
            context.fill();
            
            // Estilo del borde neón
            context.lineWidth = 2; 
            context.strokeStyle = "rgba(255, 255, 255, 0.8)"; 
            context.stroke();

            // Estilo del texto (ID del círculo)
            context.textAlign = "center"; 
            context.textBaseline = "middle";
            context.font = `bold ${this.radius * 0.6}px Arial`; 
            context.fillStyle = "white"; 
            context.fillText(this.text, this.posX, this.posY);
            context.closePath();
        }

        update(context) {
            // --- LÓGICA DE DETECCIÓN DE MOUSE ---
            if (mouse.x !== null && mouse.y !== null) {
                let distToMouse = getDistance(mouse.x, mouse.y, this.posX, this.posY);
                
                if (distToMouse < this.radius) {
                    // Acción al detectar el mouse: Cambio de color y ligero crecimiento
                    this.color = "#00fbff"; // Color Cyan Neón
                    if (this.radius < this.originalRadius * 1.5) this.radius += 1;
                } else {
                    // Volver a la normalidad
                    this.color = this.baseColor;
                    if (this.radius > this.originalRadius) this.radius -= 1;
                }
            }

            // --- LÓGICA DE REBOTE EN BORDES ---
            if (this.posX + this.radius > window_width || this.posX - this.radius < 0) {
                this.dx = -this.dx;
            }
            if (this.posY + this.radius > window_height || this.posY - this.radius < 0) {
                this.dy = -this.dy;
            }
            
            this.posX += this.dx; 
            this.posY += this.dy;

            this.draw(context);
        }
    }

    function initRebote() {
        if (animationId) cancelAnimationFrame(animationId);

        // Obtener valores de los inputs
        window_width = parseInt(document.getElementById("w-rebote").value) || 800;
        window_height = parseInt(document.getElementById("h-rebote").value) || 400;
        let numCirculos = parseInt(document.getElementById("n-rebote").value) || 12;

        // Configuración del canvas
        canvas.width = window_width; 
        canvas.height = window_height;
        circles = [];

        // Creación de los círculos
        for (let i = 0; i < numCirculos; i++) {
            let radius = Math.floor(Math.random() * 15 + 15);
            let x = Math.random() * (window_width - radius * 2) + radius;
            let y = Math.random() * (window_height - radius * 2) + radius;
            let speed = Math.random() * 2 + 0.5;
            circles.push(new Circle(x, y, radius, getRandomColor(), (i + 1).toString(), speed));
        }

        function animate() {
            animationId = requestAnimationFrame(animate);
            // Limpieza con rastro leve (opcional, para efecto visual)
            ctx.clearRect(0, 0, window_width, window_height);

            // --- FÍSICA DE COLISIONES ENTRE OBJETOS ---
            for (let i = 0; i < circles.length; i++) {
                for (let j = i + 1; j < circles.length; j++) {
                    let circleA = circles[i];
                    let circleB = circles[j];
                    let distance = getDistance(circleA.posX, circleA.posY, circleB.posX, circleB.posY);

                    // Si colisionan
                    if (distance < circleA.radius + circleB.radius) {
                        // 1. Resolución de solapamiento (para que no se queden pegados)
                        let overlap = (circleA.radius + circleB.radius) - distance;
                        let nx = (circleB.posX - circleA.posX) / distance;
                        let ny = (circleB.posY - circleA.posY) / distance;
                        
                        circleA.posX -= nx * (overlap / 2);
                        circleA.posY -= ny * (overlap / 2);
                        circleB.posX += nx * (overlap / 2);
                        circleB.posY += ny * (overlap / 2);

                        // 2. Intercambio de velocidades (Rebote elástico simple)
                        let dvx = circleA.dx - circleB.dx;
                        let dvy = circleA.dy - circleB.dy;
                        let normalVelocity = dvx * nx + dvy * ny;
                        
                        if (normalVelocity > 0) {
                            circleA.dx -= normalVelocity * nx;
                            circleA.dy -= normalVelocity * ny;
                            circleB.dx += normalVelocity * nx;
                            circleB.dy += normalVelocity * ny;
                            
                            // Cambio de color base al chocar
                            circleA.baseColor = getRandomColor(); 
                            circleB.baseColor = getRandomColor();
                        }
                    }
                }
            }

            // Actualizar y dibujar cada círculo
            circles.forEach(c => c.update(ctx));
        }

        animate();
    }

    // Evento del botón de reinicio
    document.getElementById("btn-rebote").addEventListener("click", initRebote);

    // Ejecución inicial
    initRebote();
})();