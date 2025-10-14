import { defineStore } from "pinia";
import api from "../services/api.js";

export const useApiStore = defineStore("api", {
  state: () => ({
    songs: [],
    playList: []
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
  },
});