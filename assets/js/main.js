(() => {
    const canvas = document.getElementById("canvas-rebote");
    const ctx = canvas.getContext("2d");
    let animationId;
    let circles = [];
    let window_width, window_height;

    // Objeto para rastrear la posición del mouse
    const mouse = { x: null, y: null };

    // Listeners para coordenadas del mouse
    canvas.addEventListener('mousemove', (event) => {
        const rect = canvas.getBoundingClientRect();
        // Cálculo preciso restando la posición del canvas en la pantalla
        mouse.x = event.clientX - rect.left;
        mouse.y = event.clientY - rect.top;
    });

    canvas.addEventListener('mouseleave', () => {
        mouse.x = null;
        mouse.y = null;
    });

    // Utilidades matemáticas
    function getDistance(x1, y1, x2, y2) { 
        return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2)); 
    }

    function getRandomColor() {
        const letters = '0123456789ABCDEF'; 
        let color = '#';
        for (let i = 0; i < 6; i++) color += letters[Math.floor(Math.random() * 16)];
        return color;
    }

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
            // Dirección aleatoria
            this.dx = (Math.random() < 0.5 ? 1 : -1) * this.speed;
            this.dy = (Math.random() < 0.5 ? 1 : -1) * this.speed;
        }

        draw(context) {
            context.beginPath();
            context.fillStyle = this.color;
            context.arc(this.posX, this.posY, this.radius, 0, Math.PI * 2, false);
            context.fill();
            
            // Estilo visual neón
            context.lineWidth = 2; 
            context.strokeStyle = "rgba(255, 255, 255, 0.9)"; 
            context.stroke();

            // Texto interno
            context.textAlign = "center"; 
            context.textBaseline = "middle";
            context.font = `bold ${this.radius * 0.7}px Arial`; 
            context.fillStyle = "white"; 
            context.fillText(this.text, this.posX, this.posY);
            context.closePath();
        }

        update(context) {
            // DETECCIÓN DE INTERACCIÓN (MOUSE)
            if (mouse.x !== null && mouse.y !== null) {
                let distToMouse = getDistance(mouse.x, mouse.y, this.posX, this.posY);
                
                if (distToMouse < this.radius) {
                    this.color = "#00fbff"; // Cyan Neón al tocarlo
                    if (this.radius < this.originalRadius * 1.4) this.radius += 1;
                } else {
                    this.color = this.baseColor;
                    if (this.radius > this.originalRadius) this.radius -= 1;
                }
            }

            // COLISIÓN CON BORDES
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

        // Ajuste dinámico para evitar SCROLL
        // Leemos el ancho del contenedor padre (glass-card)
        const parent = canvas.parentElement;
        const maxWidth = parent.clientWidth - 40; 
        const maxHeight = window.innerHeight * 0.45; // Limitamos a 45% de la altura de la pantalla

        let inputW = parseInt(document.getElementById("w-rebote").value) || 800;
        let inputH = parseInt(document.getElementById("h-rebote").value) || 400;
        let numCirculos = parseInt(document.getElementById("n-rebote").value) || 12;

        // El canvas no puede ser más grande que el espacio disponible
        window_width = Math.min(inputW, maxWidth);
        window_height = Math.min(inputH, maxHeight);

        canvas.width = window_width; 
        canvas.height = window_height;
        circles = [];

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

            // FÍSICA DE COLISIONES ENTRE CÍRCULOS
            for (let i = 0; i < circles.length; i++) {
                for (let j = i + 1; j < circles.length; j++) {
                    let cA = circles[i];
                    let cB = circles[j];
                    let dist = getDistance(cA.posX, cA.posY, cB.posX, cB.posY);

                    if (dist < cA.radius + cB.radius) {
                        // Resolver solapamiento
                        let overlap = (cA.radius + cB.radius) - dist;
                        let nx = (cB.posX - cA.posX) / dist;
                        let ny = (cB.posY - cA.posY) / dist;
                        
                        cA.posX -= nx * (overlap / 2);
                        cA.posY -= ny * (overlap / 2);
                        cB.posX += nx * (overlap / 2);
                        cB.posY += ny * (overlap / 2);

                        // Rebote (Intercambio de vectores)
                        let dvx = cA.dx - cB.dx;
                        let dvy = cA.dy - cB.dy;
                        let normalVel = dvx * nx + dvy * ny;
                        
                        if (normalVel > 0) {
                            cA.dx -= normalVel * nx;
                            cA.dy -= normalVel * ny;
                            cB.dx += normalVel * nx;
                            cB.dy += normalVel * ny;
                            
                            // Cambian de color al chocar
                            cA.baseColor = getRandomColor(); 
                            cB.baseColor = getRandomColor();
                        }
                    }
                }
            }
            circles.forEach(c => c.update(ctx));
        }
        animate();
    }

    // Escuchar el botón y el cambio de tamaño de ventana
    document.getElementById("btn-rebote").addEventListener("click", initRebote);
    window.addEventListener('resize', initRebote);

    initRebote();
})();