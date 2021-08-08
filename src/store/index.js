import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    youtubeUrl: '',
    ASSText: '',
    fontSize: 'md',
    fontColor: 'blue'
  },
  mutations: {
    YOUTUBE_URL(state, url){
      state.youtubeUrl = url
    },
    ASS_TEXT(state, url){
      state.ASSText = url
    },
    FONT_SIZE(state, size){
      state.fontSize = size
    },
    FONT_COLOR(state, size){
      state.fontColor = size
    }
  },
  actions: {
    setYoutubeURL({ commit }, url) {
      commit('YOUTUBE_URL', url)
    },
    setASSText({ commit }, text) {
      commit('ASS_TEXT', text)
    },
    setFontSize({ commit }, size) {
      commit('FONT_SIZE', size)
    },
    setFontColor({ commit }, size) {
      commit('FONT_COLOR', size)
    }
  },
  modules: {
  },
  getters:{
    youtubeUrl: state => state.youtubeUrl,
    ASSText: state => state.ASSText,
    fontSize: state => state.fontSize,
    fontColor: state => state.fontColor
  }
})
