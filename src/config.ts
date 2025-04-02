import { getCurrentEnvironment } from './config/environments';

const env = getCurrentEnvironment();
export const API_BASE_URL = env.apiBaseUrl; 