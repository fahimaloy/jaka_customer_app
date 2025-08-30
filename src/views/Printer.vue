<template>
  <div class="p-6 max-w-3xl mx-auto space-y-6 h-screen overflow-y-auto">
    <!-- Selected printer display -->
    <div v-if="selectedPrinter" class="bg-white rounded-lg shadow p-4">
      <h2 class="text-lg font-semibold mb-2">Selected Printer</h2>
      <p class="text-gray-700">
        <span class="font-medium">Name:</span> {{ selectedPrinter.name }}
      </p>
      <p class="text-gray-700">
        <span class="font-medium">Address:</span> {{ selectedPrinter.address }}
      </p>
    </div>

    <!-- Manual configure & Test Print buttons -->
    <div class="flex space-x-4 mb-4">
      <button
        class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
        @click="manualConfigVisible = !manualConfigVisible"
      >
        Manually Configure
      </button>
      <button
        class="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded"
        @click="handleTestPrint"
      >
        Test Print
      </button>
    </div>

    <!-- Manual configuration form -->
    <div
      v-if="manualConfigVisible"
      class="bg-white rounded-lg shadow p-4 space-y-4"
    >
      <input
        v-model="manualName"
        placeholder="Printer Name"
        class="w-full border border-gray-300 rounded px-3 py-2"
      />
      <input
        v-model="manualAddress"
        placeholder="Printer Address"
        class="w-full border border-gray-300 rounded px-3 py-2"
      />
      <button
        class="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded"
        @click="saveManualConfig"
      >
        Save
      </button>
    </div>

    <!-- Scan / Stop scan -->
    <button
      v-if="scanning"
      @click="stopScan()"
      class="flex items-center bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded mb-4"
    >
      <span
        class="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"
      ></span>
      Stop Scan
    </button>
    <button
      v-else
      @click="startScanning"
      class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded mb-4"
    >
      Start Scan
    </button>

    <!-- Connection controls -->
    <div v-if="connected" class="bg-white rounded-lg shadow p-4 space-y-4">
      <p class="text-green-700 font-medium">
        Connected to {{ selectedPrinter?.name || "device" }}
      </p>
      <button
        class="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-2 px-4 rounded"
        @click="disconnectTo()"
      >
        Disconnect
      </button>

      <div class="flex items-center space-x-4">
        <input
          v-model="sendData"
          placeholder="Send data"
          class="flex-1 border border-gray-300 rounded px-3 py-2"
        />
        <button
          class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
          @click="sendString(CHAR_UUID, sendData)"
        >
          Send
        </button>
      </div>

      <div class="flex items-center space-x-4">
        <input
          v-model="recvData"
          readonly
          class="flex-1 border border-gray-300 rounded px-3 py-2 bg-gray-100"
        />
        <button
          class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
          @click="read()"
        >
          Read
        </button>
      </div>

      <div class="flex items-center space-x-4">
        <input
          v-model="notifyData"
          readonly
          class="flex-1 border border-gray-300 rounded px-3 py-2 bg-gray-100"
        />
        <button
          class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
          @click="toggleNotify"
        >
          {{ notifyData ? "Unsubscribe" : "Subscribe" }}
        </button>
      </div>
    </div>

    <!-- Device list -->
    <div v-else class="space-y-4">
      <label class="inline-flex items-center space-x-2">
        <input
          type="checkbox"
          v-model="showServices"
          class="form-checkbox h-5 w-5 text-blue-600"
        />
        <span class="text-gray-700">Show Services</span>
      </label>

      <div
        v-for="device in devices"
        :key="device.address"
        class="bg-white shadow-md rounded-lg p-4"
      >
        <h3 class="text-lg font-semibold">{{ device.name }}</h3>
        <p class="text-gray-600">{{ device.address }}</p>

        <div class="mt-2">
          <strong class="text-gray-700">Manufacturer data:</strong>
          <p
            v-for="[key, val] in Object.entries(device.manufacturerData)"
            class="text-gray-600"
          >
            {{ key }}: {{ val }}
          </p>
        </div>
        <div class="mt-2">
          <strong class="text-gray-700">Service data:</strong>
          <p
            v-for="[key, val] in Object.entries(device.serviceData)"
            class="text-gray-600"
          >
            {{ key }}: {{ val }}
          </p>
        </div>
        <div v-if="showServices" class="mt-2">
          <strong class="text-gray-700">Services:</strong>
          <p v-for="svc in device.services" class="text-gray-600">{{ svc }}</p>
        </div>

        <p
          class="mt-2 font-medium"
          :class="device.isConnected ? 'text-green-600' : 'text-red-600'"
        >
          {{ device.isConnected ? "Connected" : "Not Connected" }}
        </p>

        <div class="flex space-x-4 mt-4">
          <button
            class="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded"
            @click="selectDevice(device)"
          >
            Select
          </button>
          <button
            class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
            @click="connectTo(device.address)"
          >
            Connect
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import {
  getConnectionUpdates,
  getScanningUpdates,
  startScan,
  stopScan,
  connect,
  disconnect as disconnectBle,
  sendString,
  readString,
  subscribeString,
  unsubscribe,
} from "@mnlphlp/plugin-blec";

const devices = ref([]);
const connected = ref(false);
const scanning = ref(false);
const showServices = ref(false);

const sendData = ref("");
const recvData = ref("");
const notifyData = ref("");

// Manual config state
const manualConfigVisible = ref(false);
const manualName = ref("");
const manualAddress = ref("");

// Selected printer
const selectedPrinter = ref(null);

const CHAR_UUID = "51FF12BB-3ED8-46E5-B4F9-D64E2FEC021B";

onMounted(async () => {
  const saved = localStorage.getItem("selected_printer");
  if (saved) selectedPrinter.value = JSON.parse(saved);

  await getConnectionUpdates((st) => (connected.value = st));
  await getScanningUpdates((st) => (scanning.value = st));
});

function startScanning() {
  startScan((devs) => (devices.value = devs), 10000);
}

function connectTo(addr) {
  connect(addr, () => console.log("disconnected"));
}

function selectDevice(dev) {
  selectedPrinter.value = dev;
  localStorage.setItem("selected_printer", JSON.stringify(dev));
}

function saveManualConfig() {
  const dev = {
    name: manualName.value,
    address: manualAddress.value,
    manufacturerData: {},
    serviceData: {},
    services: [],
    isConnected: false,
  };
  selectedPrinter.value = dev;
  localStorage.setItem("selected_printer", JSON.stringify(dev));
  manualConfigVisible.value = false;
}

async function printTestInvoice() {
  const invoice = [
    "----- Test Invoice -----",
    "Item A    x1    $10.00",
    "Item B    x2    $20.00",
    "------------------------",
    "Total:         $30.00",
    "Thank you!",
    "\n\n",
  ].join("\n");
  try {
    await sendString(CHAR_UUID, invoice);
  } catch (e) {
    console.error("Failed to print invoice:", e);
  }
}

function handleTestPrint() {
  if (!localStorage.getItem("selected_printer")) {
    alert("Please select a printer first");
  } else {
    printTestInvoice();
  }
}

function read() {
  readString(CHAR_UUID).then((data) => (recvData.value = data));
}

function toggleNotify() {
  if (notifyData.value) {
    unsubscribe(CHAR_UUID);
    notifyData.value = "";
  } else {
    subscribeString(CHAR_UUID, (d) => (notifyData.value = d));
  }
}

function disconnectTo() {
  unsubscribe(CHAR_UUID);
  disconnectBle();
}
</script>
