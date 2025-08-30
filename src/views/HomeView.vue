<!-- src/views/HomeView.vue -->

<script setup>
import CategoriesList from "@/components/CategoriesList.vue";
import ItemsView from "@/components/ItemsView.vue";
import SideBar from "@/components/SideBar.vue";
import { useMainStore } from "@/stores/main";
import { useRouter } from "vue-router";
const router = useRouter();
const store = useMainStore();
</script>

<template>
  <!-- Parent owns the height and prevents page scroll bleed -->
  <div class="h-full w-full grid grid-cols-12 gap-2 overflow-hidden">
    <!-- Left: Categories — THIS is the ONLY scroll area for the left side -->
    <aside class="col-span-4 min-h-0 overflow-y-auto overscroll-contain">
      <CategoriesList />
    </aside>

    <!-- Right: Items — THIS is the ONLY scroll area for the right side -->
    <section class="col-span-8 min-h-0 flex flex-col overflow-hidden">
      <ItemsView class="flex-1 min-h-0" />
    </section>
  </div>
</template>
