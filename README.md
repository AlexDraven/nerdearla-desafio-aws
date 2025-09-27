# ⚡ CYBER NERD RUNNER 3025

> **🤖 Creado 100% con Amazon Q Developer**  
> Este juego fue desarrollado completamente utilizando Amazon Q Developer para el desafío AWS en Nerdearla 2025. No se escribió ni una sola línea de código manualmente - todo fue generado mediante prompts de lenguaje natural y la inteligencia artificial de Amazon Q.

Un juego 3D de runner cyberpunk desarrollado con Three.js, inspirado en los clásicos arcade de los 80s.

## 🎮 Descripción

CYBER NERD RUNNER 3025 es un juego de endless runner en primera persona con estética cyberpunk. El jugador debe esquivar enemigos voxelizados mientras corre por un mundo futurista lleno de neón y efectos visuales.

## 🚀 Características

- **Gráficos 3D**: Renderizado con Three.js en primera persona
- **5 Tipos de Enemigos**: Skull, Spider, Robot, Alien y Demon con diseños únicos
- **Sistema de Boost**: Acelera el juego para mayor intensidad
- **Estética Cyberpunk**: Colores neón, niebla dinámica y efectos visuales
- **HUD Profesional**: Interfaz moderna con efectos glassmorphism
- **Controles Simples**: Fácil de aprender, difícil de dominar

## 🎯 Objetivo

Alcanza 100 puntos esquivando enemigos. Cada enemigo evitado suma 10 puntos. La velocidad aumenta progresivamente cada 20 puntos.

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
├── mario-game.html    # Archivo principal HTML
├── game.js           # Lógica del juego y motor 3D
├── style.css         # Estilos y efectos visuales
└── README.md         # Documentación
```

## 🎨 Diseño Visual

- **Colores Principales**: Verde neón (#00ff41) y rojo sangre (#8b0000)
- **Tipografía**: Press Start 2P (estilo retro gaming)
- **Efectos**: Niebla dinámica, partículas y glassmorphism
- **Enemigos**: Diseños voxel inspirados en Space Invaders

## 🚀 Instalación y Uso

1. Clona o descarga el repositorio
2. Abre `mario-game.html` en tu navegador web
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
- Incremento: +0.03 cada 20 puntos
- Velocidad máxima: 0.5 unidades/frame
- Meta: 100 puntos para ganar

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
- 📱 Responsive design para móviles

## 🏆 Créditos

Desarrollado para el desafío Nerdearla AWS con amor por los juegos retro y la estética cyberpunk.

---

**¡Que comience la carrera cyberpunk! ⚡🎮**