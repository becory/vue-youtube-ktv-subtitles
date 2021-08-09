<template>
  <div class="flex flex-wrap justify-end">
    <button class="bg-blue-200 px-4 py-2 rounded-lg mr-2" @click="toggleLanguage">{{languageButton}}</button>
    <button class="bg-gray-200 px-4 py-2 rounded-lg mr-2" @click="toggleVisible">{{ $t('SETTINGS.BUTTON') }}</button>
    <button class="bg-gray-200 px-4 py-2 rounded-lg" @click="toggleFullscreen">{{ $t('FULLSCREEN') }}</button>
  </div>
</template>

<script>

import i18n from "@/i18n";

export default {
  name: "toolbar",
  computed:{
    languageButton(){
      if(i18n.locale==='en') return '中'
      return '英'
    },
  },
  methods: {
    toggleVisible() {
      this.$emit('visible')
    },
    toggleFullscreen() {
      this.$emit('fullscreen')
    },
    toggleLanguage(){
      if(i18n.locale === 'en'){
        i18n.locale = 'zh-tw'
      }else{
        i18n.locale = 'en'
      }
    }
  }
}
</script>

<style scoped>

</style>
