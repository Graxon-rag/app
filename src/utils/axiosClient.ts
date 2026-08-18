import axios, { AxiosError } from "axios";
import toast from "react-hot-toast";

export const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_SERVER_URL ?? "http://localhost:8888",
  withCredentials: true,
});

axiosClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string; error?: string; detail?: string }>) => {
    // Skip global toast for 401 — handle auth/redirect separately
    if (error.response?.status === 401 || error.response?.status === 404) {
      return Promise.reject(error);
    }

    let message = "Something went wrong. Please try again.";

    if (error.response) {
      message =
        error.response.data?.detail ??
        error.response.data?.message ??
        error.response.data?.error ??
        error.response.statusText ??
        message;
    } else if (error.request) {
      message = "Unable to reach the server. Check your connection.";
    } else {
      message = error.message;
    }

    toast.error(message);

    return Promise.reject(error);
  },
);
