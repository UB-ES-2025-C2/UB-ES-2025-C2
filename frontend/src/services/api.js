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
  },
  searchsongByAnyThingh(name, topic, artist, exact) {
    const token = localStorage.getItem("access");
    return AuthService.getAxiosInstance().get(
      `/api/v1/songs/?name=${encodeURIComponent(name)}&topic=${encodeURIComponent(topic)}&artist=${encodeURIComponent(artist)}&exact_name=${exact}`
    );
  },
  searchsongByName(name) {
    const token = localStorage.getItem("access");
    return AuthService.getAxiosInstance().get(
      `/api/v1/search/song/?q=${encodeURIComponent(name)}`
    );
  },
  searchsongByTopic(topic) {
    const token = localStorage.getItem("access");
    return AuthService.getAxiosInstance().get(
      `/api/v1/search/song/?topic=${encodeURIComponent(topic)}`
    );
  },
  searchplaylistSongsByName(name) {
    const token = localStorage.getItem("access");
    return AuthService.getAxiosInstance().get(
      `/api/v1/search/playlist/?q=${encodeURIComponent(name)}`
    );
  },
  searchplaylistByName(name) {
    const token = localStorage.getItem("access");
    return AuthService.getAxiosInstance().get(
      `/api/v1/search/playlist/?q=${encodeURIComponent(name)}`
    );
  },
};
