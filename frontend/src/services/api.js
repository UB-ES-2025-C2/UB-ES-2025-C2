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
  }

};
