import axios from "axios";
import {useAuthStore} from "../store/authStore.js";

class AuthService {
    
    async login(user) {
        return this.getAxiosInstance().post("/api/token/", {
            username: user.username,
            password: user.password,
        });
    }
    signUp(user) {
      const accessToken = this.getAccessToken();
      return this.getAxiosInstance().post("/api/v1/user/", {
          username: user.username,
          email: user.email,
          password:user.password,
          password_conf: user.password_conf,
        }, {
          headers: {
              Authorization: `Bearer ${accessToken}`
          }
        });
    }

    refresh(refreshToken) {

        return Promise.resolve(
            JSON.stringify({
                access: "mockAccessToken",
            })
        );
    }

    logout() {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
    }

    getAccessToken() {
        return localStorage.getItem("access");
    }

    getRefreshToken() {
        return localStorage.getItem("refresh");
    }

    isLoggedIn() {
        return !!localStorage.getItem("access");
    }

    getAxiosInstance() {
        const apiUrl = import.meta.env.VITE_API_URL;
        const accessToken = this.getAccessToken();

        const instance = axios.create({
            baseURL: apiUrl,
            headers: {
                Authorization: `Bearer ${accessToken}`
            },
        });
        instance.interceptors.response.use(
            (response) => response,
            async (error) => {
                if (error.response.status === 401 && this.isLoggedIn()) {
                    try {
                        const response = await this.refresh(this.getRefreshToken());
                        localStorage.setItem("access", response.data.access);
                        error.config.headers["Authorization"] =
                            "Bearer " + response.data.access;

                        return axios.request(error.config);
                    } catch (err) {
                        this.logout();
                    }
                }
                return Promise.reject(error);
            }
        );
        return instance;
    }
}

export default new AuthService();
