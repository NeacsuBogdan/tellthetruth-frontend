<template>
  <div ref="lottieContainer" class="lottie-animation" :style="animationStyle"></div>
</template>

<script>
import { getAnimation } from '@/services/animationService';
import lottie from 'lottie-web';

export default {
  name: 'LottieAnimation',
  props: {
    animationTag: {
      type: String,
      required: true
    },
    scale: {
      type: Number,
      default: 1
    },
    loop: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      animationInstance: null
    };
  },
  computed: {
    animationStyle() {
      return {
        transform: `scale(${this.scale})`,
        transformOrigin: 'center center'
      };
    }
  },
  mounted() {
    this.initAnimation();
  },
  watch: {
    animationTag() {
      this.initAnimation();
    }
  },
  methods: {
    initAnimation() {
      this.destroyAnimation();
      const animationData = getAnimation(this.animationTag);
      if (animationData) {
        this.createAnimation(animationData);
      } else {
        console.error(`Animation with tag ${this.animationTag} not found.`);
      }
    },
    createAnimation(animationData) {
      this.animationInstance = lottie.loadAnimation({
        container: this.$refs.lottieContainer,
        renderer: 'svg',
        loop: this.loop,
        autoplay: true,
        animationData: animationData
      });
      this.animationInstance.addEventListener('DOMLoaded', this.onAnimationLoaded);
    },
    destroyAnimation() {
      if (this.animationInstance) {
        this.animationInstance.removeEventListener('DOMLoaded', this.onAnimationLoaded);
        this.animationInstance.destroy();
        this.animationInstance = null;
      }
    },
    onAnimationLoaded() {
      this.$emit('animation-loaded');
    }
  },
  beforeDestroy() {
    this.destroyAnimation();
  }
};
</script>

<style scoped>
.lottie-animation {
  width: 100%;
  height: 100%;
}
</style>
