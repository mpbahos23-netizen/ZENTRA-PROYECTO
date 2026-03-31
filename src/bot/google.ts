import { google } from 'googleapis';
import { config as botConfig } from './config';
import fs from 'fs';
import path from 'path';

// Scopes necesarios para la autonomía de Paula
const SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/drive.file'
];

const TOKEN_PATH = path.join(process.cwd(), 'token.json');
const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

export class GoogleWorkspaceManager {
  private oauth2Client: any;

  constructor() {
    this.oauth2Client = null;
  }

  async authorize() {
    if (this.oauth2Client) return this.oauth2Client;

    let credentials;
    try {
      // Intentar leer desde el path estándar
      const content = fs.readFileSync(CREDENTIALS_PATH, 'utf8');
      credentials = JSON.parse(content);
    } catch (err) {
      // Intento de respaldo: buscar el archivo que Paula tiene abierto en el log
      try {
        const altPath = 'c:\\Users\\Bryce\\Paula_proyecto\\client_secret_939852066639-e3sslee0022s1u1tuls7674aorkk2g3r.apps.googleusercontent.com.json';
        const content = fs.readFileSync(altPath, 'utf8');
        credentials = JSON.parse(content);
        console.log("✅ [Google] Credenciales cargadas desde el archivo externo.");
      } catch (e) {
        throw new Error("No se encontró el archivo de credenciales (credentials.json). Por favor, guárdalo en la raíz del proyecto.");
      }
    }

    const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;
    this.oauth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

    // Verificar si ya tenemos un token guardado
    try {
      const token = fs.readFileSync(TOKEN_PATH, 'utf8');
      this.oauth2Client.setCredentials(JSON.parse(token));
    } catch (err) {
      console.warn("⚠️ [Google] Token no encontrado. Se requiere re-autenticación via Telegram.");
      return null; // El bot deberá generar la URL de auth
    }

    return this.oauth2Client;
  }

  getAuthUrl() {
    const authUrl = this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
    });
    return authUrl;
  }

  async setToken(code: string) {
    const { tokens } = await this.oauth2Client.getToken(code);
    this.oauth2Client.setCredentials(tokens);
    fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
    return tokens;
  }

  // --- GMAIL ---
  async listRecentEmails() {
    const auth = await this.authorize();
    const gmail = google.gmail({ version: 'v1', auth });
    const res = await gmail.users.messages.list({ userId: 'me', maxResults: 5 });
    return res.data.messages || [];
  }

  async sendEmail(to: string, subject: string, body: string) {
    const auth = await this.authorize();
    const gmail = google.gmail({ version: 'v1', auth });
    const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`;
    const messageParts = [
      `From: PaulaBot <m.pbahos23@gmail.com>`,
      `To: ${to}`,
      `Content-Type: text/html; charset=utf-8`,
      `MIME-Version: 1.0`,
      `Subject: ${utf8Subject}`,
      '',
      body,
    ];
    const message = messageParts.join('\n');
    const encodedMessage = Buffer.from(message)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
    
    await gmail.users.messages.send({
      userId: 'me',
      requestBody: { raw: encodedMessage },
    });
    return "Email enviado con éxito.";
  }

  // --- CALENDAR ---
  async listEvents() {
    const auth = await this.authorize();
    const calendar = google.calendar({ version: 'v3', auth });
    const res = await calendar.events.list({
      calendarId: 'primary',
      timeMin: new Date().toISOString(),
      maxResults: 10,
      singleEvents: true,
      orderBy: 'startTime',
    });
    return res.data.items || [];
  }

  async createEvent(summary: string, location: string, description: string, start: string, end: string) {
    const auth = await this.authorize();
    const calendar = google.calendar({ version: 'v3', auth });
    const event = {
      summary, location, description,
      start: { dateTime: start, timeZone: 'America/Bogota' },
      end: { dateTime: end, timeZone: 'America/Bogota' },
    };
    const res = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: event,
    });
    return `Evento creado: ${res.data.htmlLink}`;
  }
}

export const googleManager = new GoogleWorkspaceManager();
