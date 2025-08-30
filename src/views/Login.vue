<script setup>
import { useMainStore } from "@/stores/main";
import { relaunch } from "@tauri-apps/plugin-process";
import { onMounted, ref, computed, nextTick } from "vue";
import { useRouter, RouterLink } from "vue-router";
import { useToast } from "vue-toast-notification";
import "vue-toast-notification/dist/theme-sugar.css";
import SplashScreen from "@/components/SplashScreen.vue";
import Alert from "@/components/Alert.vue";
import { deleteDatabaseFiles } from "../lib/db/core";

const email = ref("");
const password = ref("");
const remember = ref(false);
const show_password = ref(false);

const store = useMainStore();
const {
  getItems,
  setAuthenticated,
  fetchStoreSettings,
  fetchCustomers,
  fetchFloorNTables,
  storeLogin,
  factoryReset,
} = store;

const router = useRouter();
const $toast = useToast();

// ---------- RESET ----------
const RESET = async () => {
  const response = await confirm("All data will be lost. Continue?");
  if (response) {
    try {
      await deleteDatabaseFiles();
      factoryReset(true);
      await relaunch();
    } catch (e) {
      console.error(e);
      alert(JSON.stringify(e));
    }
  }
};

// ---------- Sync UX ----------
const syncing_splash = ref(false);
const syncing_message = ref(null);
const show_progress = ref(false);
const progress = ref(0);

const steps = [
  { label: "Syncing Store Settings", fn: fetchStoreSettings },
  { label: "Syncing Items & Categories", fn: getItems },
  { label: "Syncing Customers", fn: fetchCustomers },
  { label: "Syncing Floors & Tables", fn: fetchFloorNTables },
];

const doSync = async () => {
  syncing_splash.value = true;
  show_progress.value = true;
  progress.value = 0;

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    syncing_message.value = step.label;
    try {
      await step.fn();
    } catch (e) {
      console.error(step.label, e);
      $toast.open({
        type: "error",
        message: step.label + " failed",
        position: "bottom",
      });
    }
    progress.value = Math.round(((i + 1) / steps.length) * 100);
    await nextTick();
  }

  setAuthenticated(true);
  setTimeout(() => (syncing_splash.value = false), 300);
};

// expose for native calls
window.sync = doSync;

// ---------- Login ----------
const showLoginModal = ref(false);
const loginLoading = ref(false);

const login = async (relogin = false) => {
  loginLoading.value = true;

  const payload = {
    email: email.value,
    password: password.value,
  };

  const loginResponse = await storeLogin(
    payload,
    relogin ? "store-re-login" : "store-login"
  );

  loginLoading.value = false;

  if (loginResponse?.success) {
    $toast.open({ type: "success", message: "Signed in", position: "top" });
    await doSync();
  } else if (loginResponse?.error && loginResponse?.errorMsg) {
    $toast.open({
      type: "error",
      message:
        typeof loginResponse?.errorMsg === "string"
          ? loginResponse?.errorMsg
          : JSON.stringify(loginResponse?.errorMsg),
      position: "bottom",
    });
  }

  if (loginResponse?.error && loginResponse.showLoginAlert) {
    showLoginModal.value = true;
  }
};

const cancelLogin = () => (showLoginModal.value = false);
const reLogin = () => {
  showLoginModal.value = false;
  login(true);
};

const canSubmit = computed(() => !!email.value && !!password.value);
</script>

