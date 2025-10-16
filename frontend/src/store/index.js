import { defineStore } from "pinia";
import api from "../services/api.js";

export const useApiStore = defineStore("api", {
  state: () => ({
    songs: [],
    playList: [],
    userResult: null,
    nUsersResult: null
  }),
  actions: {
    async fetchCatalog() {
      try {
        const response = await api.getSongs();
        this.songs = response.data;
      } catch (error) {
        console.error("Error fetching catalog:", error);
      }
    },
    async fetchPlaylist(){
      try {
        const response = await api.getPlaylist();
        this.playList = response.data;
      } catch (error) {
        console.error("Error fetching playlist:", error);
      }
    },
    async getUser(name) {
      try {
        const response = await api.getUser(name);
        this.userResult = response.data;
        return response.data;
      } catch (error) {
        console.error("Error fetching user:", error);
      }   
    },
    async searchNUsers(name) {
      try {
        const response = await api.searchNUsers(name);
        this.nUsersResult = response.data;
        return response.data;
      } catch (error) {
        console.error("Error searching users:", error);
      }
  },
}
});