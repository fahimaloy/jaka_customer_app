<template>
  <div class="flex flex-col h-4/5 bg-gray-900 text-white">
    <!-- Terminal Header -->
    <div class="flex items-center justify-between p-2 bg-gray-800">
      <span class="text-lg font-semibold">Terminal</span>
      <button @click="toggleFullscreen" class="p-2 hover:bg-gray-700 rounded">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 0h-4m4 0l-5-5"
          />
        </svg>
      </button>
    </div>

    <!-- Terminal Content -->
    <div ref="terminalContent" class="overflow-y-auto flex-grow p-2 text-sm">
      <div v-for="(log, index) in logs" :key="index" class="mb-1">
        <span class="text-gray-500">{{ formatTimestamp(log.timestamp) }}</span>
        <span v-if="log.type === 'error'" class="text-red-500">[ERROR]</span>
        <span v-if="log.type === 'success'" class="text-green-500"
          >[SUCCESS]</span
        >
        <span v-if="log.type === 'info'" class="text-blue-500">[INFO]</span>
        <span>{{ log.message }}</span>
      </div>
    </div>

    <!-- Terminal Footer -->
    <div class="flex justify-between p-2 bg-gray-800">
      <button
        @click="resetLogs"
        class="bg-red-700 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
      >
        Reset Logs
      </button>
      <button
        @click="copyToClipboard"
        class="bg-blue-700 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
      >
        Copy to Clipboard
      </button>
    </div>
  </div>
</template>

<script setup>
import { useMainStore } from "../stores/main";
import { ref, onMounted } from "vue";
import { storeToRefs } from "pinia";

const mainStore = useMainStore();
const terminalContent = ref(null);
const { logs } = storeToRefs(mainStore);

const formatTimestamp = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString(); // Format as you like
};

const resetLogs = () => {
  mainStore.resetLogs();
};

const copyToClipboard = () => {
  const text = logs.value
    .map(
      (log) =>
        `${formatTimestamp(log.timestamp)} ${
          log.type ? `[${log.type.toUpperCase()}] ` : ""
        }${log.message}`
    )
    .join("\n");
  navigator.clipboard.writeText(text);
};

const toggleFullscreen = () => {
  if (document.fullscreenElement) {
    document.exitFullscreen();
  } else {
    document.documentElement.requestFullscreen();
  }
};

onMounted(() => {
  if (terminalContent.value) {
    terminalContent.value.scrollTop = terminalContent.value.scrollHeight;
  }
});
</script>
