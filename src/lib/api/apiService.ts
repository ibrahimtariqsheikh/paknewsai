import axios from "axios";

export const apiClient = axios.create({
  baseURL: "http://192.168.0.148:8000",

  headers: {
    "Access-Control-Allow-Origin": "*",
  },
});
