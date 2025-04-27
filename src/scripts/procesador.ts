import respuestas from '@data/respuestas.json';

// Función para limpiar y normalizar texto
function limpiarTexto(texto: string): string {
  let textoLimpio = texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Eliminar acentos
    .replace(/[^a-z0-9\s]/g, '') // Eliminar caracteres especiales
    .trim();

  // Lista de palabras ofensivas (ejemplo, ampliar según necesidad)
  const palabrasProhibidas = ['idiota', 'estupido', 'maldito'];
  palabrasProhibidas.forEach((palabra) => {
    const regex = new RegExp(`\\b${palabra}\\b`, 'gi');
    textoLimpio = textoLimpio.replace(regex, '');
  });

  return textoLimpio;
}

// Función para buscar respuesta en JSON
function buscarEnJSON(preguntaLimpia: string): string | null {
  for (const item of respuestas) {
    const keywords = item.keywords.map((kw) => kw.toLowerCase());
    if (keywords.some((kw) => preguntaLimpia.includes(kw))) {
      return item.respuesta;
    }
  }
  return null;
}

// Función para consultar el endpoint de OpenAI
async function consultarOpenAI(pregunta: string): Promise<string> {
  try {
    const response = await fetch('/api/pregunta', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ pregunta }),
    });

    const data = await response.json();
    if (response.ok) {
      return data.respuesta;
    } else {
      return data.error || 'Error al consultar la API.';
    }
  } catch (error) {
    console.error('Error al consultar el endpoint:', error);
    return 'Lo siento, hubo un error al procesar tu pregunta.';
  }
}

// Función principal para procesar preguntas
export async function procesarPregunta(pregunta: string): Promise<string> {
  const preguntaLimpia = limpiarTexto(pregunta);

  // Buscar en respuestas fijas
  const respuestaFija = buscarEnJSON(preguntaLimpia);
  if (respuestaFija) {
    return respuestaFija;
  }

  // Consultar OpenAI a través del endpoint
  return await consultarOpenAI(pregunta);
}