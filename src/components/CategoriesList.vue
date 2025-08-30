<!-- src/components/CategoriesList.vue -->

<script setup>
import { useMainStore } from "@/stores/main";
import { storeToRefs } from "pinia";
import { onMounted, ref, watch } from "vue";

const store = useMainStore();
const { all_categories, selectedCategoryId } = storeToRefs(store);
const { setSelectedCategoryId } = store;

const categoriesList = ref([]);

// Build list with "ALL" at the top
function addAllcategories(source) {
  const raw = Array.isArray(source)
    ? source
    : Array.isArray(source?.value)
    ? source.value
    : [];
  const arr = [
    { name: "ALL", id: 0, image_url: null },
    ...raw.map((c) => ({
      id: c?.id ?? c?.category_id ?? Math.random(),
      name: c?.name ?? c?.title ?? "Unnamed",
      image_url: c?.image_url ?? c?.image ?? null,
    })),
  ];
  categoriesList.value = arr;
}

watch(all_categories, (val) => addAllcategories(val), { immediate: true });

onMounted(() => {
  addAllcategories(all_categories);
  setSelectedCategoryId(0);
});

// UI helpers
const isSelected = (id) => selectedCategoryId.value == id;

function initialsOf(name) {
  if (!name) return "??";
  const parts = String(name).trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() || "").join("") || "??";
}

// Simple hash + palette for avatar colors
function hashString(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
  }
  return Math.abs(h);
}
const palette = [
  ["#0ea5e9", "#38bdf8"],
  ["#22c55e", "#4ade80"],
  ["#f59e0b", "#fbbf24"],
  ["#a855f7", "#c084fc"],
  ["#ef4444", "#f87171"],
  ["#06b6d4", "#22d3ee"],
  ["#10b981", "#34d399"],
];
function gradientFor(name) {
  const idx = hashString(name || "x") % palette.length;
  const [c1, c2] = palette[idx];
  return `linear-gradient(135deg, ${c1}, ${c2})`;
}
</script>

<template>
  <!-- Do NOT make this a scroller; the <aside> in HomeView scrolls -->
  <div class="flex flex-col bg-white shadow h-full overflow-hidden">
    <div
      v-if="categoriesList && categoriesList.length"
      class="p-2 overflow-y-scroll space-y-2.5 pt-20 pb-32"
    >
      <button
        v-for="category in categoriesList"
        :key="category.id"
        type="button"
        @click="setSelectedCategoryId(category.id)"
        class="w-full cursor-pointer rounded-xl px-3 py-3 transition border flex items-center gap-3 text-left"
        :class="
          isSelected(category.id)
            ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
            : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200'
        "
      >
        <!-- Thumbnail -->
        <div class="shrink-0">
          <img
            v-if="category.image_url"
            :src="category.image_url"
            :alt="category.name"
            class="h-10 w-10 rounded-lg object-cover ring-1"
            :class="isSelected(category.id) ? 'ring-white/20' : 'ring-black/5'"
            loading="lazy"
            decoding="async"
            @error="category.image_url = null"
          />
          <div
            v-else
            class="h-10 w-10 rounded-lg flex items-center justify-center text-white text-xs font-extrabold ring-1"
            :class="isSelected(category.id) ? 'ring-white/20' : 'ring-black/5'"
            :style="{ background: gradientFor(category.name) }"
          >
            {{ initialsOf(category.name) }}
          </div>
        </div>

        <!-- Name -->
        <div class="min-w-0 flex-1">
          <div
            class="text-sm font-semibold leading-5 truncate"
            :class="isSelected(category.id) ? 'text-white' : 'text-slate-800'"
            :title="category.name"
          >
            {{ category.name }}
          </div>
        </div>
      </button>
    </div>

    <!-- Empty state -->
    <div v-else class="p-4 text-center text-sm text-slate-500">
      No categories found.
    </div>
  </div>
</template>

<!-- No scrollbar-hide here; the parent <aside> handles scrolling -->
