<script setup>
import { useMainStore } from '@/stores/main';
import { ref } from 'vue';
import { RouterLink } from 'vue-router';
import {useToast} from 'vue-toast-notification';
import 'vue-toast-notification/dist/theme-sugar.css';
import SplashScreen from '@/components/SplashScreen.vue';
const email = ref("goldenb@jakac.com")
const password = ref("jakatest")
// const phone = ref("")
const remember = ref(false)
const store = useMainStore();
const { storeLogin, getItems, setAuthenticated } = store;
const syncing_splash = ref(false);
const $toast = useToast();
const fetchItems = async () => {
    syncing_splash.value = true
    const response = await getItems();
    if(response?.success) {
        syncing_splash.value = false
        setAuthenticated(true);
    }
}
const login = async () => {
    const payload = {
        email: email.value,
        password: password.value
    }
    const loginResponse = await storeLogin(payload)
    if(loginResponse?.success) {
        $toast.open({
            type: "success",
            message:'Successfully Logged In',
            position: 'top'
        });
        syncing_splash.value = true;
        fetchItems()
    } else if(loginResponse?.error && loginResponse?.errorMsg) {
        $toast.open({
            type: "error",
            message: typeof loginResponse?.errorMsg == 'string' ? loginResponse?.errorMsg : JSON.stringify(loginResponse?.errorMsg),
            position: 'bottom'
        });
    }
}
</script>

<template>
    <SplashScreen v-if="syncing_splash" message="Syncing Items"/>
    <div v-else class="flex flex-col items-center justify-evenly h-full min-h-screen py-8 px-2 gap-8">
        <div class="flex flex-col items-center gap-8">
            <img src="/jaka-logo.png" class="w-40 object-contain" />
            <h3 class="text-2xl font-semibold">Create New Account</h3>
        </div>
        <div class="flex flex-col w-full items-center gap-6 px-6">

            <div class="flex flex-col items-cente w-full gap-2">
                <div :class="email ? 'fill-black' : 'fill-input-muted'"
                    class="flex gap-4 items-center w-full rounded-xl border p-2 focus-within:bg-primary fill-input-muted text-black placeholder-input-muted focus-within:fill-white focus-within:text-white">
                    <unicon :height="32" :width="32" name="envelope-alt"></unicon>
                    <input type="text" v-model="email"
                        class="border-none outline-none ring-0 px-2 w-full bg-transparent focus:placeholder-white"
                        placeholder="Email" />
                </div>
            </div>
            <div class="flex flex-col items-cente w-full gap-2">
                <div :class="password ? 'fill-black' : 'fill-input-muted'"
                    class="flex gap-4 items-center w-full rounded-xl border p-2 focus-within:bg-primary fill-input-muted text-black placeholder-input-muted focus-within:fill-white focus-within:text-white">
                    <unicon :height="32" :width="32" name="key-skeleton"></unicon>
                    <input v-model="password"
                        class="border-none outline-none ring-0 px-2 w-full bg-transparent focus:placeholder-white"
                        placeholder="Password" type="password" />
                </div>
            </div>

            <div class="inline-flex gap-4 items-center">
                <label class="flex items-center cursor-pointer relative">
                    <input type="checkbox" :checked="remember"
                        class="peer h-5 w-5 cursor-pointer transition-all appearance-none rounded shadow hover:shadow-md  border-2 border-primary checked:bg-primary"
                        id="check" />
                    <span
                        class="absolute text-white opacity-0 peer-checked:opacity-100 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 20 20"
                            fill="currentColor" stroke="currentColor" stroke-width="1">
                            <path fill-rule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clip-rule="evenodd"></path>
                        </svg>
                    </span>
                </label>
                Remember Me
            </div>
            <button @click="login" class="green-bg font-semibold w-full px-8 py-4 text-white rounded-full">
                Sign In
            </button>
        </div>
        <div class="flex items-center justify-evenly w-full gap-4 ">
            <hr class="border w-full" />
            <p class="text-nowrap font-semibold text-muted-dark">Or Continue With</p>
            <hr class="border w-full" />
        </div>
        <div class="flex gap-4">
            <button
                class="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-200 shadow bg-white active:bg-gray-50 w-full">
                <img src="/icons/google.svg" class="w-8 object-contain" />
            </button>
            <button
                class="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-200 shadow bg-white active:bg-gray-50 w-full">
                <img src="/icons/facebook.svg" class="w-8 object-contain" />
            </button>
        </div>
        <div class="flex flex-col w-full items-center justify-evenly gap-4 px-6">
            <div class="flex flex-col items-center justify-evenly w-full gap-4 ">
                <div class="text-xs w-full text-center">
                    <p class="muted-text">Already have an account?</p>
                    <RouterLink to="/login">
                        <p class="green-text">Sign In</p>
                    </RouterLink>
                </div>
            </div>
        </div>
    </div>
</template>
<style scoped>
.green-bg {
    background-color: #22B453;
}

.green-text {
    color: #22B453;
}

.muted-text {
    color: #A5A4A4;
}
</style>