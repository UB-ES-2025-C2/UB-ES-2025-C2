import { defineStore } from "pinia";
import AuthService from "../services/auth";


export const useAuthStore = defineStore("auth", {
  state: () => ({
    username: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
    loading: false,
    error: null,
    user_id: null,
    avatarUrl: null,
  }),
  actions: {
    initializeAuthStore() {
      this.username = localStorage.getItem("username");
      this.accessToken = localStorage.getItem("access");
      this.refreshToken = localStorage.getItem("refresh");
      this.user_id = localStorage.getItem("id");
      this.avatarUrl = localStorage.getItem("avatarUrl");
      this.isAuthenticated = !!this.accessToken;
    },
    login(user) {
      this.loading = true;
      this.error = null;

      return AuthService.login(user)
        .then((response) => {
          this.username = user.username;
          this.accessToken = response.data.access;
          this.refreshToken = response.data.refresh;
          this.isAuthenticated = true;
          localStorage.setItem("access", this.accessToken);
          localStorage.setItem("refresh", this.refreshToken);

          return this.refreshUserInfo();
        })
        .catch((error) => {
          console.log("error", error);
          this.error =
            error.response?.data?.detail || "Login failed. Try again.";
          this.isAuthenticated = false;
        })
        .finally(() => {
          this.loading = false;
        });
    },

    refreshUserInfo() {
      return AuthService.getUserByToken().then((res) => {
        const user = res.data;
        this.user_id = user.id;
        this.username = user.nickname;
        this.avatarUrl = user.profilePic;
        localStorage.setItem("username", this.username);
        localStorage.setItem("id", user.id);
        localStorage.setItem("avatarUrl", this.avatarUrl);
      });
    },
    postSong(song) {
      const formData = new FormData();
      formData.append("file_audio", song.file_audio);
      formData.append("name", song.name);
      formData.append("artist", song.artist);
      formData.append("topic", song.topic);
      return AuthService.postSong(formData);
    },
    logout() {
      this.accessToken = null;
      this.refreshToken = null;
      this.isAuthenticated = false;
      this.avatarUrl = null;
      this.user_id = null;
      this.username = null;
      localStorage.removeItem("username");
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      localStorage.removeItem("id");
      localStorage.removeItem("avatarUrl");
    },
    async signUp(user){
      // Create User:
      await AuthService.signUp(user);
    },
    async changeProfilePicture(file) {
      return AuthService.changeProfilePicture(this.user_id, file);
    },
    async updateUserProfile(data) {
      return AuthService.updateUserProfile(this.user_id, data);
    },
    async patchSong(songId, song) {
      const formData = new FormData();
      formData.append("name", song.name);
      formData.append("artist", song.artist);
      formData.append("topic", song.topic);
      if (Array.isArray(song.authors)) {
        song.authors.forEach(authorId => {
          formData.append("authors", authorId);
        });
      }
      if (song.fileAudio) {
        formData.append("file_audio", song.fileAudio);
      }

      if (song.cover) {
        formData.append("cover", song.cover);
      }
      return AuthService.patchSong(this.user_id, songId, formData);
    },
    async postPlaylist(playlist) {
      const formData = new FormData();
      formData.append("name", playlist.name);
      formData.append("description", playlist.description);
      formData.append("topic", playlist.topic);
      const owners = Array.from(playlist.owner?.value ?? playlist.owner ?? []);

      owners.forEach(id => {
        formData.append("owner", id); // crea "owner": "1", "owner": "2", ...
      });

      if (playlist.cover) {
        formData.append("cover", playlist.cover);
      }
      return AuthService.postPlaylist(formData);
    }
  }
});
