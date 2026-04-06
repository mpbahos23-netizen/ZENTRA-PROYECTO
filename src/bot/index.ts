import { Bot, Context } from 'grammy';
import { config, isUserAllowed } from './config';
import { processUserMessage } from './agent';
import { transcribeAudio } from './llm';
import { googleManager } from './google';
import axios from 'axios';

const bot = new Bot(config.TELEGRAM_BOT_TOKEN);

bot.use(async (ctx: Context, next: () => Promise<void>) => {
  const userId = ctx.from?.id;
  
  // Whitelist de Telegram user ID (Seguridad como prioridad)
  if (!isUserAllowed(userId)) {
    console.warn(`[Seguridad] Usuario bloqueado intentó acceder: ${userId}`);
    return;
  }
  await next();
});

bot.command("start", async (ctx) => {
  await ctx.reply("🚀 PaulaBot inicializado. Gestión logística y autonomía cognitiva activa.\n\nUsa /google_auth para conectar tus servicios de Google Workspace.");
});

bot.command("google_auth", async (ctx) => {
  try {
    const authUrl = await googleManager.getAuthUrl();
    await ctx.reply(`🔓 *Autorización de Google Workspace*\n\nPor favor, abre este enlace, autoriza a Paula y pega el código aquí:\n\n[ENLACE DE AUTORIZACIÓN](${authUrl})`, { parse_mode: "Markdown" });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    await ctx.reply(`❌ Error preparando Auth: ${msg}`);
  }
});

// --- MANEJO DE TEXTO ---
bot.on("message:text", async (ctx) => {
  const userId = ctx.from!.id;
  const text = ctx.message.text;

  // Interceptar código de autorización de Google (Suele ser largo y sin espacios)
  if (text.length > 40 && !text.includes(' ')) {
    await ctx.reply("⚙️ Procesando código de seguridad de Google...");
    try {
      await googleManager.setToken(text);
      await ctx.reply("✅ ¡Conexión con Google Workspace Establecida! Ahora puedo gestionar tu Gmail y Calendar.");
      return;
    } catch (_e: unknown) {
      // Si falla, quizás no era un código de Google, proceder al flujo normal.
    }
  }

  await ctx.api.sendChatAction(ctx.chat.id, "typing");
  
  try {
    const replyText = await processUserMessage(userId, text);
    await ctx.reply(replyText);
  } catch (error: unknown) {
    console.error(`[Fatal Error Text]`, error);
    const msg = error instanceof Error ? error.message : String(error);
    await ctx.reply(`[Fallo en los sistemas cognitivos] - ${msg}`);
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

  } catch (error: unknown) {
    console.error(`[Fatal Error Voice]`, error);
    const msg = error instanceof Error ? error.message : String(error);
    await ctx.reply(`[Error procesando audio] - ${msg}`);
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
