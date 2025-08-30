<script setup>
import { useMainStore } from "@/stores/main";
import { storeToRefs } from "pinia";
import { onMounted, ref } from "vue";
import { useToast } from "vue-toast-notification";
import SplashScreen from "./SplashScreen.vue";
import { useRouter } from "vue-router";
const store = useMainStore();
const { storeLogin, fetchStoreSettings, shiftLogout } = store;
const router = useRouter();
const props = defineProps({
  selectedUser: {
    type: Object,
    required: true,
    default: {
      username: null,
    },
  },
  shiftout: {
    type: Boolean,
    default: false,
  },
  summary: {
    type: Object,
    default: {},
  },
});
const $toast = useToast();
const keys = [1, 2, 3, 4, 5, 6, 7, 8, 9, "clear", 0, "del"];
const typed_pin = ref([]);
const syncing_splash = ref(false);
const syncing_message = ref(null);
const typeNumber = async (key) => {
  if (key == "clear") typed_pin.value = "";
  else if (key == "del")
    typed_pin.value = typed_pin.value.slice(0, typed_pin.value.length - 1);
  else if (typed_pin.value.length <= 6) {
    typed_pin.value = typed_pin.value + key;
  }
  if (typed_pin.value.length == 6) {
    if (!props.shiftout) {
      syncing_splash.value = true;
      syncing_message.value = "Starting Shift";
      const loginResponse = await storeLogin(
        { email: props.selectedUser.username },
        "store-login2",
        typed_pin.value
      );
      if (loginResponse?.success) {
        $toast.open({
          type: "success",
          message: "Successfully Started Shift",
          position: "top",
        });
        syncing_message.value = "Fetching Store Settings";
        await fetchStoreSettings();
        syncing_splash.value = false;
        // fetchItems()
      } else if (loginResponse?.error && loginResponse?.errorMsg) {
        $toast.open({
          type: "error",
          message:
            typeof loginResponse?.errorMsg == "string"
              ? loginResponse?.errorMsg
              : JSON.stringify(loginResponse?.errorMsg),
          position: "bottom",
        });
      }
    } else {
      await shiftLogout(props.summary);
      router.push("/shift-login");
    }
  }
};
</script>
<template>
  <SplashScreen v-if="syncing_splash" :message="syncing_message" />
  <div
    v-else
    class="ease-linear flex flex-col items-center bg-gray-100 p-5 px-6 w-5/6 rounded-md shadow z-[99999]"
  >
    <div
      class="flex items-center justify-center gap-2 p-4 rounded-lg border-none border-slate-200 my-2"
    >
      <div
        v-for="(item, index) in [1, 2, 3, 4, 5, 6]"
        class="h-5 w-5 rounded-full border-2 border-input-muted flex items-center justify-center"
      >
        <div
          v-if="typed_pin && typed_pin[index]"
          class="ease-in-out duration-300 h-3 w-3 rounded-full bg-input-muted"
        ></div>
      </div>
    </div>
    <div class="grid grid-cols-3 w-full gap-1">
      <div
        v-for="key in keys"
        @click="typeNumber(key)"
        class="w-full select-none flex items-center justify-center bg-white text-center text-slate-900 hover:bg-gray-200 active:bg-gray-200 shadow text-xl md:text-2xl rounded-md cursor-pointer py-4"
      >
        {{ key }}
      </div>
    </div>
  </div>
</template>
