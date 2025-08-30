<script setup>
import { useRouter } from 'vue-router';

const router = useRouter()
</script>
<template>
    <div class="relative flex flex-col items-center justify-evenly h-full min-h-screen py-8 px-2 gap-8">
        
        <div class="flex flex-col items-center gap-8">
            <img src="/jaka-logo.png" class="w-40 object-contain" />
            <h3 class="text-2xl font-semibold">Let's you in!</h3>
        </div>
        <div class="flex flex-col w-full items-center justify-evenly gap-4 px-6">
            <button
                class="flex items-center gap-8 p-3 px-6 rounded-xl border border-gray-200 shadow bg-white active:bg-gray-50 w-full">
                <img src="/icons/google.svg" class="w-8 object-contain" />
                <p>Continue With Google</p>
            </button>
            <button
                class="flex items-center gap-8 p-3 px-6 rounded-xl border border-gray-200 shadow bg-white active:bg-gray-50 w-full">
                <img src="/icons/facebook.svg" class="w-8 object-contain" />
                <p>Continue With Facebook</p>
            </button>

            <div class="flex items-center justify-evenly w-full gap-4 ">
                <hr class="border w-full" />
                <p class="text-nowrap font-semibold text-muted-dark">Or</p>
                <hr class="border w-full" />
            </div>
            <div class="flex flex-col items-center justify-evenly w-full gap-4 ">
                <button @click="router.push('/phone-login')" class="green-bg font-semibold w-full px-8 py-4 text-white rounded-full">
                    Sign in with Emai/Phone Number
                </button>
                <div class="text-xs w-full text-center">
                    <p class="muted-text">Don't you have an account?</p>
                    <RouterLink to="/registration"><p class="green-text">Sign Up</p></RouterLink>
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