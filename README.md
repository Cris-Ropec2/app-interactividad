# 🔵 Simulación de Burbujas Interactiva - Graficación

Este proyecto es una aplicación web interactiva desarrollada para la materia de **Graficación** en el **Instituto Tecnológico de Pachuca (ITP)**. Consiste en una simulación de burbujas ascendentes con mecánicas de juego por niveles, efectos de partículas y una interfaz moderna basada en *Glassmorphism*.

## 👨‍💻 Programador
* **Nombre:** Cristopher Rodríguez Pérez
* **Institución:** Instituto Tecnológico de Pachuca
* **Carrera:** Ingeniería en Sistemas Computacionales

---

## 🚀 Características del Proyecto

* **Efecto Glassmorphism:** Interfaz visual moderna con desenfoque de fondo y transparencias.
* **Sistema de Niveles:** 10 niveles de dificultad seleccionables.
    * **Escalabilidad:** Cada nivel aumenta la cantidad de burbujas (`Nivel * 10`) y la velocidad de ascenso.
* **Interactividad:**
    * **Hover:** Las burbujas cambian de color al pasar el cursor sobre ellas.
    * **Explosión:** Al hacer clic, la burbuja se destruye generando un sistema de partículas de colores.
* **Física de Objetos:**
    * Movimiento ascendente con variaciones aleatorias de trayectoria.
    * Detección de bordes laterales y rebote.
    * Ciclo de reaparición (*Respawn*) desde la parte inferior si la burbuja escapa.
* **Tablero de Estadísticas:** Seguimiento en tiempo real de elementos eliminados y progreso porcentual del nivel actual.

---

## 🛠️ Tecnologías Utilizadas

* **HTML5 & CSS3:** Estructura y diseño personalizado.
* **JavaScript (Vanilla):** Lógica del motor de renderizado y físicas del Canvas.
* **Canvas API:** Dibujo de gráficos 2D y animaciones por frames.
* **Bootstrap 5:** Estructura responsiva y componentes de interfaz.

---

## 📂 Estructura de Carpetas

```text
APP-INTERACTIVIDAD/
│
├── assets/
│   ├── css/
│   │   └── styles.css      # Estilos personalizados y Glassmorphism
│   ├── img/
│   │   ├── favicon.png     # Icono de la pestaña
│   │   └── fondo_j.jpg     # Imagen de fondo del proyecto
│   └── js/
│       └── main.js         # Lógica principal del Canvas y Juego
│
├── index.html              # Estructura principal de la aplicación
└── README.md               # Documentación del proyecto