<template>
  <div
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
  >
    <div class="bg-white rounded-lg p-6 max-w-md w-full">
      <div class="text-sm mb-4">{{ message }}</div>
      <div class="flex justify-end space-x-2">
        <button
          @click="$emit('cancel')"
          class="px-4 py-2 text-sm border rounded hover:bg-gray-100"
        >
          Cancel
        </button>
        <button
          @click="$emit('proceed')"
          class="px-4 py-2 text-sm bg-red-700 text-white rounded hover:bg-red-800"
        >
          Proceed
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  message: String,
});
defineEmits(["proceed", "cancel"]);
</script>
