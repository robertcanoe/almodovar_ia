import type { APIRoute } from 'astro';
import OpenAI from 'openai';
import respuestas from '../../data/respuestas.json';
import { RateLimiter } from '../../utils/rateLimiter';

// Validate API key
if (!import.meta.env.OPENAI_API_KEY || import.meta.env.OPENAI_API_KEY === 'tu-api-key-aqui') {
  console.error('⚠️ OpenAI API key no configurada. Por favor, configura OPENAI_API_KEY en el archivo .env');
}

// Initialize rate limiter (10 requests per minute per IP)
const limiter = new RateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 10
});

// Initialize OpenAI only if we have a valid API key
let openai: OpenAI | null = null;
if (import.meta.env.OPENAI_API_KEY && import.meta.env.OPENAI_API_KEY !== 'tu-api-key-aqui') {
  openai = new OpenAI({
    apiKey: import.meta.env.OPENAI_API_KEY
  });
}

const SYSTEM_PROMPT = `Eres el asistente virtual oficial del Ayuntamiento de Almodóvar del Río, Córdoba, España. 
Debes ser cordial, profesional y proporcionar información precisa sobre el pueblo, su historia, cultura, servicios 
municipales y eventos. Si no estás seguro de algo, indícalo honestamente. Evita dar información sobre temas 
políticos controvertidos o datos sensibles. Responde siempre en español y de manera concisa.

Puedes usar Markdown para formatear tus respuestas, por ejemplo:
- Usa **texto en negrita** para enfatizar lugares importantes
- Usa *cursiva* para términos específicos
- Usa listas con guiones para enumerar
- Usa [texto](URL) para enlaces
- Usa \`código\` para horarios o direcciones

Para URLs, usa siempre el formato completo (https://...)`;

function buscarRespuestaPredefinida(pregunta: string): string | null {
  const preguntaLower = pregunta.toLowerCase();
  for (const item of respuestas) {
    if (item.keywords.some(keyword => preguntaLower.includes(keyword.toLowerCase()))) {
      return item.respuesta;
    }
  }
  return null;
}

export const POST: APIRoute = async ({ request }) => {
  try {
    // Get client IP
    const clientIP = request.headers.get('x-forwarded-for') || 'unknown-ip';
    
    // Check rate limit
    const rateLimitResult = limiter.check(clientIP);
    if (!rateLimitResult.allowed) {
      return new Response(
        JSON.stringify({
          error: 'Has excedido el límite de preguntas. Por favor, espera un momento.',
          resetTime: new Date(rateLimitResult.resetTime).toISOString()
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': rateLimitResult.resetTime.toString()
          }
        }
      );
    }

    // Validate request body
    let body;
    try {
      body = await request.json();
    } catch (e) {
      return new Response(
        JSON.stringify({ error: 'El formato de la petición es inválido' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    if (!body?.pregunta) {
      return new Response(
        JSON.stringify({ error: 'La pregunta es requerida' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const { pregunta } = body;

    // Validate question length
    if (pregunta.length > 500) {
      return new Response(
        JSON.stringify({ error: 'La pregunta es demasiado larga. Máximo 500 caracteres.' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Check for predefined response
    const respuestaPredefinida = buscarRespuestaPredefinida(pregunta);
    if (respuestaPredefinida) {
      return new Response(
        JSON.stringify({ respuesta: respuestaPredefinida }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString()
          }
        }
      );
    }

    // Check if OpenAI is properly configured
    if (!openai) {
      return new Response(
        JSON.stringify({ 
          error: 'El servicio de IA no está configurado correctamente. Por favor, contacta con el administrador.',
          details: 'OpenAI API key no configurada'
        }),
        {
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: pregunta }
        ],
        temperature: 0.7,
        max_tokens: 800,
        presence_penalty: 0.6,
        frequency_penalty: 0.2
      });

      return new Response(
        JSON.stringify({ respuesta: completion.choices[0].message.content }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString()
          }
        }
      );
    } catch (error: any) {
      console.error('OpenAI Error:', error);
      return new Response(
        JSON.stringify({ 
          error: 'Error al procesar la pregunta. Por favor, inténtalo de nuevo más tarde.',
          details: import.meta.env.DEV ? error.message : undefined
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  } catch (error: any) {
    console.error('General Error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Ha ocurrido un error inesperado.',
        details: import.meta.env.DEV ? error.message : undefined
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};