import axios from 'axios'

class AuthService {

  constructor() {
    this.apiUrl = import.meta.env.VITE_API_URL
    this.axiosInstance = this.createAxiosInstance()
  }

  async login(user) {
    /*return this.getAxiosInstance().post('/api/token/', {
      username: user.username,
      password: user.password,
    })*/
      return axios.post(`${this.apiUrl}/api/token/`, {
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
  postSong(formData) {
    const accessToken = this.getAccessToken();
    return this.getAxiosInstance().post("/api/v1/songs/",
      formData,
      {
        headers:
        {
          Authorization: `Bearer ${accessToken}`,
          ...formData.getHeaders()
        }
      });
  }

  refresh(refreshToken) {
    const apiUrl = import.meta.env.VITE_API_URL; // o tu URL base
    return axios.post(`${apiUrl}/api/token/refresh/`, { refresh: refreshToken });
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

  // ---- Refresh token ----
  async refreshToken() {
    const refresh = this.getRefreshToken()
    if (!refresh) throw new Error('No refresh token available')

    const response = await axios.post(`${this.apiUrl}/api/token/refresh/`, {
      refresh
    })
    localStorage.setItem('access', response.data.access)
    return response.data.access
  }

  // ---- Axios Instance con Interceptor ----
  createAxiosInstance() {
    const instance = axios.create({
      baseURL: this.apiUrl,
    })

    // Interceptor para agregar Authorization y refrescar token si hace falta
    instance.interceptors.request.use(async (config) => {
        let token = this.getAccessToken()
        if (!token && this.getRefreshToken()) {
          // Si no hay access token pero hay refresh, refresca
          token = await this.refreshToken()
        }
        if (token) config.headers['Authorization'] = `Bearer ${token}`
        return config
      })

    instance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config
        if (error.response?.status === 401 && !originalRequest._retry && this.getRefreshToken()) {
          originalRequest._retry = true
          try {
            const newToken = await this.refreshToken()
            originalRequest.headers['Authorization'] = `Bearer ${newToken}`
            return axios.request(originalRequest)
          } catch (err) {
            this.logout()
            return Promise.reject(err)
          }
        }
        return Promise.reject(error)
      }
    )

    return instance
  }

  getAxiosInstance() {
    return this.axiosInstance
  }


  async updateUserProfile(user_id, data) {
    return this.getAxiosInstance().patch(
      `/api/v1/userprofile/${user_id}/`,
      data
    );
  }
  async patchSong(userId, songId, formData) {
    return this.getAxiosInstance().patch(
      `/api/v1/userprofile/${userId}/songs/${songId}/`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );
  }
  async postPlaylist(playlistData) {
    return this.getAxiosInstance().post(
      '/api/v1/playlist/',
      playlistData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );
  }
  async postPlayListSong(playlistId, song) {
    console.log('Token que se usará:', this.getAccessToken());
    return this.getAxiosInstance().post(
      `/api/v1/playlist/${playlistId}/songs/`,
      { song_id: song.id },
      { headers: { 'Content-Type': 'application/json' } }
    );
  }
  async deletePlayListSong(playlistId, songId){
    return this.getAxiosInstance().delete(
      `/api/v1/playlist/${playlistId}/songs/${songId}/`
    );
  }
  getAxiosInstanceGuest() {
    const apiUrl = import.meta.env.VITE_API_URL

    const instance = axios.create({
      baseURL: apiUrl,
    })
    return instance
  }

}

export default new AuthService()
