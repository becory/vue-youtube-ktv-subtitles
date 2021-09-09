<template>
  <div id="app">
    <header class="relative z-10 max-w-screen-lg xl:max-w-screen-xl mx-auto md:block hidden">
      <nav class="px-4 sm:px-6 md:px-8">
        <div
            class="border-b border-gray-200 py-4 flex items-center justify-between mb-16 sm:mb-20 -mx-4 px-4 sm:mx-0 sm:px-0">
          <h1>{{ $t('NAME') }}</h1>
          <input :value="youtubeUrl" class="bg-gray-200 px-4 py-2 rounded-lg w-1/3"
                 @change="setYoutubeURLValue"/>
          <toolbar @visible="ASSDialog.visible=!ASSDialog.visible" @fullscreen="fullscreenToggle"/>
        </div>
      </nav>
    </header>
    <section ref="fullscreen"
             class="relative z-10 text-center max-w-screen-lg xl:max-w-screen-xl mx-auto md:block hidden">
      <div class="relative px-4 sm:px-6 md:px-8 mb-14 sm:mb-20 xl:mb-8">
        <youtube ref="youtube" :video-id="youtubeViewer.id" @playing="playing" @progress="youtubeEnd"
                 @paused="youtubeEnd" @ended="youtubeEnd"
                 class="w-full h-screen"
        />
        <div v-if="youtubeViewer.playing" class="ktv-subtitle">
          <!--          <subtitle class="float-left" :youtube-viewer="youtubeViewer" :index="0" :dialogue="getDialogue"/>-->
          <p class="float-left" :class="[fontSize, fontColor]">
            <template v-if="hasTag(getSentence(0))">
              <template v-for="(word, idx)  in getSentence(0)[2]">
              <span class="split" :key="idx" v-bind:data-title="word.text"
                    :class="`length-${getPercentage(getSentence(0), idx)}`"
              >{{ word.text }}</span>
              </template>
            </template>
            <span class="split" v-else>{{ getSentence(0) | getCombine }}</span>
          </p>
          <p class="clear-left"></p>
          <p class="float-right" :class="[fontSize, fontColor]">
            <template v-if="hasTag(getSentence(1))">
              <template v-for="(word, idx)  in getSentence(1)[2]">
              <span class="split" :key="idx" v-bind:data-title="word.text"
                    :class="`length-${getPercentage(getSentence(1), idx)}`"
              >{{ word.text }}</span>
              </template>
            </template>
            <span class="split" v-else>{{ getSentence(1) | getCombine }}</span>
          </p>
        </div>
      </div>
      <div class="ktv-toolbar" v-if="fullscreen">
        <toolbar @visible="ASSDialog.visible=!ASSDialog.visible" @fullscreen="fullscreenToggle"/>
        <div v-if="ASSDialog.visible" class="bg-white rounded-lg my-2">
          <div class="text-left divide-y-4 divide-black divide-opacity-25">
            <settings>
              <div class="p-5">
                <label for="url">{{ $t('SETTINGS.YOUTUBE_URL') }}</label>
                <input id="url" :value="youtubeUrl" class="bg-gray-200 px-4 py-2 rounded-lg w-full"
                       @change="setYoutubeURLValue"/>
              </div>
            </settings>
          </div>
        </div>
      </div>
    </section>
    <modal v-show="ASSDialog.visible" class="md:block hidden">
      <template slot="header">
        <h1 class="text-xl bolder-600">{{ $t('SETTINGS.NAME') }}</h1>
      </template>
      <template slot="body">
        <h1 class="text-lg pl-3">{{ $t('SETTINGS.ALERT') }}</h1>
        <div>
          <settings ref="settings"></settings>
        </div>
      </template>
      <template slot="footer">
        <div class="flex flex-wrap justify-end">
          <div>
            <button class="text-left bg-gray-200 px-5 py-2" @click="ASSDialog.visible=!ASSDialog.visible">
              {{ $t('CLOSE') }}
            </button>
          </div>
        </div>
      </template>
    </modal>
    <div class="relative z-10 max-w-screen-lg xl:max-w-screen-xl mx-auto md:block md:hidden block">
      <div
          class="rounded-xl max-w-screen-lg text-center h-full align-middle m-5 p-5 border-solid border-black border bg-gray-300">
        不支援手機版
      </div>
    </div>
  </div>
</template>

<script>
import i18n from '@/i18n'
import {Youtube} from 'vue-youtube'
import modal from "@/components/modal";
import settings from "@/components/settings"
import {api as fullscreen} from 'vue-fullscreen'
import {parse} from 'ass-compiler';
import {mapActions, mapGetters} from "vuex";
import Toolbar from "@/components/toolbar";


