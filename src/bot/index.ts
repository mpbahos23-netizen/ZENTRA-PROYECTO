import { Bot, Context } from 'grammy';
import { config, isUserAllowed } from './config';
import { processUserMessage } from './agent';
import { transcribeAudio } from './llm';
import axios from 'axios';

const bot = new Bot(config.TELEGRAM_BOT_TOKEN);

bot.use(async (ctx: Context, next: Function) => {
  const userId = ctx.from?.id;
  
  // Whitelist de Telegram user ID (Seguridad como prioridad)
  if (!isUserAllowed(userId)) {
    console.warn(`[Seguridad] Usuario bloqueado intentó acceder: ${userId}`);
    return;
  }
  await next();
});

bot.command("start", async (ctx) => {
  await ctx.reply("Conexión segura establecida. PaulaBot inicializado en memoria Cloud Firestore. Sistemas operativos.");
});

// --- MANEJO DE TEXTO ---
bot.on("message:text", async (ctx) => {
  const userId = ctx.from!.id;
  await ctx.api.sendChatAction(ctx.chat.id, "typing");
  
  try {
    const replyText = await processUserMessage(userId, ctx.message.text);
    await ctx.reply(replyText);
  } catch (error: any) {
    console.error(`[Fatal Error Text]`, error);
    await ctx.reply(`[Fallo en los sistemas cognitivos] - ${error.message}`);
  }
});

// --- MANEJO DE VOZ (GROQ WHISPER) ---
bot.on("message:voice", async (ctx) => {
  const userId = ctx.from!.id;
  await ctx.api.sendChatAction(ctx.chat.id, "typing");

  try {
    const file = await ctx.getFile();
    const fileUrl = `https://api.telegram.org/file/bot${config.TELEGRAM_BOT_TOKEN}/${file.file_path}`;
    
    // Descargar el audio
    const response = await axios.get(fileUrl, { responseType: 'arraybuffer' });
    const audioBuffer = Buffer.from(response.data);

    // Transcribir con Groq Whisper
    const transcription = await transcribeAudio(audioBuffer, 'voice_note.oga');
    console.log(`[Transcripción] -> ${transcription}`);

    // Procesar como si fuera texto
    const replyText = await processUserMessage(userId, transcription);
    
    // Opcional: Indicar qué escuchó antes de la respuesta
    await ctx.reply(`🎤 _Escuché:_ "${transcription}"`, { parse_mode: "Markdown" });
    await ctx.reply(replyText);

  } catch (error: any) {
    console.error(`[Fatal Error Voice]`, error);
    await ctx.reply(`[Error procesando audio] - ${error.message}`);
  }
});

bot.catch((err) => {
  console.error(`[Error Telegram Grammy] ${err.message}`);
});

export const startPaula = () => {
  console.log(`✅ [PaulaBot] Whitelist activa para el ID(s): ${config.TELEGRAM_ALLOWED_USER_IDS.join(', ')}`);
  console.log(`✅ [PaulaBot] Iniciando Long Polling en Telegram.`);
  bot.start();
};

startPaula();
