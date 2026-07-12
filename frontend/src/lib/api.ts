import axios from "axios"
let httpUrl: string | undefined;
let websocketUrl: string | undefined;

const configPromise = fetch("/api/config")
  .then(res => res.json())
  .then((config) => {
    httpUrl = config.apiUrl;
    websocketUrl = config.websocketUrl;
    return config;
  });

export const getConfig = () => configPromise;

const api = axios.create();

api.interceptors.request.use(async (config) => {
  await configPromise;
  config.baseURL = httpUrl;
  return config;
});

export { httpUrl, websocketUrl };

export default api