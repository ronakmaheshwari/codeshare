import axios from "axios"

declare global {
  interface Window {
    env_?: {
      VITE_API_URL: string;
      VITE_WEBSOCKET_URL: string;
    };
  }
}

export async function getConfig() {
  return {
    apiUrl: window.env_?.VITE_API_URL,
    websocketUrl: window.env_?.VITE_WEBSOCKET_URL,
  };
}

const api = axios.create();

api.interceptors.request.use(async (config) => {
  const { apiUrl } = await getConfig();
  config.baseURL = apiUrl;
  return config;
});

export default api