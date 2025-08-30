<template>
  <div
    style="margin-top: 0"
    class="fixed top-0 left-0 w-full h-full bg-black/70 z-[999999] flex items-center justify-center"
  >
    <div
      class="relative w-3/4 md:w-fit bg-gray-200 rounded-md flex flex-col items-center justify-center gap-2 m-6"
    >
      <h2
        class="px-4 text-sm py-4 block bg-transparent text-slate-800 text-center font-semibold rounded-md"
      >
        {{ message }}
      </h2>
      <div
        class="flex w-full justify-end gap-4 items-center p-2 rounded-md rounded-t-none bg-gray-100 border-t border-t-slate-300 shadow"
      >
        <button
          @click="$emit('clicked')"
          class="shadow p-3 px-6 w-full rounded-md bg-cyan-700 hover:bg-cyan-800 text-base font-bold text-white"
        >
          {{ ButtonText ? ButtonText : "Okay" }}
        </button>
      </div>
    </div>
  </div>
</template>
<script setup>
defineProps({
  ButtonText: String,
  message: String,
});
</script>