<template>
  <!-- Neutral Sync UI (no TS props needed) -->
  <SplashScreen
    v-if="syncing_splash"
    :message="syncing_message || 'Preparing…'"
    :show_progress="show_progress"
    :progress="progress"
  />

  <!-- Login Page -->
  <div v-else class="min-h-screen w-full bg-slate-50">
    <div class="mx-auto max-w-md px-4 py-10">
      <!-- Card -->
      <div
        class="rounded-2xl bg-white shadow-sm ring-1 ring-black/5 overflow-hidden"
      >
        <!-- Header inside the card -->
        <div class="px-6 pt-8 pb-4 text-center">
          <img
            src="/jaka-logo.png"
            class="mx-auto h-14 w-auto"
            alt="Jaka"
            decoding="async"
          />
          <h1 class="mt-4 text-xl font-semibold text-slate-900">
            Sign in to Jaka Kiosk
          </h1>
          <p class="mt-1 text-sm text-slate-500">
            Use your store account to continue
          </p>
        </div>

        <!-- Form -->
        <div class="px-6 pb-6">
          <!-- Email -->
          <label class="block text-xs font-medium text-slate-600 mb-1"
            >Email</label
          >
          <div
            class="mb-4 flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5 focus-within:ring-2 focus-within:ring-sky-500 transition"
          >
            <unicon
              :height="22"
              :width="22"
              name="envelope-alt"
              class="text-slate-400"
            />
            <input
              v-model="email"
              type="email"
              placeholder="name@store.com"
              class="w-full bg-transparent outline-none text-sm text-slate-900 placeholder-slate-400"
              autocomplete="email"
            />
          </div>

          <!-- Password -->
          <label class="block text-xs font-medium text-slate-600 mb-1"
            >Password</label
          >
          <div
            class="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5 focus-within:ring-2 focus-within:ring-sky-500 transition"
          >
            <unicon
              :height="22"
              :width="22"
              name="key-skeleton"
              class="text-slate-400"
            />
            <input
              v-model="password"
              :type="show_password ? 'text' : 'password'"
              placeholder="••••••••"
              class="w-full bg-transparent outline-none text-sm text-slate-900 placeholder-slate-400"
              autocomplete="current-password"
              @keyup.enter="canSubmit && !loginLoading && login(false)"
            />
            <button
              type="button"
              class="p-1 rounded-md text-slate-500 hover:text-slate-700"
              @click="show_password = !show_password"
              :aria-label="show_password ? 'Hide password' : 'Show password'"
            >
              <unicon
                :height="20"
                :width="20"
                :name="show_password ? 'eye-slash' : 'eye'"
              />
            </button>
          </div>

          <!-- Options -->
          <div class="mt-3 mb-5 flex items-center justify-between">
            <label
              class="inline-flex items-center gap-2 text-sm text-slate-600"
            >
              <input
                v-model="remember"
                type="checkbox"
                class="rounded border-slate-300 text-sky-600 focus:ring-sky-500"
              />
              Remember me
            </label>
            <RouterLink
              to="/help"
              class="text-sm font-medium text-slate-600 hover:text-slate-800"
            >
              Need help?
            </RouterLink>
          </div>

          <!-- CTA -->
          <button
            @click="() => login(false)"
            :disabled="loginLoading || !canSubmit"
            class="w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-white text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed bg-slate-900 hover:bg-slate-800 active:bg-slate-950 transition shadow-sm"
          >
            <span v-if="loginLoading" class="loader" />
            {{ loginLoading ? "Signing In…" : "Sign In" }}
          </button>
        </div>
      </div>

      <!-- Danger zone -->
      <div class="mt-6 text-center">
        <button
          @click="RESET"
          class="rounded-lg px-3.5 py-2 text-[12px] font-medium text-white bg-red-600 hover:bg-red-700 active:bg-red-800 shadow-sm"
        >
          Factory Reset
        </button>
      </div>

      <!-- Login alert modal -->
      <Alert
        class="z-[9999]"
        v-if="showLoginModal"
        message="There is an existing login with this account. Logging in here will log out other devices using the same account. Continue?"
        @submit="reLogin"
        @close="cancelLogin"
      />
    </div>
  </div>
</template>

<style scoped>
.loader {
  width: 18px;
  height: 18px;
  border: 2.5px solid;
  border-color: #ffffff transparent;
  border-radius: 9999px;
  animation: rotation 0.8s linear infinite;
}
@keyframes rotation {
  to {
    transform: rotate(360deg);
  }
}
</style>
