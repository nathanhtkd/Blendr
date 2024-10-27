import axios from "axios";

export const axiosInstance = axios.create({
	baseURL: import.meta.env.PROD 
		? '/.netlify/functions/api'
		: 'http://localhost:4999/api',
	withCredentials: true
});
