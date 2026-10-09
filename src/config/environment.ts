function requiredEnvironmentVariable(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

const configuredPort = process.env.PORT || '5000';
const port = /^\d+$/.test(configuredPort)
  ? Number.parseInt(configuredPort, 10)
  : Number.NaN;
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('PORT must be a valid TCP port number.');
}

function createMongoUri(): string {
  const configuredUri = process.env.MONGODB_URI?.trim();
  if (configuredUri) return configuredUri;

  const username = encodeURIComponent(requiredEnvironmentVariable('DB_USER'));
  const password = encodeURIComponent(requiredEnvironmentVariable('DB_PASS'));
  return `mongodb+srv://${username}:${password}@cluster0.flzolds.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
}

export const environment = {
  port,
  mongoUri: createMongoUri(),
  databaseName: process.env.DB_NAME?.trim() || 'coredenz',
  corsOrigins: (process.env.CORS_ORIGINS || 'http://localhost:3000')
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean),
};
