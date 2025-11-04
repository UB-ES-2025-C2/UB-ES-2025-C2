import axios from 'axios'

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
  async login(user) {
    return this.getAxiosInstance().post('/api/token/', {
      username: user.username,
      password: user.password,
    })
  }

  refresh(refreshToken) {
    return Promise.resolve(
      JSON.stringify({
        access: 'mockAccessToken',
      }),
    )
  }

  logout() {
    localStorage.removeItem('access')
    localStorage.removeItem('refresh')
  }

  getAccessToken() {
    return localStorage.getItem('access')
  }

  getRefreshToken() {
    return localStorage.getItem('refresh')
  }

  isLoggedIn() {
    return !!localStorage.getItem('access')
  }
  postSong(song) {
    const res = this.getAxiosInstance().post(
        `/api/v1/songs/`,
       song
    );
    return res;
  }
  getUserByToken() {
    // El header Authorization ja s'afegeix per getAxiosInstance()
    return this.getAxiosInstance().get(`/api/v1/userprofile/by-token/`)
  }
  changeProfilePicture(id, file) {
    const formData = new FormData();
    formData.append('profilePic', file);
    return this.getAxiosInstance().patch(
      `/api/v1/userprofile/${id}/`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );
  }

  getAxiosInstanceGuest() {
    const apiUrl = import.meta.env.VITE_API_URL

    const instance = axios.create({
      baseURL: apiUrl,
    })
    return instance
  }

  getAxiosInstance() {
    const apiUrl = import.meta.env.VITE_API_URL
    const accessToken = this.getAccessToken()

    const instance = axios.create({
      baseURL: apiUrl,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
    instance.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response.status === 401 && this.isLoggedIn()) {
          try {
            const response = await this.refresh(this.getRefreshToken())
            localStorage.setItem('access', response.data.access)
            error.config.headers['Authorization'] = 'Bearer ' + response.data.access

            return axios.request(error.config)
          } catch (err) {
            this.logout()
          }
        }
        return Promise.reject(error)
      },
    )
    return instance
  }
}

export default new AuthService()
