<template>
  <div class="p-3 min-h-screen pb-32 h-full overflow-y-scroll bg-gray-50">
    <h1 class="text-lg font-bold mb-4 text-primary">
      {{ isEdit ? "Edit" : "Add" }} Item
    </h1>
    <form @submit.prevent="handleSubmit" class="space-y-3">
      <div class="form-group">
        <label class="block text-xs font-medium mb-0.5">Item Code</label>
        <input
          v-model="itemCode"
          type="text"
          required
          class="w-full py-1.5 px-3 border rounded-md focus:ring-1 focus:ring-primary text-sm"
        />
      </div>
      <div class="form-group">
        <label class="block text-xs font-medium mb-0.5">Name</label>
        <input
          v-model="name"
          type="text"
          required
          class="w-full py-1.5 px-3 border rounded-md focus:ring-1 focus:ring-primary text-sm"
        />
      </div>
      <div class="form-group">
        <div class="flex justify-between items-center mb-0.5">
          <label class="block text-xs font-medium">Arabic Name</label>
          <button
            type="button"
            class="text-xs bg-secondary px-2 py-1 rounded text-white"
            @click="translateName"
            :disabled="translating"
          >
            {{ translating ? "Translating…" : "Translate" }}
          </button>
        </div>
        <input
          v-model="arabicName"
          type="text"
          class="w-full py-1.5 px-3 border rounded-md focus:ring-1 focus:ring-primary text-sm"
        />
      </div>
      <div class="form-group">
        <label class="block text-xs font-medium mb-0.5">Category</label>
        <select
          v-model="selectedCategory"
          class="w-full py-1.5 px-3 border rounded-md focus:ring-1 focus:ring-primary text-sm"
        >
          <option
            v-for="category in all_categories"
            :key="category.id"
            :value="category.id"
          >
            {{ category.id }} - {{ category.name }}
          </option>
        </select>
      </div>
      <div class="grid grid-cols-3 gap-3">
        <div>
          <label class="block text-xs font-medium mb-0.5">Buying Price</label>
          <input
            v-model="buyingPrice"
            type="number"
            step="0.01"
            class="w-full py-1.5 px-3 border rounded-md focus:ring-1 focus:ring-primary text-sm"
          />
        </div>
        <div>
          <label class="block text-xs font-medium mb-0.5">Selling Price</label>
          <input
            v-model="sellingPrice"
            type="number"
            step="0.01"
            class="w-full py-1.5 px-3 border rounded-md focus:ring-1 focus:ring-primary text-sm"
          />
        </div>
        <div>
          <label class="block text-xs font-medium mb-0.5">Tax Percentage</label>
          <input
            v-model="taxPercentage"
            type="number"
            step="0.01"
            class="w-full py-1.5 px-3 border rounded-md focus:ring-1 focus:ring-primary text-sm"
          />
        </div>
      </div>
      <div class="flex items-center gap-2 text-sm">
        <input
          v-model="online"
          type="checkbox"
          class="w-4 h-4 text-primary rounded focus:ring-primary"
        />
        <label>Available Online</label>
      </div>
      <div class="form-group">
        <label class="block text-xs font-medium mb-1">Barcodes</label>
        <div
          v-for="(barcode, index) in multibarcodes"
          :key="index"
          class="flex gap-2 mb-1"
        >
          <input
            v-model="barcode.barcode"
            type="text"
            class="flex-1 py-1.5 px-3 border rounded-md focus:ring-1 focus:ring-primary text-sm"
          />
          <button
            v-if="index === multibarcodes.length - 1"
            @click="addBarcode"
            type="button"
            class="px-2.5 py-1 bg-primary text-white rounded-md text-sm"
          >
            Add
          </button>
        </div>
      </div>
      <button
        type="submit"
        class="w-full py-2 bg-primary text-white rounded-md text-sm font-medium hover:bg-dark-primary"
      >
        {{ isEdit ? "Update Item" : "Create Item" }}
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { updateItem, saveItem } from "@/lib/db/items";
import { useMainStore } from "@/stores/main";
import { storeToRefs } from "pinia";
import { useRouter } from "vue-router";
import axios from "axios";
const store = useMainStore();
const { baseURL, shiftUser, all_categories } = storeToRefs(store);
const route = useRoute();
const isEdit = ref(false);
const { setForceLogout } = store;
const itemCode = ref("");
const name = ref("");
const arabicName = ref("");
const sellingPrice = ref(0);
const buyingPrice = ref(0);
const taxPercentage = ref(15);
const online = ref(false);
const multibarcodes = ref([{ barcode: "" }]);
const selectedCategory = ref("");
const router = useRouter();
const translating = ref(false);
const translateName = async () => {
  if (!name.value.trim()) return;
  translating.value = true;
  try {
    const { data } = await axios.get(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
        name.value
      )}&langpair=en|ar`
    );
    const text = data?.responseData?.translatedText || null;
    if (text) arabicName.value = text;
    else alert("No translation found");
  } catch (e) {
    console.error(e);
    alert("Failed to translate");
  } finally {
    translating.value = false;
  }
};
onMounted(() => {
  if (route.params.item) {
    isEdit.value = true;
    const item = JSON.parse(route.params.item);
    itemCode.value = item.item_code;
    name.value = item.name;
    arabicName.value = item.arabic_name;
    sellingPrice.value = item.selling_price;
    buyingPrice.value = item.buying_price;
    taxPercentage.value = item.tax_percent;
    online.value = item.online;
    if (item.multibarcodes?.length)
      multibarcodes.value = [...item.multibarcodes, { barcode: "" }];
    selectedCategory.value = item.category;
  } else {
    selectedCategory.value = all_categories.value[0]?.id || null;
  }
});
const addBarcode = () => multibarcodes.value.push({ barcode: "" });
const handleSubmit = async () => {
  const payload = {
    item_code: itemCode.value,
    item_category_id: selectedCategory.value,
    name: name.value,
    arabic_name: arabicName.value,
    price: sellingPrice.value,
    buying_price: buyingPrice.value,
    tax_percentage: taxPercentage.value,
    online: online.value,
    multibarcodes: multibarcodes.value
      .filter((b) => b.barcode.trim())
      .slice(0, -1),
  };
  if (isEdit.value) {
    const it = JSON.parse(route.params.item);
    payload.id = it.id;
    payload.type = "update";
  }
  try {
    const resp = await axios.post(
      baseURL.value + "/create-update-item",
      {
        data: payload,
        user_id: shiftUser.value?.location_user_id,
        username: shiftUser.value?.username,
      },
      { headers: { Authorization: localStorage.getItem("token") } }
    );
    if (![200, 201, 202].includes(resp.status))
      throw new Error(resp.data.error || "Error");
    const data = resp.data;
    const ITEM = {
      ...data,
      multibarcodes: payload.multibarcodes,
      search_name: (data.name || "").toLowerCase(),
    };
    const dbRes = isEdit.value ? await updateItem(ITEM) : await saveItem(ITEM);
    if (dbRes.success) {
      alert(
        isEdit.value ? "Item updated successfully" : "Item created successfully"
      );
      router.push("/home");
    } else {
      alert(`DB ERROR: ${JSON.stringify(dbRes.error)}`);
    }
  } catch (e) {
    console.error(e);
    if (
      e.response?.data?.detail ===
      "Authentication credentials were not provided."
    )
      setForceLogout(true);
    else alert(e.response?.data?.error || e.message);
  }
};
</script>

<style>
.form-group {
  @apply mb-4;
}
</style>
