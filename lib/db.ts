if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'file:./prisma/dev.db';
}

let prismaInstance: any = null;

function getPrismaClient() {
  if (prismaInstance) return prismaInstance;
  try {
    const { PrismaClient } = require('@prisma/client');
    prismaInstance = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error']
    });
    return prismaInstance;
  } catch (err) {
    console.warn('PrismaClient initialization failed (running in serverless zero-DB mode):', err);
    return null;
  }
}

export const prisma = new Proxy({} as any, {
  get(_target, prop) {
    const client = getPrismaClient();
    if (!client) {
      // Return a dummy proxy model that rejects queries gracefully so try/catch handles it
      return new Proxy({}, {
        get() {
          return () => Promise.reject(new Error('Prisma database unavailable on serverless'));
        }
      });
    }
    return client[prop];
  }
});

export default prisma;
