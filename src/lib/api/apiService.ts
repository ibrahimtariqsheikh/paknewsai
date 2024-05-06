import axios from "axios";

//random base url
const BASE_URL = "http://localhost:4000";

export const apiClient = axios.create({
  baseURL: BASE_URL,
});
