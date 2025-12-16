import AuthService from "./auth.js";
const axiosInstance = AuthService.getAxiosInstanceGuest();

export default {
  getSongs(){
    return axiosInstance.get("/api/v1/songs/");
  },
  getPlaylist(){
    return axiosInstance.get("/api/v1/playlist/");
  },
  getPlaylistFromUser(user_id){
    return axiosInstance.get(`/api/v1/userprofile/${user_id}/playlist/`);
  },
  getplayListByAnythingh(name, topic, exact_name){
    const token = localStorage.getItem("access");
    return axiosInstance.get(
      `/api/v1/playlist/?name=${encodeURIComponent(name)}&topic=${encodeURIComponent(topic)}&exact_name=${exact_name}`
    );
  },
  getUserById(user_id) {
    return axiosInstance.get(
      `/api/v1/userprofile/${user_id}/`,
    );
  },
  getUser(name) {
    const token = localStorage.getItem("access");
    return axiosInstance.get(
      `/api/v1/userprofile/by-username/${encodeURIComponent(name)}`,
    );
  },
  searchNUsers(name) {
    const token = localStorage.getItem("access");
    return axiosInstance.get(
      `/api/v1/search/user/?q=${encodeURIComponent(name)}`
    );
  },
  getUserSongs(user_id) {
    return axiosInstance.get(
      `/api/v1/userprofile/${user_id}/songs/`
    );
  },
  getUserPlaylists(user_id) {
    return axiosInstance.get(
      `/api/v1/userprofile/${user_id}/playlist/`
    );
  },
  searchsongByAnyThingh(name, topic, artist, exact) {
    const token = localStorage.getItem("access");
    return axiosInstance.get(
      `/api/v1/songs/?name=${encodeURIComponent(name)}&topic=${encodeURIComponent(topic)}&artist=${encodeURIComponent(artist)}&exact_name=${exact}`
    );
  },
  searchsongByName(name) {
    const token = localStorage.getItem("access");
    return axiosInstance.get(
      `/api/v1/search/song/?q=${encodeURIComponent(name)}`
    );
  },
  searchsongByTopic(topic) {
    const token = localStorage.getItem("access");
    return axiosInstance.get(
      `/api/v1/search/song/?topic=${encodeURIComponent(topic)}`
    );
  },
  getSongByName(name) {
  return axiosInstance.get(
    `/api/v1/songs/by-name/${encodeURIComponent(name)}/`
  );
  },
  getSongById(id) {
    return axiosInstance.get(`/api/v1/songs/${id}/`);
  },
  getSongsByPlaylistId(playlist_id) {
    return axiosInstance.get(
      `/api/v1/playlist/${playlist_id}/songs/`
    );
  },
  getPlaylistById(playlist_id) {
    return axiosInstance.get(
      `/api/v1/playlist/${playlist_id}/`
    );
  },
  getFollowers(user_id) {
    return axiosInstance.get(
      `/api/v1/userprofile/${user_id}/followers/`
    );
  },
  getFollowing(user_id) {
    return axiosInstance.get(
      `/api/v1/userprofile/${user_id}/following/`
    );
  },
  changeImage(user_id, formData) {
    return axiosInstance.patch(
      `/api/v1/userprofile/${user_id}/`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
  },
};
