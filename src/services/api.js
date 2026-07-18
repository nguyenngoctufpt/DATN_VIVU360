import axios from "axios";
import Constants from "expo-constants";

const expoHost = Constants.expoConfig?.hostUri?.split(':')[0];
const apiBaseUrl = process.env.EXPO_PUBLIC_API_URL
    || (expoHost ? `http://${expoHost}:3000/api` : "http://localhost:3000/api");

const api = axios.create({
    baseURL: apiBaseUrl,
    timeout: 5000,
})

export default api;
