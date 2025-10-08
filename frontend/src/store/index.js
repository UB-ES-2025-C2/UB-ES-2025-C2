import { defineStore } from "pinia";
import api from "../services/api.js";

export const useApiStore = defineStore("api", {
  state: () => ({
    songs: [],
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
  },
});