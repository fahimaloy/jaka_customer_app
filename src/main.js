import "./assets/main.css";

import { createApp } from "vue";
import { createPinia } from "pinia";

import App from "./App.vue";
import router from "./router";
import Unicon from "vue-unicons";
import {
  uniArrowLeft,
  uniEnvelopeAlt,
  uniUser,
  uniPhoneAlt,
  uniKeySkeleton,
  uniLocationPoint,
  uniShoppingCart,
  uniBell,
  uniAlignJustify,
  uniPlus,
  uniMinus,
  uniTrashAlt,
  uniSearch,
  uniTimes,
  uniUsersAlt,
  uniListUl,
  uniSetting,
  uniPrint,
  uniCamera,
  uniDatabaseAlt,
  uniAngleUp,
  uniAngleDown,
  uniEyeSlash,
  uniEye,
  uniDraggabledots,
} from "vue-unicons/dist/icons";
import ToastPlugin from "vue-toast-notification";
import "vue-toast-notification/dist/theme-bootstrap.css";
import piniaPersistedState from "pinia-plugin-persistedstate";

Unicon.add([
  uniArrowLeft,
  uniEnvelopeAlt,
  uniUser,
  uniPhoneAlt,
  uniKeySkeleton,
  uniLocationPoint,
  uniShoppingCart,
  uniBell,
  uniAlignJustify,
  uniPlus,
  uniMinus,
  uniTrashAlt,
  uniSearch,
  uniTimes,
  uniUsersAlt,
  uniListUl,
  uniSetting,
  uniPrint,
  uniCamera,
  uniDatabaseAlt,
  uniAngleUp,
  uniAngleDown,
  uniEyeSlash,
  uniEye,
  uniDraggabledots,
]);
const app = createApp(App);
const pinia = createPinia();
pinia.use(piniaPersistedState);
app.use(pinia);
app.use(ToastPlugin);
app.use(router);
app.use(Unicon);
app.mount("#app");
// Register the PWA service worker
if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("/sw.js")
    .then((registration) => {
      console.log("Service Worker registered with scope:", registration.scope);
    })
    .catch((err) => {
      console.error("Service Worker registration failed:", err);
    });
}
// "bundledWebRuntime": false,
// "server": {
//   "url": "http://192.168.0.101:5173",
//   "cleartext": true,
//   "port": 5173
// },
