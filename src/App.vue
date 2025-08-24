<script setup lang="ts">
import { IonApp } from '@ionic/vue'
</script>

<template>
  <IonApp>
    <transition name="fade" mode="out-in">
      <router-view />
    </transition>
  </IonApp>
</template>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
