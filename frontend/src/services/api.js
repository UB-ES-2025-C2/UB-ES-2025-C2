import AuthService from "./auth.js";
const axiosInstance = AuthService.getAxiosInstance();

export default {
  postSong(song) {
    const token = localStorage.getItem("access");
    const res = AuthService.getAxiosInstance().post(
        `/api/v1/songs/`,
       song,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
    );
    return res;
  },


  getSongs(){
    return AuthService.getAxiosInstance().get("/api/v1/songs/");
  },
  getPlaylist(){
    return AuthService.getAxiosInstance().get("/api/v1/playlist/");
  }, 
  getUser(name) {
    const token = localStorage.getItem("access");
    return AuthService.getAxiosInstance().get(
      `/api/v1/userprofile/by-username/${encodeURIComponent(name)}`,
    );
  },
  searchNUsers(name) {
    const token = localStorage.getItem("access");
    return AuthService.getAxiosInstance().get(
      `/api/v1/search/user/?q=${encodeURIComponent(name)}`
    );
  }
};
