import { defineStore } from "pinia";
import api from "../services/api.js";

export const useApiStore = defineStore("api", {
  state: () => ({
    songs: [],
    playList: [],
    userResult: [],
    nUsersResult: [],
    songResults: [],
    playlistResults: [],
    songDetail: null,
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
    async fetchPlaylists(){
      try {
        const response = await api.getPlaylist();
        this.playList = response.data;
      } catch (error) {
        console.error("Error fetching playlist:", error);
      }
    },
    async getplayListByAnythingh(name, topic, exact_name) {
      try {
        const response = await api.getplayListByAnythingh(name, topic, exact_name);
        this.playlistResults = response.data;
        return response.data;
      } catch (error) {
        console.error("Error fetching playlist by criteria:", error);
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
    async getUserById(userId) {
      try {
        const response = await api.getUserById(userId);
        return response.data;
      } catch (error) {
        console.error("Error fetching user by ID:", error);
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
  async searchsongByName(name) {
      try {
        const response = await api.searchsongByName(name);
        this.songResults = response.data;
        return response.data;
      } catch (error) {
        console.error("Error searching song:", error);
      }
  },
  async getPlaylistFromUser(userId) {
      try {
        const response = await api.getPlaylistFromUser(userId);
        this.playlistResults = response.data;
        return response.data;
      } catch (error) {
        console.error("Error fetching user playlist:", error);
      }
  },
  async searchsongByAnyThingh(name, topic, artist, exact) {
      try {
        const response = await api.searchsongByAnyThingh(name, topic, artist, exact);
        this.songResults = response.data;
        return response.data;
      } catch (error) {
        console.error("Error searching song:", error);
      }
  },
  async getUserSongs(userId) {
      try {
        const response = await api.getUserSongs(userId);
        this.songResults = response.data;
        return response.data;
      } catch (error) {
        console.error("Error fetching user songs:", error);
      }
  },
  async getUserPlaylists(userId) {
      try {
        const response = await api.getUserPlaylists(userId);    
        this.playlistResults = response.data;
        return response.data;
      }
      catch (error) {
        console.error("Error fetching user playlists:", error);
      }
  },
  async searchsongByTopic(topic) {
      try {
        const response = await api.searchsongByTopic(topic);
        this.songResults = response.data;
        return response.data;
      } catch (error) {
        console.error("Error searching song:", error);
      }
  },
  async getSongByName(name) {         
    try {
      const res = await api.getSongByName(name);
      this.songDetail = res.data;
      return res.data;
    } catch (e) {
      console.error("Error fetching song by name:", e);
      throw e;
    }
  },
  async getSongFromPlayList(playlistId) {
    try {
      const res = await api.getSongsByPlaylistId(playlistId);
      this.songs = res.data;
      return res.data;
    } catch (e) {
      console.error("Error fetching songs from playlist:", e);
      throw e;
    }
  },
  async getPlaylistById(playlistId) {
    try {
      const res = await api.getPlaylistById(playlistId);
      return res.data;
    } catch (e) {
      console.error("Error fetching playlist by ID:", e);
      throw e;
    }
  },
}});