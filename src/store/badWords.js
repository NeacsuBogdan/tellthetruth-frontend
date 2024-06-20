// store/badWords.js
import { defineStore } from 'pinia';

export const useBadWordsStore = defineStore('badWords', {
  state: () => ({
    badWords: [],
    leetMap: {},
  }),
  actions: {
    setBadWords(words) {
      this.badWords = words;
    },
    setLeetMap(map) {
      this.leetMap = map;
    },
    loadBadWordsData(data) {
      this.badWords = data.BAD_WORDS || [];
      this.leetMap = data.LEET_MAP || {};
    },
  },
});
