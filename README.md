# ⚡ CYBER NERD RUNNER 3025

> **🤖 Creado 100% con Amazon Q Developer**  
> Este juego fue desarrollado completamente utilizando Amazon Q Developer para el desafío AWS en Nerdearla 2025. No se escribió ni una sola línea de código manualmente - todo fue generado mediante prompts de lenguaje natural y la inteligencia artificial de Amazon Q.

Un juego 3D de runner cyberpunk desarrollado con Three.js, inspirado en los clásicos arcade de los 80s.

Probalo on-line
https://alexdraven.github.io/nerdearla-desafio-aws/

## 🎮 Descripción

CYBER NERD RUNNER 3025 es un juego de endless runner en primera persona con estética cyberpunk. El jugador debe esquivar enemigos voxelizados mientras corre por un mundo futurista lleno de neón y efectos visuales.

## 🚀 Características

- **Gráficos 3D**: Renderizado con Three.js en primera persona
- **5 Tipos de Enemigos**: Skull, Spider, Robot, Alien y Demon con diseños únicos
- **Sistema de Boost**: Acelera el juego para mayor intensidad
- **Estética Cyberpunk**: Colores verde neón y efectos visuales
- **HUD Profesional**: Interfaz moderna optimizada para videojuegos indie
- **Sistema de Hi-Score**: Guarda tu mejor puntuación localmente
- **Barra de Progreso**: Indicador visual del avance hacia la victoria
- **Controles Simples**: Fácil de aprender, difícil de dominar

## 🎯 Objetivo

Alcanza 200 puntos esquivando enemigos. Cada enemigo evitado suma 10 puntos. La velocidad aumenta exponencialmente con el progreso.

## 🕹️ Controles

- **A / ←**: Moverse al carril izquierdo
- **D / →**: Moverse al carril derecho  
- **SPACE**: Activar boost (aumenta velocidad x4)
- **ENTER**: Reiniciar juego (cuando termina)

## 🛠️ Tecnologías

- **Three.js**: Motor 3D para renderizado
- **HTML5**: Estructura del juego
- **CSS3**: Estilos y animaciones
- **JavaScript**: Lógica del juego

## 📁 Estructura del Proyecto

```
nerdearla-desafio-aws/
├── index.html        # Archivo principal HTML
├── game.js           # Lógica del juego y motor 3D
├── style.css         # Estilos y efectos visuales
└── README.md         # Documentación
```

## 🎨 Diseño Visual

- **Colores Principales**: Verde neón (#00ff41) para UI cyberpunk
- **Tipografía**: Courier New (estilo hacker terminal)
- **UI/UX**: Diseño optimizado siguiendo principios de videojuegos indie
- **Efectos**: Niebla dinámica, partículas y efectos de glow
- **Enemigos**: Diseños voxel con 5 colores únicos por tipo

## 🚀 Instalación y Uso

1. Clona o descarga el repositorio
2. Abre `index.html` en tu navegador web
3. ¡Disfruta del juego!

No requiere instalación de dependencias adicionales.

## 🎮 Mecánicas de Juego

### Sistema de Carriles
- 3 carriles de movimiento
- Cambio instantáneo entre carriles
- Colisión precisa por carril

### Sistema de Boost
- Multiplica la velocidad x4
- Efectos visuales intensificados
- Indicador visual en HUD

### Enemigos
- **Skull**: Calavera clásica con ojos brillantes
- **Spider**: Araña con patas extendidas
- **Robot**: Diseño mecánico futurista
- **Alien**: Forma alienígena clásica
- **Demon**: Demonio con cuernos

### Progresión
- Velocidad base: 0.3 unidades/frame
- Incremento: Exponencial basado en score
- Fórmula: velocidad = 0.3 * (1 + score/100)²
- Meta: 200 puntos para ganar
- Hi-Score: Persistente entre sesiones

## 🔧 Personalización

El juego es fácilmente personalizable:

- **Nuevos enemigos**: Agrega patrones en `enemyPatterns`
- **Colores**: Modifica las variables CSS
- **Velocidad**: Ajusta `gameSpeed` en game.js
- **Carriles**: Modifica el array `lanes`

## 📱 Compatibilidad

- ✅ Chrome/Chromium
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- 🎮 UI optimizada para gaming
- 💾 LocalStorage para hi-scores

## 🏆 Créditos

Desarrollado para el desafío Nerdearla AWS con amor por los juegos retro y la estética cyberpunk.

---

**¡Que comience la carrera cyberpunk! ⚡🎮**
