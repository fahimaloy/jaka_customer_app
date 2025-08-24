import { defineStore } from 'pinia'

export const useMainStore = defineStore('main', {
  state: () => ({
    token: null as string | null,
    locations: [] as unknown[],
    settings: null as unknown,
  }),
  persist: {
    storage: localStorage,
  },
})
