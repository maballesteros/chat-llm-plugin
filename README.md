# Mike's IA Plugin

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Mike's IA Plugin es un plugin para [Obsidian](https://obsidian.md/) que actúa como un asistente de inteligencia artificial para la toma de notas diarias y la interacción con el modelo de OpenAI. Con este plugin, puedes chatear con un asistente experto que utiliza la API de OpenAI para responder tus preguntas y, además, crear notas diarias de manera automática.

## Tabla de contenidos

- [Características](#caracteristicas)
- [Instalación](#instalacion)
- [Uso](#uso)
- [Configuración](#configuracion)
- [Desarrollo](#desarrollo)
- [Contribuir](#contribuir)
- [Licencia](#licencia)
- [Autor](#autor)

## Requisitos

- Obsidian v1.0 o superior
- Una clave de API de OpenAI activa
- (Opcional) Node.js >= 14 y npm (solo necesario para desarrollo)

## Características

- **Chat con IA**: Interactúa con el modelo de OpenAI (por defecto, `GPT-4o`) directamente desde Obsidian.
- **Creación de Nota Diaria**: Crea y abre automáticamente una nota diaria organizada por año, mes y día.
- **Integración con el Editor Markdown**: Inserta las respuestas de la IA directamente en el editor de Markdown.
- **Soporte para KaTeX**: Para fórmulas matemáticas, la IA utiliza la notación de KaTeX con delimitadores adecuados.
- **Interfaz de Usuario Amigable**: Incluye un panel de chat con una interfaz limpia y controles intuitivos.

## Instalación

1. Descarga o clona este repositorio en tu equipo:
   ```bash
   git clone <URL_DEL_REPOSITORIO>
   ```
2. Copia la carpeta del plugin al directorio de plugins de tu vault de Obsidian:
   ```bash
   cp -r mikes-ia-plugin <TU_VAULT>/.obsidian/plugins/
   ```
3. Abre Obsidian, ve a **Ajustes > Comunidad > Plugins de terceros**, y activa **Mike's IA Plugin**.
4. (Opcional) Reinicia Obsidian o recarga los plugins para aplicar cambios.

## Uso

### Abrir el Chat de IA
- Haz clic en el ícono de mensaje (📩) en la barra lateral para abrir el panel de chat.
- Escribe tu mensaje en el área de entrada y presiona **Enter** (o haz clic en el botón de enviar) para obtener la respuesta de la IA.
- Si deseas insertar la respuesta en el editor de Markdown, utiliza el botón de transferencia (ícono con flecha).

### Crear Nota Diaria
- Haz clic en el ícono de documento (📄) en la barra lateral para crear y abrir automáticamente la nota diaria.
- La nota se crea en una estructura de carpetas organizada por año, mes y día.

## Configuración

### API Key y Modelo
- Dirígete a **Ajustes > Plugins > Mike's IA Plugin**.
- Ingresa tu **API Key** de OpenAI.
- Selecciona el **modelo** a utilizar (por ejemplo, `GPT-4o` o `o3-mini`).

> **Nota:** Si no configuras tu API Key, el plugin mostrará un aviso y no se podrán enviar solicitudes a la API de OpenAI.

## Desarrollo

### Prerrequisitos

- Node.js >= 14
- npm

### Instalación de dependencias

```bash
npm install
```

### Compilar en modo desarrollo

```bash
npm run dev
```

### Construir versión de producción

```bash
npm run build
```

### Estructura del proyecto

- **manifest.json**: Define la información básica del plugin (nombre, versión, descripción, etc.).
- **main.ts**: Contiene la lógica principal del plugin, incluyendo la creación del panel de chat, la integración con la API de OpenAI y la funcionalidad de notas diarias.
- **styles.css**: Estilos para el panel de chat y botones.

## Contribuir

Las contribuciones son bienvenidas. Si deseas mejorar el plugin, por favor sigue estos pasos:

1. **Clona el repositorio**
2. **Realiza tus cambios**
3. **Envía un Pull Request**

## Licencia

Este proyecto está licenciado bajo la [Licencia MIT](LICENSE).

## Autor

**Mike Ballesteros**  
[https://maballesteros.com](https://maballesteros.com)

---

¡Disfruta usando Mike's IA Plugin para potenciar tu productividad en Obsidian!