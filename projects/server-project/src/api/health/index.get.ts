import { eventHandler } from 'h3';

export default eventHandler(() => ({ status: 'ok', timestamp: Date.now() }));
