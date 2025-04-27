#!/bin/bash

# Colores para los mensajes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}Configuración del Asistente Virtual de Almodóvar del Río${NC}\n"

# Verificar si .env existe
if [ -f .env ]; then
    echo -e "${GREEN}Archivo .env encontrado${NC}"
else
    echo -e "${BLUE}Creando archivo .env...${NC}"
    touch .env
fi

# Solicitar API key de OpenAI
echo -e "\n${BLUE}Por favor, introduce tu API key de OpenAI:${NC}"
read -r api_key

if [ -z "$api_key" ]; then
    echo -e "${RED}Error: La API key es necesaria${NC}"
    exit 1
fi

# Guardar la API key en .env
echo "OPENAI_API_KEY=$api_key" > .env

# Instalar dependencias
echo -e "\n${BLUE}Instalando dependencias...${NC}"
npm install

echo -e "\n${GREEN}¡Configuración completada!${NC}"
echo -e "\nPara iniciar el proyecto en desarrollo:"
echo -e "${BLUE}npm run dev${NC}"
echo -e "\nPara construir para producción:"
echo -e "${BLUE}npm run build${NC}"
echo -e "\nPara previsualizar la versión de producción:"
echo -e "${BLUE}npm run preview${NC}"

# Crear archivo README con instrucciones
echo -e "${BLUE}\nCreando documentación...${NC}"

cat > README.md << EOL
# Asistente Virtual de Almodóvar del Río 🏰

Un asistente virtual inteligente para proporcionar información sobre Almodóvar del Río, su historia, cultura, servicios municipales y eventos.

## Características

- 🤖 Asistente virtual con IA
- 📱 Diseño responsive
- 🌙 Modo oscuro
- 💾 Historial de conversaciones
- ✨ Animaciones suaves
- 🔍 Respuestas predefinidas para preguntas comunes

## Requisitos

- Node.js 16 o superior
- API key de OpenAI

## Instalación

1. Clonar el repositorio:
\`\`\`bash
git clone <url-del-repositorio>
cd almodovar-ia
\`\`\`

2. Ejecutar el script de configuración:
\`\`\`bash
chmod +x setup.sh
./setup.sh
\`\`\`

3. Iniciar el servidor de desarrollo:
\`\`\`bash
npm run dev
\`\`\`

## Desarrollo

- \`npm run dev\` - Inicia el servidor de desarrollo
- \`npm run build\` - Construye la aplicación para producción
- \`npm run preview\` - Previsualiza la versión de producción

## Despliegue

1. Construir la aplicación:
\`\`\`bash
npm run build
\`\`\`

2. Los archivos de producción estarán en la carpeta \`dist/\`

3. Configura las variables de entorno en tu servidor:
   - \`OPENAI_API_KEY\`: Tu API key de OpenAI

## Mantenimiento

Para actualizar las respuestas predefinidas, edita el archivo \`src/data/respuestas.json\`.

## Licencia

© $(date +%Y) Ayuntamiento de Almodóvar del Río. Todos los derechos reservados.
EOL

# Hacer el script ejecutable
chmod +x setup.sh

echo -e "\n${GREEN}¡Todo listo! Revisa el archivo README.md para más información.${NC}"