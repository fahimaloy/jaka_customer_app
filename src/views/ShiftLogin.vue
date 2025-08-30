<script setup>
import { useMainStore } from "@/stores/main";
import { ref, computed } from "vue";
import { RouterLink } from "vue-router";
import { useToast } from "vue-toast-notification";
import "vue-toast-notification/dist/theme-sugar.css";
import SplashScreen from "@/components/SplashScreen.vue";
import PinScreen from "@/components/PinScreen.vue";
import { storeToRefs } from "pinia";
import { onMounted } from "vue";
// import { watch } from "@tauri-apps/plugin-fs";
const email = ref("goldenb@jakac.com");
const password = ref("jakatest");
// const phone = ref("")
const remember = ref(false);
const store = useMainStore();
const { posLogout } = store;
const { settings } = storeToRefs(store);
const syncing_splash = ref(false);
const $toast = useToast();
const selectedUser = ref(null);
const login_users = computed(() => {
  console.log("loaction Users", settings.value.location_users);
  return settings.value.location_users.filter(
    (user) => user.user_type == "general"
  );
});

const logout = () => {
  localStorage.removeItem("token");
  posLogout();
};
</script>

<template>
  <SplashScreen v-if="syncing_splash" message="Syncing Items" />
  <div
    v-else
    class="flex flex-col items-center justify-evenly h-full min-h-screen py-8 px-2 gap-8"
  >
    <div
      v-if="selectedUser"
      @click="() => (selectedUser = null)"
      class="p-4 absolute top-2 left-2 cursor-pointer"
    >
      <unicon :height="32" :width="32" name="arrow-left" fill="black"></unicon>
    </div>
    <div class="flex flex-col items-center justify-between gap-4">
      <img src="/jaka-logo.png" class="w-40 object-contain" />
      <div class="flex flex-col gap-2">
        <h3 class="text-2xl font-semibold text-center">Shift Login</h3>
        <p v-if="selectedUser" class="font-medium text-xs text-center">
          {{ selectedUser?.username }}
        </p>
      </div>
    </div>
    <div v-if="!selectedUser" class="w-full">
      <div
        class="flex flex-col gap-2 w-full py-1 max-h-[60vh] items-center px-2 h-full overflow-y-scroll"
      >
        <div
          v-for="user in login_users"
          :key="user?.id"
          @click="selectedUser = user"
          class="cursor-pointer active:bg-gray-200 bg-white shadow border w-full rounded-lg px-4 py-2 flex flex-col"
        >
          <h3 class="text-sm text-slate-700 font-bold">{{ user?.name }}</h3>
          <h3 class="text-xxs text-input-muted">{{ user?.username }}</h3>
        </div>
      </div>
    </div>
    <PinScreen :selectedUser="selectedUser" :hideLogo="true" v-else />

    <div class="flex items-center justify-evenly w-full gap-4">
      <hr class="border w-full" />
      <p class="text-nowrap font-semibold text-muted-dark">Or</p>
      <hr class="border w-full" />
    </div>
    <button
      @click="logout"
      class="bg-primary font-semibold w-full px-8 py-4 text-white rounded-full"
    >
      Logout
    </button>
  </div>
</template>
<style scoped>
.green-bg {
  background-color: #22b453;
}

.green-text {
  color: #22b453;
}

.muted-text {
  color: #a5a4a4;
}
</style>
