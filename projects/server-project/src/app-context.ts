import type { Express } from 'express';

let appInstance: Express | null = null;

export const setAppInstance = (app: Express) => {
  appInstance = app;
};

export const getAppInstance = () => {
  if (!appInstance) {
    throw new Error('Express app has not been initialised yet.');
  }

  return appInstance;
};
