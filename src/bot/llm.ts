import { config } from './config';
import { saveMemory } from './memory';
import { googleManager } from './google';
import OpenAI from 'openai';

// Cliente LLM - puedes utilizar Groq, OpenAI u OpenRouter
const groq = new OpenAI({
  apiKey: config.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1',
});

const openrouter = new OpenAI({
  apiKey: config.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

// Definimos la estructura de nuestras herramientas
export const toolsDefinitions: any[] = [
  {
    type: "function",
    function: {
      name: "remember_fact",
      description: "Saves a key-value fact to the user's long-term memory.",
      parameters: {
        type: "object",
        properties: {
          key: { type: "string" },
          value: { type: "string" }
        },
        required: ["key", "value"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "execute_terminal_command",
      description: "Ejecuta un comando real en la terminal de Windows (git, ls, mkdir, etc.).",
      parameters: {
        type: "object",
        properties: {
          command: { type: "string", description: "El comando a ejecutar." }
        },
        required: ["command"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "gmail_list_emails",
      description: "Lista los correos electrónicos más recientes de la cuenta autorizada.",
      parameters: { type: "object", properties: {} }
    }
  },
  {
    type: "function",
    function: {
      name: "gmail_send_email",
      description: "Envía un correo electrónico a un destinatario específico.",
      parameters: {
        type: "object",
        properties: {
          to: { type: "string", description: "Email del destinatario." },
          subject: { type: "string", description: "Asunto del mensaje." },
          body: { type: "string", description: "Contenido (HTML permitido)." }
        },
        required: ["to", "subject", "body"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "calendar_list_events",
      description: "Lista los próximos eventos del Google Calendar.",
      parameters: { type: "object", properties: {} }
    }
  },
  {
    type: "function",
    function: {
      name: "calendar_create_event",
      description: "Crea un nuevo evento en el calendario.",
      parameters: {
        type: "object",
        properties: {
          summary: { type: "string" },
          location: { type: "string" },
          description: { type: "string" },
          start: { type: "string", description: "Formato ISO (ej: 2024-12-01T10:00:00Z)" },
          end: { type: "string", description: "Formato ISO (ej: 2024-12-01T11:00:00Z)" }
        },
        required: ["summary", "start", "end"]
      }
    }
  }
];

export async function transcribeAudio(audioBuffer: Buffer, fileName: string): Promise<string> {
  return "[Audio desactivado temporalmente]";
}

import { exec } from 'child_process';
import { promisify } from 'util';
const execAsync = promisify(exec);

export async function executeTool(name: string, args: any, userId: number): Promise<string> {
  console.log(`[Ejecutando Herramienta] -> ${name}`, args);
  switch (name) {
    case 'remember_fact':
      await saveMemory(userId, args.key, args.value);
      return `Dato recordado: ${args.key} = ${args.value}`;
    
    case 'execute_terminal_command':
      try {
        const { stdout, stderr } = await execAsync(args.command, { cwd: 'c:\\Users\\Bryce\\Paula proyecto' });
        return stdout || stderr || "Comando ejecutado sin salida.";
      } catch (error: any) {
        return `Error al ejecutar comando: ${error.message}`;
      }

    case 'gmail_list_emails':
      try {
        const emails = await googleManager.listRecentEmails();
        return JSON.stringify(emails, null, 2);
      } catch (error: any) {
        return `Error Gmail: ${error.message}`;
      }

    case 'gmail_send_email':
      try {
        return await googleManager.sendEmail(args.to, args.subject, args.body);
      } catch (error: any) {
        return `Error Gmail: ${error.message}`;
      }

    case 'calendar_list_events':
      try {
        const events = await googleManager.listEvents();
        return JSON.stringify(events, null, 2);
      } catch (error: any) {
        return `Error Calendar: ${error.message}`;
      }

    case 'calendar_create_event':
      try {
        return await googleManager.createEvent(args.summary, args.location || '', args.description || '', args.start, args.end);
      } catch (error: any) {
        return `Error Calendar: ${error.message}`;
      }

    case 'get_current_time':
      return new Date().toLocaleString();

    default:
      throw new Error(`Herramienta desconocida: ${name}`);
  }
}

export async function generateCompletion(messages: any[], tools: any[]): Promise<any> {
  try {
    // Intento 1: Groq (Rápido y gratis)
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages,
      tools: tools.length > 0 ? tools : undefined,
      tool_choice: tools.length > 0 ? "auto" : undefined,
    });
    return response.choices[0].message;
  } catch (error: any) {
    console.warn("[GROQ ERROR] -> Escalando a OpenRouter...", error.message);
    // Intento 2: OpenRouter (Respaldo Premium)
    const response = await openrouter.chat.completions.create({
      model: config.OPENROUTER_MODEL || "anthropic/claude-3.5-sonnet",
      messages,
      tools: tools.length > 0 ? tools : undefined,
      tool_choice: tools.length > 0 ? "auto" : undefined,
    });
    return response.choices[0].message;
  }
}
