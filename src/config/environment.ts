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
  let mongoUri = process.env.MONGODB_URI?.trim();
  if (!mongoUri) {
    const username = encodeURIComponent(requiredEnvironmentVariable('DB_USER'));
    const password = encodeURIComponent(requiredEnvironmentVariable('DB_PASS'));
    mongoUri = `mongodb+srv://${username}:${password}@coredenzcluster.3lgwfez.mongodb.net/?appName=CoredenzCluster`;
  }

  if (!mongoUri.startsWith('mongodb://') && !mongoUri.startsWith('mongodb+srv://')) {
    throw new Error('MONGODB_URI must start with "mongodb://" or "mongodb+srv://".');
  }
  return mongoUri;
}

export const environment = {
  port,
  mongoUri: createMongoUri(),
  databaseName: process.env.DB_NAME?.trim() || 'coredenzDB',
  corsOrigins: (process.env.CORS_ORIGINS || 'http://localhost:3000')
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean),
};
