const rawBackendServer = import.meta.env.VITE_BACKEND_SERVER || 'http://localhost:8888/';
const backendServer = rawBackendServer.endsWith('/') ? rawBackendServer : rawBackendServer + '/';

export const API_BASE_URL =
  import.meta.env.PROD || import.meta.env.VITE_DEV_REMOTE == 'remote'
    ? backendServer + 'api/'
    : 'http://localhost:8888/api/';
export const BASE_URL =
  import.meta.env.PROD || import.meta.env.VITE_DEV_REMOTE
    ? backendServer
    : 'http://localhost:8888/';

export const WEBSITE_URL = import.meta.env.PROD
  ? 'http://cloud.cognivioapp.com/'
  : 'http://localhost:3000/';
export const DOWNLOAD_BASE_URL =
  import.meta.env.PROD || import.meta.env.VITE_DEV_REMOTE
    ? backendServer + 'download/'
    : 'http://localhost:8888/download/';
export const ACCESS_TOKEN_NAME = 'x-auth-token';

export const FILE_BASE_URL = import.meta.env.VITE_FILE_BASE_URL || backendServer;
