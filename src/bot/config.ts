import { config as dotenvConfig } from 'dotenv';
dotenvConfig();

function getEnvVar(key: string, required: boolean = true): string {
  const value = process.env[key];
  if (required && !value) {
    throw new Error(`Configuración faltante: ${key} es obligatorio en .env`);
  }
  return value || '';
}

export const config = {
  TELEGRAM_BOT_TOKEN: getEnvVar('TELEGRAM_BOT_TOKEN'),
  TELEGRAM_ALLOWED_USER_IDS: getEnvVar('TELEGRAM_ALLOWED_USER_IDS').split(',').map(id => parseInt(id.trim(), 10)),
  GROQ_API_KEY: getEnvVar('GROQ_API_KEY', false), // Usada si el usuario lo prefiere
  OPENROUTER_API_KEY: getEnvVar('OPENROUTER_API_KEY', false), // Sugerido
  OPENROUTER_MODEL: getEnvVar('OPENROUTER_MODEL', false) || 'openrouter/free',
};

export const firebaseConfig = {
  apiKey: getEnvVar('FIREBASE_API_KEY'),
  authDomain: getEnvVar('FIREBASE_AUTH_DOMAIN'),
  projectId: getEnvVar('FIREBASE_PROJECT_ID'),
  storageBucket: getEnvVar('FIREBASE_STORAGE_BUCKET', false),
  messagingSenderId: getEnvVar('FIREBASE_MESSAGING_SENDER_ID', false),
  appId: getEnvVar('FIREBASE_APP_ID', false)
};

// Función de seguridad principal
export function isUserAllowed(userId: number | undefined): boolean {
  if (!userId) return false;
  return config.TELEGRAM_ALLOWED_USER_IDS.includes(userId);
}
