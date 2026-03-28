import { config } from './config';
import { saveMemory } from './memory';
import OpenAI from 'openai';

// Cliente LLM - puedes utilizar Groq, OpenAI u OpenRouter
const client = new OpenAI({
  apiKey: config.GROQ_API_KEY || config.OPENROUTER_API_KEY,
  baseURL: config.GROQ_API_KEY ? 'https://api.groq.com/openai/v1' : 'https://openrouter.ai/api/v1',
});

// Modelo estándar actualizado (Groq recomienda llama-3.3-70b-versatile)
const MODEL = config.GROQ_API_KEY ? 'llama-3.3-70b-versatile' : config.OPENROUTER_MODEL;

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
      name: "google_workspace_gog",
      description: "Ejecuta comandos de Google Workspace usando gog.exe.",
      parameters: {
        type: "object",
        properties: {
          command: { type: "string", description: "El comando de gog a ejecutar." }
        },
        required: ["command"]
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
    case 'get_current_time':
      return new Date().toLocaleString();
    default:
      throw new Error(`Herramienta desconocida: ${name}`);
  }
}

const openrouter = new OpenAI({
  apiKey: config.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

export async function generateCompletion(messages: any[], userId: number): Promise<any> {
  try {
    // Intento 1: Groq (Rápido y gratis)
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages,
      tools: toolsDefinitions,
      tool_choice: toolsDefinitions.length > 0 ? "auto" : undefined,
    });
    return response.choices[0].message;
  } catch (error: any) {
    if (error.status === 429 || error.status >= 500) {
      console.log("[GROQ LIMIT REACHED] -> Escalandado a OpenRouter...");
      // Intento 2: OpenRouter (Respaldo Premium)
      const response = await openrouter.chat.completions.create({
        model: "anthropic/claude-3.5-sonnet",
        messages,
        tools: toolsDefinitions,
        tool_choice: toolsDefinitions.length > 0 ? "auto" : undefined,
      });
      return response.choices[0].message;
    }
    throw error;
  }
}
```
