<!-- src/components/SideBar.vue -->
<template>
  <!-- Drawer -->
  <aside
    class="fixed top-0 left-0 z-[100] h-screen w-72 max-w-[85vw] bg-white border-r border-slate-200 shadow-2xl rounded-r-2xl transform transition-transform duration-300 will-change-transform flex flex-col select-none"
    :class="{ '-translate-x-full': !isOpen, 'translate-x-0': isOpen }"
    role="dialog"
    aria-modal="true"
    aria-label="Main menu"
  >
    <!-- Header -->
    <div
      class="flex items-center justify-between px-5 py-4 border-b border-slate-200"
    >
      <div class="flex items-center gap-3">
        <img src="/jaka-logo.png" class="h-9 w-auto" alt="JakaCloud" />
        <span class="text-base font-extrabold text-slate-900 tracking-tight"
          >Menu</span
        >
      </div>
      <button
        @click="emit('close')"
        class="rounded-xl p-2 text-slate-600 hover:bg-slate-100 active:translate-y-[1px] focus:outline-none focus:ring-2 focus:ring-sky-300"
        title="Close"
        aria-label="Close menu"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-[20px] w-[20px]"
          viewBox="0 0 24 24"
          fill="none"
        >
          <path
            d="M6 6l12 12M18 6L6 18"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
          />
        </svg>
      </button>
    </div>

    <!-- Quick device strip (subtle, kiosk-friendly) -->
    <div class="px-5 pt-3 pb-2">
      <div
        class="rounded-xl bg-gradient-to-r from-sky-50 to-emerald-50 border border-slate-200 px-3 py-2 flex items-center gap-2"
      >
        <span
          class="inline-flex items-center justify-center rounded-lg bg-white ring-1 ring-slate-200 h-7 w-7"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-[16px] w-[16px]"
            viewBox="0 0 24 24"
            fill="none"
          >
            <path d="M3 7h18v10H3z" stroke="currentColor" stroke-width="1.6" />
            <circle
              cx="12"
              cy="12"
              r="2.2"
              stroke="currentColor"
              stroke-width="1.6"
            />
          </svg>
        </span>
        <div class="text-[11px] leading-4 text-slate-600">
          <div class="font-semibold text-slate-800">Jaka POS</div>
          <div class="opacity-80">Tap to navigate quickly</div>
        </div>
      </div>
    </div>

    <!-- Nav -->
    <nav class="flex-1 overflow-y-auto px-4 py-3">
      <!-- Home -->
      <RouterLink to="/home" class="block" @click="emit('close')">
        <div class="nav-item" :class="activeClass('/home')">
          <span class="nav-icon" :class="iconTint('/home')">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-[20px] w-[20px]"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M3 12l9-9 9 9"
                stroke="currentColor"
                stroke-width="1.6"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M9 21V10h6v11"
                stroke="currentColor"
                stroke-width="1.6"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </span>
          <span class="nav-text">Home</span>
        </div>
      </RouterLink>

      <!-- Sync -->
      <RouterLink to="/sync" class="block mt-2" @click="emit('close')">
        <div class="nav-item" :class="activeClass('/sync')">
          <span class="nav-icon" :class="iconTint('/sync')">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-[20px] w-[20px]"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M4 12a8 8 0 0 1 13.85-5.14M20 12a8 8 0 0 1-13.85 5.14M7 10H4V7M20 17v3h-3"
                stroke="currentColor"
                stroke-width="1.6"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </span>
          <span class="nav-text">Sync</span>
        </div>
      </RouterLink>

      <!-- Settings -->
      <RouterLink to="/settings" class="block mt-2" @click="emit('close')">
        <div class="nav-item" :class="activeClass('/settings')">
          <span class="nav-icon" :class="iconTint('/settings')">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-[20px] w-[20px]"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM19 12h2M3 12h2M12 5V3M12 21v-2M6.2 6.2 4.8 4.8M19.2 19.2l-1.4-1.4M17.8 6.2l1.4-1.4M4.8 19.2l1.4-1.4"
                stroke="currentColor"
                stroke-width="1.6"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </span>
          <span class="nav-text">Settings</span>
        </div>
      </RouterLink>
    </nav>

    <!-- Safe area spacer -->
    <div
      class="h-3"
      :style="{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }"
    ></div>
  </aside>
</template>

<script setup>
import { useRoute } from "vue-router";

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits(["close"]);
const route = useRoute();

function isActive(path) {
  return route?.fullPath?.startsWith(path);
}

function activeClass(path) {
  return isActive(path)
    ? "bg-slate-900 text-white border-slate-900 ring-1 ring-black/0"
    : "bg-white text-slate-800 border-slate-200 hover:bg-slate-50";
}

function iconTint(path) {
  return isActive(path) ? "text-white" : "text-slate-700";
}
</script>

<style scoped>
/* Kiosk-friendly, large touch targets and consistent theme */
.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 14px;
  border-radius: 14px;
  border: 1px solid;
  box-shadow: 0 6px 18px rgba(2, 6, 23, 0.05);
  transition: transform 0.06s ease, box-shadow 0.12s ease,
    background-color 0.12s ease, border-color 0.12s ease;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
}
.nav-item:active {
  transform: translateY(1px);
}
.nav-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 28px;
  width: 28px;
  border-radius: 8px;
  background: var(--icon-bg, #ffffff);
  box-shadow: inset 0 0 0 1px rgba(15, 23, 42, 0.05);
}
.nav-text {
  font-size: 15px;
  font-weight: 800;
  letter-spacing: 0.1px;
}

/* Hide scrollbar for cleaner kiosk look while remaining scrollable */
nav::-webkit-scrollbar {
  width: 0;
  height: 0;
}
nav {
  scrollbar-width: none;
}
</style>
