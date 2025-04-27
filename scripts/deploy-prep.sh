#!/bin/bash

# Colores para mensajes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}Preparando el proyecto para despliegue...${NC}\n"

# Verificar dependencias
echo -e "Verificando dependencias..."
npm install

# Ejecutar comprobación de tipos
echo -e "\nEjecutando comprobación de tipos..."
npm run type-check

# Construir el proyecto
echo -e "\nConstruyendo el proyecto..."
npm run build

# Verificar archivos necesarios
echo -e "\nVerificando archivos necesarios..."
required_files=(".env" "public/favicon.svg" "public/apple-touch-icon.png" "public/castillo-background.jpg")

for file in "${required_files[@]}"; do
  if [ ! -f "$file" ]; then
    echo -e "${RED}Error: Falta el archivo $file${NC}"
    exit 1
  fi
done

# Verificar API key de OpenAI
if ! grep -q "OPENAI_API_KEY" .env; then
  echo -e "${RED}Error: No se encuentra OPENAI_API_KEY en el archivo .env${NC}"
  exit 1
fi

echo -e "\n${GREEN}¡Proyecto listo para desplegar!${NC}"
echo -e "\nRecuerda:"
echo -e "1. Configurar las variables de entorno en tu servidor"
echo -e "2. Configurar los encabezados de seguridad"
echo -e "3. Habilitar HTTPS"
echo -e "4. Configurar el caché del servidor"

# Crear archivo de verificación
echo "Este sitio pertenece al Ayuntamiento de Almodóvar del Río" > dist/siteverification.txt

echo -e "\n${BLUE}Los archivos de distribución están en la carpeta 'dist/'${NC}"