export default {
  name: 'App',
  components: {Toolbar, Youtube, modal, settings},
  data() {
    return {
      ASSDialog: {
        visible: false,
        text: ''
      },
      youtubeViewer: {
        id: '',
        time: 0,
        timerIndex: [],
        interval: null,
        playing: false,
      },
      parsedASS: '',
      fullscreen: false
    }
  },
  filters: {
    getCombine: function (value) {
      if (!value || !value[1] || !value[1].Text || !value[1].Text.combined) return ''
      return value[1].Text.combined
    }
  },
  computed: {
    ...mapGetters(['youtubeUrl', 'ASSText', 'fontSize', 'fontColor']),
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
      try {
        const youtubeUrl = new URL(value)
        this.youtubeViewer.id = youtubeUrl.searchParams.get('v')
      } catch (e) {
        // error
      }
    },
    ASSText(value) {
      this.parsedASS = parse(value)
    },
    'youtubeViewer.playing'(value) {
      if (!value) {
        this.youtubeViewer.timerIndex = []
      }
    },
    getNowTimer(value) {
      if (value >= 0) {
        if (value % 2 === 0) {
          this.youtubeViewer.timerIndex = [value, value + 1]
        } else {
          this.youtubeViewer.timerIndex = [value + 1, value]
        }
      }
    }
  },
  mounted() {
    i18n.locale = 'zh-tw'
    this.$refs['settings'].setExample(this.$refs['settings'].examples[0])
  },
  methods: {
    ...mapActions(['setYoutubeURL']),
    fullscreenToggle() {
      fullscreen.toggle(this.$refs['fullscreen'], {
        teleport: false, callback: (isFullscreen) => {
          this.fullscreen = isFullscreen
        },
      })
    },
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
    setYoutubeURLValue(event) {
      this.setYoutubeURL(event.target.value)
    },
    hasTag(sentence) {
      return !(!sentence[2] || !sentence[2][0] || !sentence[2][0]['tags'] || !sentence[2][0]['tags'][0] || !sentence[2][0]['tags'][0]['k'])
    },
    getSentence(index) {
      const timer = this.youtubeViewer.timerIndex
      if (timer.length < 2 || !this.getDialogue[timer[index]]) return [-1, {}, []]
      if (!this.getDialogue[timer[index]].Text || !this.getDialogue[timer[index]].Text.parsed) return [timer[index], this.getDialogue[timer[index]], []]
      return [timer[index], this.getDialogue[timer[index]], this.getDialogue[timer[index]].Text.parsed]
    },
    getPercentage(value, wordIndex) {
      if (!value || !value[1] || !value[1].Text || !value[1].Text.parsed) return 0
      let start = parseFloat(value[1].Start)
      let now = this.youtubeViewer.time * 100
      let wordSplitStart = (value[1].Text.parsed.slice(0, wordIndex).reduce((total, current) => (total + current['tags'][0]['k']), 0)) + start * 100
      let wordSplitEnd = (value[1].Text.parsed.slice(0, wordIndex + 1).reduce((total, current) => (total + current['tags'][0]['k']), 0)) + start * 100
      if (now > wordSplitStart && now < wordSplitEnd) {
        return Math.round((now - wordSplitStart) / value[1].Text.parsed[wordIndex]['tags'][0]['k'] * 100)
      } else if (now >= wordSplitEnd) {
        return 100
      } else if (now <= wordSplitStart) {
        return 0
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.ktv-toolbar {
  @apply absolute p-2 z-50 top-0 right-10;
}

.ktv-subtitle {
  @apply absolute p-10 text-6xl inset-x-auto w-11/12;
  //flex flex-wrap justify-center
  letter-spacing: 7px;
  bottom: 50px;

  .lg {
    @apply md:text-7xl text-6xl;
    text-stroke: 2px black;
    -webkit-text-stroke: 2px black;

    &::before {
      text-stroke: 2px white;
      -webkit-text-stroke: 2px white;
    }
  }

  .md {
    @apply md:text-6xl text-5xl;
    text-stroke: 1.5px black;
    -webkit-text-stroke: 1.5px black;

    &::before {
      text-stroke: 1.5px white;
      -webkit-text-stroke: 1.5px white;
    }
  }

  .sm {
    @apply md:text-5xl text-4xl;
    text-stroke: 1px black;
    -webkit-text-stroke: 1px black;

    &::before {
      text-stroke: 1px white;
      -webkit-text-stroke: 1px white;
    }
  }

  .blue {
    .split {
      &::before {
        @apply bg-blue-500;
      }
    }
  }

  .red {
    .split {
      &::before {
        @apply bg-red-500;
      }
    }
  }

  .green {
    .split {
      &::before {
        @apply bg-green-500;
      }
    }
  }

  .split {
    @apply relative text-white font-black;
    text-stroke: 1.5px black;
    -webkit-text-stroke: 1.5px black;
    white-space: nowrap;
    background-clip: text;
    -webkit-background-clip: text;

    &::before {
      @apply absolute bg-blue-500 font-black;
      content: attr(data-title);
      width: 0;
      left: 0;
      text-stroke: 1.5px white;
      -webkit-text-stroke: 1.5px white;
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
