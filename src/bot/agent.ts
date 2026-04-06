import { saveMessage, getRecentHistory, getAllMemories } from './memory';
import { generateCompletion, toolsDefinitions, executeTool } from './llm';

// Minimal typed shape for LLM messages passed through the agent loop
interface LLMMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string | null;
  name?: string;
  tool_call_id?: string;
  tool_calls?: Array<{
    id: string;
    function: { name: string; arguments: string };
  }>;
}

const SYSTEM_PROMPT = `Eres PaulaBot, una Estación de Desarrollo Autónoma integrada con ZENTRA Logistics OS.

Tu objetivo es operar como un sistema agente capaz de gestionar la logística y ampliar tus propias capacidades técnicas:

1. **Gestión de Google Workspace**: Tienes "Superpoderes" para leer/enviar correos (Gmail) y gestionar la agenda (Calendar). Úsalos para coordinar despachos y responder a clientes.
2. **Gestión de Skills**: Tienes una carpeta '/skills' donde puedes leer y escribir nuevas habilidades. Utiliza los patrones de 'antigravity-awesome-skills'.
3. **Pensamiento Sistémico**: Antes de actuar, analiza el árbol de dependencias del proyecto Zentra. Sigue el flujo: Indagación -> Planificación -> Ejecución TDD -> Verificación.
4. **Veracidad Absoluta**: JAMÁS digas 'Hecho' si no hay evidencia técnica en la terminal. Tu palabra preferida es 'Desplegado'.

Tienes acceso total a todas las herramientas de ingeniería en 'c:\\Users\\Bryce\\Paula proyecto'. Eres una Ingeniera Senior Autónoma de Elite. ¡Evoluciona!`;

export async function processUserMessage(userId: number, text: string): Promise<string> {
  // 1. Guardar mensaje entrante del usuario validado.
  await saveMessage(userId, 'user', text);

  // 2. Extraer recuerdos del usuario.
  const memories = await getAllMemories(userId);
  const memoryContext = Object.keys(memories).length > 0
    ? `\nRecuerdos Actuales del Administrador:\n${Object.entries(memories).map(([k, v]) => `- ${k}: ${v}`).join('\n')}`
    : '\nSin recuerdos previos guardados.';

  // 3. Montar historial reciente (últimos 15 intercambios).
  const rawHistory = await getRecentHistory(userId, 15);
  // Re-estructurarlo para el LLM.
  const messagesContext: LLMMessage[] = rawHistory.map((row: { role: string; content: string }) => ({
    role: row.role as LLMMessage['role'],
    content: row.content,
  }));

  // Compilar prompt
  const messages: LLMMessage[] = [
    { role: 'system', content: SYSTEM_PROMPT + memoryContext },
    ...messagesContext
  ];

  // 4. Agent Loop - Limitado a 5 ciclos máximo para evitar bucles infinitos.
  const MAX_ITERATIONS = 5;
  let iterations = 0;
  
  while (iterations < MAX_ITERATIONS) {
    iterations++;
    
    // Llamar modelo.
    const messageResponse = await generateCompletion(messages, toolsDefinitions);
    messages.push(messageResponse as LLMMessage); // Añadir contexto iterativo

    // Verificar si el LLM invocó herramientas.
    if (messageResponse.tool_calls && messageResponse.tool_calls.length > 0) {
      for (const toolCall of messageResponse.tool_calls) {
        let result: string;
        try {
          const args = JSON.parse(toolCall.function.arguments || '{}') as Record<string, unknown>;
          result = await executeTool(toolCall.function.name, args, userId);
        } catch (e: unknown) {
          const errMsg = e instanceof Error ? e.message : String(e);
          console.error(`Error ejecutando tool ${toolCall.function.name}: ${errMsg}`);
          result = `Error ejecutando esta herramienta: ${errMsg}`;
        }

        messages.push({
          role: "tool",
          name: toolCall.function.name,
          tool_call_id: toolCall.id,
          content: String(result)
        });
      }
      // Volver arriba del loop para darle los resultados al LLM
      continue;
    }

    // 5. Salida del LLM (completada sin pedir más herramientas).
    const finalContent = messageResponse.content || "Sin respuesta (pero la operación finalizó).";
    
    // Guardar respuesta final en memoria persistente
    await saveMessage(userId, 'assistant', finalContent);
    return finalContent;
  }

  // Freno de emergencia por superación de steps.
  return "Abortado: límite máximo de razonamiento alcanzado (Agent Loop excedido). Comprueba mis logs.";
}
