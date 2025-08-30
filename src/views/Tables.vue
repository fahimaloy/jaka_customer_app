<template>
  <div class="h-full">
    <h2
      v-if="showTableDetails"
      @click="() => (showTableDetails = false)"
      class="flex items-center p-3 py-1 cursor-pointer underline font-bold text-base gap-0.5"
    >
      <unicon name="arrow-left" fill="black" height="24" width="24" />
      <span>Back</span>
    </h2>
    <TableDetails
      v-if="showTableDetails"
      @back="() => (showTableDetails = false)"
    />
    <div
      v-else
      class="flex flex-col gap-2 overflow-y-scroll max-h-[90vh] h-[90vh] pb-20 px-4"
    >
      <div class="w-full flex gap-4 items-center m-2 justify-between">
        <h3 class="text-lg font-semibold">Tables</h3>
      </div>
      <div class="flex flex-wrap gap-2">
        <div
          v-for="(floor, floorIndex) in floorNtables"
          class="flex flex-col text-wrap gap-2 rounded-md shadow p-4 w-full cursor-pointer"
          :class="floorIndex - 1 == floorNtables ? '' : 'border-b'"
        >
          <h2 class="text-base font-semibold w-full border-b pb-0.5">
            {{ floor?.name }}
          </h2>
          <div class="flex items-center flex-wrap gap-4 p-1">
            <div
              v-if="floor?.tables && floor?.tables?.length"
              class="flex flex-col gap-1 border-slate-400 items-center justify-center text-center w-28 h-28 cursor-pointer border-2 p-5 border-dashed font-semibold relative"
              v-for="table in floor?.tables"
              @click="toggleTable(table)"
              :class="
                selectedTable && selectedTable?.id == table?.id
                  ? 'bg-primary-light border-violet-200 text-white'
                  : table?.status == TABLESTATES.FREE
                  ? 'bg-transparent text-slate-500'
                  : table?.status == TABLESTATES.BUSY
                  ? 'bg-red-600 text-white'
                  : table?.status == TABLESTATES.READYTOBILL
                  ? 'bg-primary text-white'
                  : ''
              "
            >
              <span class="text-sm">{{ table?.name }}</span>
              <span v-if="table?.tableOrder?.length" class="text-xxs">
                SAR

                {{
                  getDecimalNumber(
                    calculateTotalPayableAmount(table.tableOrder),
                    settings?.pos_settings?.currency_decimal
                  )
                }}
              </span>
              <span v-if="elapsedTimes[table?.id]" class="text-xxs">{{
                elapsedTimes[table?.id]
              }}</span>

              <span
                v-if="selectedTable && table?.id == selectedTable?.id"
                class="p-[2px] text-xxs text-center bg-slate-300 text-slate-800 rounded-sm absolute -bottom-2 -left-1 -right-1"
                >Selected</span
              >
              <span
                v-else-if="table?.status != TABLESTATES.FREE"
                class="p-[2px] uppercase text-xxs text-center bg-slate-300 text-slate-800 rounded-sm absolute -bottom-2 -left-1 -right-1"
                >{{ table?.status }}</span
              >
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useMainStore } from "@/stores/main";
import AddCustomerModal from "@/components/AddCustomerModal.vue";
import TableDetails from "@/components/TableDetails.vue";
import { storeToRefs } from "pinia";
import { ref, onMounted, onUnmounted } from "vue";
import { TABLESTATES } from "@/lib/conf";
import getDecimalNumber from "@/lib/getDecimalNumber";

const show_add_customer_modal = ref(false);
const store = useMainStore();
const { floorNtables, selectedTable } = storeToRefs(store);
const { setSelectedTable } = store;
const showTableDetails = ref(false);
const elapsedTimes = ref({});

const calculateElapsedTime = (timestamp) => {
  if (!timestamp) return null;

  const now = Date.now();
  const elapsed = now - timestamp;

  const hours = Math.floor(elapsed / (1000 * 60 * 60));
  const minutes = Math.floor((elapsed % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 0) {
    return `${hours} Hr${hours > 1 ? "s" : ""} ${minutes} Min${
      minutes > 1 ? "s" : ""
    }`;
  } else {
    return `${minutes} Min${minutes > 1 ? "s" : ""}`;
  }
};

const calculateTotalPayableAmount = (tableOrders) => {
  if (!tableOrders || tableOrders.length === 0) return null;
  return tableOrders.reduce(
    (total, order) => total + (order.totalPayableAmount || 0),
    0
  );
};

const updateElapsedTimes = () => {
  floorNtables.value.forEach((floor) => {
    floor.tables.forEach((table) => {
      if (table.time) {
        elapsedTimes.value[table.id] = calculateElapsedTime(table.time);
      }
    });
  });
};

onMounted(() => {
  updateElapsedTimes(); // Initial update
  const interval = setInterval(updateElapsedTimes, 60000); // Update every minute

  onUnmounted(() => {
    clearInterval(interval); // Cleanup interval on component unmount
  });
});

const toggleTable = (table) => {
  if (
    table?.status == TABLESTATES.BUSY ||
    table?.status == TABLESTATES.READYTOBILL
  ) {
    setSelectedTable(table);
    showTableDetails.value = true;
    return;
  }
  if (selectedTable.value?.id == table?.id) {
    setSelectedTable(null);
  } else {
    setSelectedTable(table);
  }
};

const edit = ref(false);
</script>
