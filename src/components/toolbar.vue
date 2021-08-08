<template>
  <div class="flex flex-wrap justify-end">
    <button class="bg-gray-200 px-4 py-2 rounded-lg mr-2" @click="visibleToggle">KTV字幕設定</button>
    <button class="bg-gray-200 px-4 py-2 rounded-lg" @click="fullscreenToggle">全螢幕</button>
  </div>
</template>

<script>

export default {
  name: "toolbar",
  methods: {
    visibleToggle() {
      this.$emit('visible')
    },
    fullscreenToggle() {
      this.$emit('fullscreen')
    }
  }
}
</script>

<style scoped>

</style>
