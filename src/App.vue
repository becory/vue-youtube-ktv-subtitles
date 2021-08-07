<template>
  <div id="app">
    <header class="relative z-10 max-w-screen-lg xl:max-w-screen-xl mx-auto">
      <nav class="px-4 sm:px-6 md:px-8">
        <div
            class="border-b border-gray-200 py-4 flex items-center justify-between mb-16 sm:mb-20 -mx-4 px-4 sm:mx-0 sm:px-0">
          <h1>Vue Youtube KTV Subtitles Demo</h1>
          <input v-model="youtubeUrl" class="bg-gray-200 px-4 py-2 rounded-lg w-1/3"/>
          <button class="bg-gray-200 px-4 py-2 rounded-lg" @click="ASSDialog.visible=true">匯入 ASS 字幕檔案</button>
        </div>
      </nav>
    </header>
    <section class="relative z-10 text-center max-w-screen-lg xl:max-w-screen-xl mx-auto ">
      <div class="relative px-4 sm:px-6 md:px-8 mb-14 sm:mb-20 xl:mb-8">
        <youtube ref="youtube" :video-id="youtubeViewer.id" @playing="playing" @progress="youtubeEnd"
                 @paused="youtubeEnd" @ended="youtubeEnd"
                 class="w-full h-screen"
        />
        <div v-if="youtubeViewer.playing" class="ktv-subtitle">
          <p class="float-left" v-bind:data-title="getSentence(0) | getCombine" :class="`length-${getPercentage(getSentence(0))}`">
            {{ getSentence(0) | getCombine }}
          </p>
          <p class="clear-left"></p>
          <p class="float-right" v-bind:data-title="getSentence(1) | getCombine" v-bind:data-width="20"  :class="`length-${getPercentage(getSentence(1))}`">
            {{ getSentence(1) | getCombine }}
          </p>
        </div>
      </div>
    </section>
    <modal v-if="ASSDialog.visible">
      <template slot="header">
        <h1 class="text-xl bolder-600">匯入 ASS 字幕檔案</h1>
      </template>
      <template slot="body">
        <h1 class="text-lg pl-3">可以上傳或貼上ASS文字內容</h1>
        <div class="divide-y-4 divide-black divide-opacity-25">
          <div class="p-5">
            <label for="text">上傳ASS檔案</label>
            <input type="file" class="w-full min-h-2/3 bg-gray-200 px-4 py-2 rounded-lg" @change="handleFiles"/>
          </div>
          <div class="p-5">
            <label for="text">ASS文字內容</label>
            <textarea id="text" v-model="ASSDialog.text"
                      class="w-full min-h-2/3 bg-gray-200 px-4 py-2 rounded-lg"></textarea>
          </div>
        </div>
      </template>
      <template slot="footer">
        <div class="flex flex-wrap justify-end">
          <div>
            <button class="text-left bg-gray-200 px-5 py-2" @click="ASSDialog.visible=!ASSDialog.visible">關閉</button>
          </div>
        </div>
      </template>
    </modal>
  </div>
</template>

<script>
import {Youtube} from 'vue-youtube'
import modal from "@/components/modal";

import {parse} from 'ass-compiler';

export default {
  name: 'App',
  components: {Youtube, modal},
  data() {
    return {
      ASSDialog: {
        visible: false,
        text: ''
      },
      youtubeUrl: '',
      youtubeViewer: {
        id: '',
        time: 0,
        timerIndex: [],
        interval: null,
        playing: false,
      },
      parsedASS: ''
    }
  },
  filters: {
    getCombine: function (value) {
      if (!value || !value[1] || !value[1].Text || !value[1].Text.combined) return ''
      return value[1].Text.combined
    }
  },
  computed: {
    getDialogue() {
      if (!this.parsedASS.events || !this.parsedASS.events.dialogue) return null
      return this.parsedASS.events.dialogue
    },
    getNowTimer() {
      if (!this.getDialogue) return null
      return this.getDialogue.findIndex((item) => (parseFloat(item.Start) <= this.youtubeViewer.time && (parseFloat(item.End)) >= this.youtubeViewer.time))
    }
  },
  watch: {
    youtubeUrl(value) {
      const youtubeUrl = new URL(value)
      this.youtubeViewer.id = youtubeUrl.searchParams.get('v')
    },
    'ASSDialog.text'(value) {
      this.parsedASS = parse(value)
    },
    'youtubeViewer.playing'(value) {
      if (!value) {
        this.youtubeViewer.timerIndex = []
      }
    },
    getNowTimer(value) {
      if (value > 0) {
        if (value % 2 === 0) {
          this.youtubeViewer.timerIndex = [value + 1, value]
        } else {
          this.youtubeViewer.timerIndex = [value, value + 1]
        }
      }
    }
  },
  mounted() {
    this.youtubeUrl = 'https://www.youtube.com/watch?v=PlCbgZxonJs'
  },
  methods: {
    playing() {
      this.youtubeViewer.playing = true
      if (this.$refs['youtube']) {
        this.youtubeViewer.interval = window.setInterval(this.getYoutubeTimer, 10)
      }
    },
    youtubeEnd() {
      this.youtubeViewer.playing = false
      if (this.$refs['youtube']) {
        window.clearInterval(this.youtubeViewer.interval)
      }
    },
    async getYoutubeTimer() {
      if (this.$refs['youtube']) {
        this.youtubeViewer.time = await this.$refs['youtube'].player.getCurrentTime()
      }
    },
    handleFiles(event) {
      let reader = new FileReader();
      reader.onload = (e) => {
        this.ASSDialog.text = e.target.result
      }
      reader.readAsText(event.target.files[0], "UTF-8")
    },
    getSentence(index) {
      const timer = this.youtubeViewer.timerIndex
      if (timer.length < 2) return null
      return [timer[index], this.getDialogue[timer[index]]]
    },
    getPercentage(value) {
      if (!value || !value[1] || !value[1].Text || !value[1].Text.parsed) return ''
      let Start = parseFloat(value[1].Start)
      let Long = (this.youtubeViewer.time - Start) *100
      let TotalSplit = value[1].Text.parsed.reduce((total, current) => (total + current['tags'][0]['k']), 0)
      if (Long > 0 && Long <= TotalSplit) {
        return Math.round(Long / TotalSplit * 100)
      } else if (Long <= 0) {
        return 0
      } else {
        return 100
      }
    }
  }
}
</script>

<style lang="scss">
.ktv-subtitle {
  @apply absolute p-10 text-7xl w-11/12 inset-x-auto;
  letter-spacing: 7px;
  bottom: 40px;

  p {
    @apply relative text-white font-black;
    text-stroke: 2px black;
    -webkit-text-stroke: 2px black;
    white-space: nowrap;
    background-clip: text;
    -webkit-background-clip: text;

    &::before {
      @apply absolute bg-blue-500 font-black;
      content: attr(data-title);
      width: 0;
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
      text-stroke: 2px white;
      -webkit-text-stroke: 2px white;
      background-clip: text;
      -webkit-background-clip: text;
      color: transparent;
      overflow: hidden;

    }

    @for $percentage from 1 through 100 {
      &.length-#{$percentage}::before {
        width: $percentage*1%;
      }
    }
  }
}
</style>
