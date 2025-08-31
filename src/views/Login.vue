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
  <div v-else class="min-h-screen w-full bg-gradient-to-br from-bg-warm via-bg-light to-primary/5 flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <!-- Card -->
      <div
        class="rounded-3xl bg-white/95 backdrop-blur-sm shadow-2xl border border-primary/20 overflow-hidden transform animate-bounce-in"
      >
        <!-- Header inside the card -->
        <div class="px-8 pt-8 pb-6 text-center bg-gradient-to-br from-primary/10 via-bg-warm to-accent/5 border-b border-primary/20">
          <div class="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6 shadow-xl bg-gradient-to-r from-primary to-secondary border-4 border-white/30">
            <img
              src="/jaka-logo.png"
              class="h-12 w-auto filter brightness-0 invert"
              alt="Jaka"
              decoding="async"
            />
          </div>
          <h1 class="text-2xl font-extrabold text-text-warm mb-2">
            🍽️ Welcome to Jaka Kiosk
          </h1>
          <p class="text-sm text-text-muted">
            Sign in to manage your restaurant
          </p>
        </div>

        <!-- Form -->
        <div class="px-8 pb-8 pt-6">
          <!-- Email -->
          <label class="block text-sm font-bold text-text-warm mb-2"
            >📧 Email Address</label
          >
          <div
            class="mb-6 flex items-center gap-3 rounded-2xl border-2 border-primary/30 bg-white/90 backdrop-blur-sm px-4 py-4 focus-within:ring-2 focus-within:ring-primary/50 focus-within:border-primary/60 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <unicon
              :height="24"
              :width="24"
              name="envelope-alt"
              class="text-primary"
            />
            <input
              v-model="email"
              type="email"
              placeholder="manager@restaurant.com"
              class="w-full bg-transparent outline-none text-base text-text-warm placeholder-text-muted font-medium"
              autocomplete="email"
            />
          </div>

          <!-- Password -->
          <label class="block text-sm font-bold text-text-warm mb-2"
            >🔐 Password</label
          >
          <div
            class="mb-6 flex items-center gap-3 rounded-2xl border-2 border-primary/30 bg-white/90 backdrop-blur-sm px-4 py-4 focus-within:ring-2 focus-within:ring-primary/50 focus-within:border-primary/60 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <unicon
              :height="24"
              :width="24"
              name="key-skeleton"
              class="text-primary"
            />
            <input
              v-model="password"
              :type="show_password ? 'text' : 'password'"
              placeholder="Enter your password"
              class="w-full bg-transparent outline-none text-base text-text-warm placeholder-text-muted font-medium"
              autocomplete="current-password"
              @keyup.enter="canSubmit && !loginLoading && login(false)"
            />
            <button
              type="button"
              class="p-2 rounded-xl text-text-muted hover:text-primary hover:bg-primary/10 transition-all duration-200"
              @click="show_password = !show_password"
              :aria-label="show_password ? 'Hide password' : 'Show password'"
            >
              <unicon
                :height="22"
                :width="22"
                :name="show_password ? 'eye-slash' : 'eye'"
              />
            </button>
          </div>

          <!-- Options -->
          <div class="mb-6 flex items-center justify-between">
            <label
              class="inline-flex items-center gap-3 text-sm font-semibold text-text-warm cursor-pointer"
            >
              <input
                v-model="remember"
                type="checkbox"
                class="w-5 h-5 rounded-lg border-2 border-primary/30 text-primary focus:ring-primary/50 focus:ring-2 bg-white/90"
              />
              💾 Remember me
            </label>
            <RouterLink
              to="/help"
              class="text-sm font-semibold text-primary hover:text-primary-dark transition-colors duration-200"
            >
              🆘 Need help?
            </RouterLink>
          </div>

          <!-- CTA -->
          <button
            @click="() => login(false)"
            :disabled="loginLoading || !canSubmit"
            class="w-full inline-flex items-center justify-center gap-3 rounded-2xl px-6 py-4 text-white text-lg font-extrabold disabled:opacity-60 disabled:cursor-not-allowed bg-gradient-to-r from-primary to-secondary hover:from-primary-dark hover:to-secondary-dark active:translate-y-[1px] transition-all duration-300 shadow-lg hover:shadow-xl animate-pulse-glow"
          >
            <span v-if="loginLoading" class="loader" />
            {{ loginLoading ? "🔄 Signing In…" : "🚀 Sign In" }}
          </button>
        </div>
      </div>

      <!-- Danger zone -->
      <div class="mt-8 text-center">
        <button
          @click="RESET"
          class="rounded-2xl px-6 py-3 text-sm font-bold text-white bg-gradient-to-r from-danger to-secondary hover:from-danger hover:to-secondary-dark active:translate-y-[1px] transition-all duration-300 shadow-lg hover:shadow-xl"
        >
          ⚠️ Factory Reset
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
  width: 20px;
  height: 20px;
  border: 3px solid;
  border-color: #ffffff transparent;
  border-radius: 9999px;
  animation: rotation 0.8s linear infinite;
}

@keyframes rotation {
  to {
    transform: rotate(360deg);
  }
}

/* Custom pulse glow animation */
@keyframes pulse-glow {
  0%, 100% { 
    box-shadow: 0 0 0 0 rgba(255, 107, 53, 0.4);
  }
  50% { 
    box-shadow: 0 0 0 10px rgba(255, 107, 53, 0);
  }
}

.animate-pulse-glow {
  animation: pulse-glow 2s infinite;
}

/* Bounce in animation */
@keyframes bounce-in {
  0% {
    opacity: 0;
    transform: scale(0.3);
  }
  50% {
    transform: scale(1.05);
  }
  70% {
    transform: scale(0.9);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-bounce-in {
  animation: bounce-in 0.6s ease-out;
}
</style>
