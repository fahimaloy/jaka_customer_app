<template>
  <div
    @click="$emit('close')"
    class="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-bg-warm/80 via-bg-light/80 to-primary/20 backdrop-blur-md"
  >
    <div
      @click.stop
      class="relative w-[90%] max-w-md bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-primary/20 overflow-hidden transform animate-bounce-in"
    >
      <!-- Title -->
      <h2
        v-if="title"
        class="px-6 py-5 text-xl font-extrabold text-text-warm border-b border-primary/20 text-center bg-gradient-to-r from-primary/5 to-secondary/5"
      >
        {{ title }}
      </h2>

      <!-- Message -->
      <div class="px-6 py-8">
        <p
          class="text-base text-text-muted text-center whitespace-pre-line leading-relaxed"
        >
          {{ message }}
        </p>
      </div>

      <!-- Actions -->
      <div class="flex gap-4 px-6 py-5 bg-gradient-to-r from-bg-warm/30 to-bg-light/30 border-t border-primary/20">
        <button
          @click="$emit('submit')"
          class="flex-1 h-14 rounded-2xl bg-gradient-to-r from-primary to-secondary hover:from-primary-dark hover:to-secondary-dark text-white font-extrabold text-base shadow-lg hover:shadow-xl active:translate-y-[1px] transition-all duration-300 hover:scale-105 animate-pulse-glow"
        >
          Proceed
        </button>
        <button
          @click="$emit('close')"
          class="flex-1 h-14 rounded-2xl bg-white hover:bg-gray-50 border-2 border-primary/30 hover:border-primary/50 text-text-muted hover:text-text-warm font-bold text-base active:translate-y-[1px] transition-all duration-300 hover:scale-105"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  message: {
    type: String,
    required: true,
    default: "An Alert Message!",
  },
  title: {
    type: String,
    required: false,
    default: null,
  },
});
</script>
