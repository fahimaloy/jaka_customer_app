<script setup>
import { useMainStore } from "@/stores/main";
import { storeToRefs } from "pinia";
const props = defineProps({
  message: {
    type: String,
    required: true,
    default: "",
  },
  show_progress: {
    type: Boolean,
    default: false,
  },
  hideLogo: {
    type: Boolean,
    default: false,
  },
});
const store = useMainStore();
const { syncStatus } = storeToRefs(store);
</script>
<template>
  <div
    class="bg-white max-h-screen overflow-hidden h-full w-full grid grid-rows-5 items-center min-h-screen p-4 py-8"
  >
    <div
      v-if="!hideLogo"
      class="flex row-span-3 items-center justify-center w-full"
    >
      <img src="/jaka-logo.png" class="h-24 object-contain" />
    </div>
    <div class="flex flex-col items-center justify-center gap-12 w-full">
      <p v-if="message && !show_progress" class="animate-pulse text-slate-600">
        {{ message }}
      </p>
      <div
        v-else-if="show_progress"
        class="animate-pulse text-slate-600 flex items-center gap-3 mx-2"
      >
        <p>{{ message }}</p>
        <p v-if="!syncStatus?.completed" class="font-bold">
          {{ syncStatus.synced }}/{{ syncStatus.total }}
        </p>
      </div>
      <div class="loader"></div>
    </div>
  </div>
</template>
<!-- <style scoped>
.loader {
  --d: 20px;
  width: 2px;
  height: 2px;
  border-radius: 50%;
  /* color: #22b453; */
  color: #475569;
  box-shadow: calc(1 * var(--d)) calc(0 * var(--d)) 0 0,
    calc(0.707 * var(--d)) calc(0.707 * var(--d)) 0 1px,
    calc(0 * var(--d)) calc(1 * var(--d)) 0 2px,
    calc(-0.707 * var(--d)) calc(0.707 * var(--d)) 0 3px,
    calc(-1 * var(--d)) calc(0 * var(--d)) 0 4px,
    calc(-0.707 * var(--d)) calc(-0.707 * var(--d)) 0 5px,
    calc(0 * var(--d)) calc(-1 * var(--d)) 0 6px;
  animation: l27 1s infinite steps(8);
}
@keyframes l27 {
  100% {
    transform: rotate(1turn);
  }
}
</style> -->
<style scoped>
/* HTML: <div class="loader"></div> */
.loader {
  width: 50px;
  --b: 8px;
  aspect-ratio: 1;
  border-radius: 50%;
  padding: 1px;
  background: conic-gradient(#0000 10%, #157d6e) content-box;
  -webkit-mask: repeating-conic-gradient(
      #0000 0deg,
      #000 1deg 20deg,
      #0000 21deg 36deg
    ),
    radial-gradient(
      farthest-side,
      #0000 calc(100% - var(--b) - 1px),
      #000 calc(100% - var(--b))
    );
  -webkit-mask-composite: destination-in;
  mask-composite: intersect;
  animation: l4 1s infinite steps(10);
}
@keyframes l4 {
  to {
    transform: rotate(1turn);
  }
}
</style>
