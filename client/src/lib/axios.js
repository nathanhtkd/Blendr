import axios from "axios";

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:4999/api" : "/api";

export const axiosInstance = axios.create({
	baseURL: BASE_URL,
	withCredentials: true,
});
