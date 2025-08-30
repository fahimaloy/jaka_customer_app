<template>
  <div
    @click="$emit('close')"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
  >
    <div
      @click.stop
      class="relative w-[90%] max-w-md bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden"
    >
      <!-- Title -->
      <h2
        v-if="title"
        class="px-5 py-4 text-base font-extrabold text-slate-900 border-b border-slate-200 text-center"
      >
        {{ title }}
      </h2>

      <!-- Message -->
      <div class="px-5 py-6">
        <p
          class="text-sm text-slate-700 text-center whitespace-pre-line leading-relaxed"
        >
          {{ message }}
        </p>
      </div>

      <!-- Actions -->
      <div class="flex gap-3 px-5 py-4 bg-slate-50 border-t border-slate-200">
        <button
          @click="$emit('submit')"
          class="flex-1 h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-sm shadow-sm active:translate-y-[1px] transition"
        >
          Proceed
        </button>
        <button
          @click="$emit('close')"
          class="flex-1 h-12 rounded-xl bg-slate-200 hover:bg-slate-300 active:bg-slate-400 text-slate-800 font-bold text-sm active:translate-y-[1px] transition"
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
