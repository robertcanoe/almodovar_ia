import type { APIRoute } from 'astro';
import OpenAI from 'openai';
import respuestas from '../../data/respuestas.json';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const SYSTEM_PROMPT = `Eres el asistente virtual oficial del Ayuntamiento de Almodóvar del Río, Córdoba, España. 
Debes ser cordial, profesional y proporcionar información precisa sobre el pueblo, su historia, cultura, servicios 
municipales y eventos. Si no estás seguro de algo, indícalo honestamente. Evita dar información sobre temas 
políticos controvertidos o datos sensibles. Responde siempre en español y de manera concisa.`;

function buscarRespuestaPredefinida(pregunta: string): string | null {
  for (const item of respuestas) {
    if (item.keywords.some((keyword: string) => pregunta.toLowerCase().includes(keyword.toLowerCase()))) {
      return item.respuesta;
    }
  }
  return null;
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const { pregunta } = await request.json();

    // Buscar respuesta predefinida
    const respuestaPredefinida = buscarRespuestaPredefinida(pregunta);
    if (respuestaPredefinida) {
      return new Response(
        JSON.stringify({ respuesta: respuestaPredefinida }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Si no hay respuesta predefinida, usar OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: pregunta }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    return new Response(
      JSON.stringify({ respuesta: completion.choices[0].message.content }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error: any) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: 'Lo siento, ha ocurrido un error al procesar tu pregunta.' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};