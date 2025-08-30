<template>
  <div class="debug-container h-screen overflow-y-auto">
    <h1>Debug View</h1>
    <Terminal />
  </div>
</template>

<script>
import Terminal from "../components/Terminal.vue";

export default {
  components: {
    Terminal,
  },
};
</script>

<style scoped>
.debug-container {
  padding: 20px;
}
</style>
