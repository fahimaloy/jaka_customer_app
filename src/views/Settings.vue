<!-- src/views/Settings.vue (or wherever your Settings component lives) -->
<template>
  <div class="h-full w-full p-3 md:p-4">
    <h3 class="text-2xl font-extrabold text-slate-900">Settings</h3>

    <div
      class="mt-4 rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden"
    >
      <!-- Factory Reset -->
      <div class="flex items-center justify-between px-4 py-3">
        <div>
          <h4 class="text-slate-900 font-bold">Factory Reset</h4>
          <p class="text-sm text-slate-600">
            Erase all local data and restart the app.
          </p>
        </div>
        <button
          class="rounded-xl px-4 py-2 text-sm font-bold text-white bg-red-600 hover:bg-red-700 active:bg-red-800 active:translate-y-[1px] shadow-sm"
          @click="toggleReset"
        >
          {{ show_reset ? "Cancel" : "Factory Reset" }}
        </button>
      </div>

      <div v-show="show_reset" class="border-t border-slate-200 px-4 py-4">
        <div class="space-y-3 max-w-md">
          <p class="text-slate-800">
            Type the password to confirm factory reset. This will delete local
            databases and relaunch the app.
          </p>

          <label class="block">
            <span class="text-xs font-semibold text-slate-600">Password</span>
            <input
              id="reset_password_box"
              v-model="password_reset"
              :type="show_pass_reset ? 'text' : 'password'"
              class="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-300"
              placeholder="Enter password"
            />
          </label>

          <div class="flex items-center gap-2">
            <input
              id="show_pass_reset"
              type="checkbox"
              v-model="show_pass_reset"
            />
            <label for="show_pass_reset" class="text-xs text-slate-600"
              >Show password</label
            >
          </div>

          <p v-if="reset_error" class="text-sm text-red-600">
            {{ reset_error }}
          </p>

          <div class="flex gap-3">
            <button
              @click="show_reset = false"
              class="flex-1 h-11 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold active:translate-y-[1px]"
            >
              Cancel
            </button>
            <button
              :disabled="reset_loading"
              @click="RESET"
              class="flex-1 h-11 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold active:translate-y-[1px] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {{ reset_loading ? "Resetting…" : "Confirm Reset" }}
            </button>
          </div>
        </div>
      </div>

      <!-- Divider -->
      <div class="h-px bg-slate-200"></div>

      <!-- Sync Settings -->
      <div class="flex items-center justify-between px-4 py-3">
        <div>
          <h4 class="text-slate-900 font-bold">Sync Settings</h4>
          <p class="text-sm text-slate-600">
            Customer & item synchronization options.
          </p>
        </div>
        <button
          class="rounded-xl px-4 py-2 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 active:translate-y-[1px] shadow-sm"
          @click="router.push('/sync')"
        >
          Navigate
        </button>
      </div>

      <!-- Divider -->
      <div class="h-px bg-slate-200"></div>

      <!-- Logout (password protected) -->
      <div class="flex items-center justify-between px-4 py-3">
        <div>
          <h4 class="text-slate-900 font-bold">Logout</h4>
          <p class="text-sm text-slate-600">Sign out from this device.</p>
        </div>
        <button
          class="rounded-xl px-4 py-2 text-sm font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 active:translate-y-[1px] shadow-sm"
          @click="toggleLogout"
        >
          {{ show_logout ? "Cancel" : "Logout" }}
        </button>
      </div>

      <div v-show="show_logout" class="border-t border-slate-200 px-4 py-4">
        <div class="space-y-3 max-w-md">
          <p class="text-slate-800">Enter password to logout.</p>

          <label class="block">
            <span class="text-xs font-semibold text-slate-600">Password</span>
            <input
              id="logout_password_box"
              v-model="password_logout"
              :type="show_pass_logout ? 'text' : 'password'"
              class="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-300"
              placeholder="Enter password"
            />
          </label>

          <div class="flex items-center gap-2">
            <input
              id="show_pass_logout"
              type="checkbox"
              v-model="show_pass_logout"
            />
            <label for="show_pass_logout" class="text-xs text-slate-600"
              >Show password</label
            >
          </div>

          <p v-if="logout_error" class="text-sm text-red-600">
            {{ logout_error }}
          </p>

          <div class="flex gap-3">
            <button
              @click="show_logout = false"
              class="flex-1 h-11 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold active:translate-y-[1px]"
            >
              Cancel
            </button>
            <button
              :disabled="logout_loading"
              @click="LOGOUT"
              class="flex-1 h-11 rounded-xl bg-slate-900 hover:bg-slate-800 active:bg-black text-white font-bold active:translate-y-[1px] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {{ logout_loading ? "Logging out…" : "Confirm Logout" }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { relaunch } from "@tauri-apps/plugin-process";
import { ref, watch, nextTick } from "vue";
import { useRouter } from "vue-router";
import { deleteDatabaseFiles } from "../lib/db/core";
import { useMainStore } from "@/stores/main";
import { storeToRefs } from "pinia";

const router = useRouter();
const store = useMainStore();
const { pos_login_type } = storeToRefs(store);

// --- UI state ---
const show_reset = ref(false);
const show_logout = ref(false);

const password_reset = ref("");
const password_logout = ref("");
const show_pass_reset = ref(false);
const show_pass_logout = ref(false);

const reset_loading = ref(false);
const logout_loading = ref(false);

const reset_error = ref("");
const logout_error = ref("");

// --- constants ---
const CORRECT_PASSWORD = "jakatest";

// --- helpers to toggle / autofocus ---
function toggleReset() {
  show_reset.value = !show_reset.value;
  reset_error.value = "";
  password_reset.value = "";
  if (show_reset.value) {
    nextTick(() => {
      document.getElementById("reset_password_box")?.focus();
    });
  }
}

function toggleLogout() {
  show_logout.value = !show_logout.value;
  logout_error.value = "";
  password_logout.value = "";
  if (show_logout.value) {
    nextTick(() => {
      document.getElementById("logout_password_box")?.focus();
    });
  }
}

// --- actions ---
async function RESET() {
  reset_error.value = "";
  if (password_reset.value !== CORRECT_PASSWORD) {
    reset_error.value = "Incorrect password.";
    return;
  }
  try {
    reset_loading.value = true;
    // wipe local DB
    await deleteDatabaseFiles();
    // app-level flag if needed
    store.factoryReset?.(true);
    // relaunch tauri app
    await relaunch();
  } catch (e) {
    reset_error.value = typeof e === "string" ? e : JSON.stringify(e);
    console.error(e);
  } finally {
    reset_loading.value = false;
  }
}

async function LOGOUT() {
  logout_error.value = "";
  if (password_logout.value !== CORRECT_PASSWORD) {
    logout_error.value = "Incorrect password.";
    return;
  }
  try {
    logout_loading.value = true;
    // Logout flows:
    if (pos_login_type.value) {
      // shift-based flow
      router.push("/shift-out");
    } else {
      // normal logout
      store.posLogout?.();
      router.push("/login");
    }
  } catch (e) {
    logout_error.value = typeof e === "string" ? e : JSON.stringify(e);
    console.error(e);
  } finally {
    logout_loading.value = false;
  }
}
</script>
