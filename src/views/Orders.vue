<template>
  <div
    v-if="!show_order_details"
    class="flex flex-col items-center gap-2 w-full h-[90vh] overflow-y-scroll pb-32"
  >
    <div
      v-for="order in order_list"
      @click="openOrder(order)"
      :key="order?.ptid"
      :class="
        selected_order?.ptid == order?.ptid
          ? 'border-primary border-l-8'
          : 'border-slate-400 border-l-4'
      "
      class="flex border-l cursor-pointer gap-2 flex-col p-3 rounded-md shadow w-full justify-between bg-white"
    >
      <div class="flex justify-between items-center flex-wrap">
        <div class="text-wrap">
          {{ order?.ptid }} | {{ order?.token_counter }} |
          {{ order?.invoice_num }}
        </div>
        <div class="text-xs">25-11-2024</div>
      </div>
      <div class="flex justify-between items-center flex-wrap">
        <div>
          SAR
          {{
            getDecimalNumber(
              order?.cartState?.totalPayableAmount,
              currency_decimal
            )
          }}
        </div>
        <div
          class="w-fit p-0.5 text-xs text-center px-1 text-white rounded-md"
          :class="order?.is_synced == 1 ? 'bg-primary' : 'bg-red-600'"
        >
          {{ order?.is_synced == 1 ? "Synced" : "Not Synced" }}
        </div>
      </div>
    </div>
  </div>
  <div
    v-else
    class="flex flex-col p-2 pb-40 h-full overflow-y-scroll mx-1 px-2 min-h-screen"
  >
    <div
      id="invoice-data"
      ref="invoiceDataRef"
      class="bg-white overflow-y-scroll min-h-screen p-4"
    >
      <div class="text-center mb-0.5">
        <div class="px-10 p-2">
          <img
            :src="settings.pos_settings?.logo_url || '/jaka-logo.png'"
            alt="Logo"
            class="mx-auto"
            :class="settings?.pos_settings?.logo_url ? 'h-16' : 'h-16'"
          />
        </div>
        <h1
          v-if="
            settings?.print_settings?.company_name && merchant?.name != 'nan'
          "
          class="font-bold text-sm uppercase"
        >
          {{ merchant?.name }}
        </h1>
        <!-- <p class="text-xs">VAT No: {{ merchant?.trn }}</p> -->
        <p
          v-if="
            print_settings?.address_name &&
            settings?.location?.address &&
            settings?.location?.address != 'nan'
          "
          class="text-xs"
        >
          {{ settings?.location?.address }}
        </p>
        <p
          v-if="
            print_settings?.location_name &&
            print_settings?.city_name &&
            settings?.location?.city &&
            settings?.location?.region &&
            settings?.location?.city != 'nan' &&
            settings?.location?.region != 'nan'
          "
          class="text-xs"
        >
          {{ settings?.location?.city }}, {{ settings?.location?.region }}
        </p>
        <p
          v-if="
            ((settings?.merchant?.company_reg_num &&
              settings?.merchant?.company_reg_num != 'nan') ||
              (settings?.location?.branch_cr_num &&
                settings?.location?.branch_cr_num != 'nan')) &&
            print_settings?.cr_num
          "
          class="text-xs"
        >
          {{
            `CR: ${
              settings?.merchant?.company_reg_num ||
              settings?.location?.branch_cr_num
            } : السجل`
          }}
        </p>
        <p
          v-if="
            settings?.merchant?.trn &&
            settings?.merchant?.trn != 'nan' &&
            print_settings?.TRN
          "
          class="text-xs"
        >
          {{ `VAT No: ${settings?.merchant?.trn} : رقم  الضريبي` }}
        </p>
        <p
          v-if="
            settings?.location?.name &&
            settings?.location?.name != 'nan' &&
            print_settings?.location_name
          "
          class="text-xs"
        >
          {{ settings?.location?.name }}
        </p>
        <p
          v-if="
            settings?.location?.phone &&
            settings?.location?.phone != 'nan' &&
            print_settings?.phone
          "
          class="text-xs"
        >
          Phone : {{ settings?.location?.phone }} : هاتف
        </p>
      </div>
      <div
        class="w-full border-t border-black py-0.5 text-sm text-center"
        v-if="
          print_settings?.invoice_title &&
          print_settings.invoice_title &&
          print_settings.invoice_title != '' &&
          print_settings.invoice_title != 'nan'
        "
      >
        {{ print_settings.invoice_title }}
      </div>
      <div
        class="w-full border-t border-black py-0.5 text-sm text-center"
        v-if="
          print_settings?.header_message &&
          print_settings.header_message_text &&
          print_settings.header_message_text != '' &&
          print_settings.header_message_text != 'nan'
        "
      >
        {{ print_settings.header_message_text }}
      </div>

      <div class="border-y border-black py-2 my-0.5 mt-0.5">
        <div
          :style="`font-size:${print_settings?.token_num_font_size || 8}px`"
          class="flex gap-2 items-center text-xs w-full"
        >
          <span>Token </span>
          <span class="text-right"> الطلب :</span>
          <span>{{ selected_order?.token_counter }} </span>
        </div>
        <div
          :style="`font-size:${print_settings?.invoice_num_font_size || 8}px`"
          class="text-xs flex items-center gap-2"
        >
          <span>Invoice </span>
          <span class="text-right"> الفاتورة :</span>
          <span>{{ selected_order?.invoice_num }} </span>
        </div>
        <div
          :style="`font-size:${print_settings?.time_font_size || 8}px`"
          class="text-xs flex items-center gap-2"
        >
          <span>Date</span>
          <span> الوقت :</span>
          <span>{{
            moment(selected_order.time).format("DD/MM/YYYY  h:mm a")
          }}</span>
        </div>

        <div
          v-if="selected_order?.order_source"
          :style="`font-size:${print_settings?.order_source_font_size || 8}px`"
          class="text-xs flex items-center gap-2"
        >
          <span>Order Source</span>
          <span> المصدر :</span>
          <span>{{ selected_order?.order_source }}</span>
        </div>
        <div
          :style="`font-size:${print_settings?.order_type_font_size || 8}px`"
          v-if="selected_order?.order_type"
          class="text-xs flex items-center gap-2"
        >
          <span>Order Type</span>
          <span> نوع الطلب :</span>
          <span>{{ selected_order?.order_type }}</span>
        </div>
        <div
          v-if="selected_order?.user?.name && print_settings?.cashier"
          :style="`font-size:${print_settings?.cashier_font_size || 8}px`"
          class="text-xs flex items-center gap-2"
        >
          <span>Cashier</span>
          <span> الموظف :</span>
          <span>{{ selected_order?.user?.name }}</span>
        </div>
        <div
          v-if="selected_order?.customer && print_settings?.customer_details"
          :style="`font-size:${
            print_settings?.customer_details_font_size || 8
          }px`"
          class="text-xs flex items-center gap-2"
        >
          <span>Customer</span>
          <span> العميل :</span>
          <span
            >{{ selected_order?.customer?.name }} -
            {{ selected_order?.customer?.phone }}</span
          >
        </div>
        <div
          v-if="selected_order?.notes || selected_order?.note"
          :style="`font-size:${print_settings?.cashier_font_size || 8}px`"
          class="text-xs flex items-center gap-2"
        >
          <span>Note</span>
          <span>{{ selected_order?.notes || selected_order?.note }} </span>
        </div>
      </div>

      <div
        class="mb-2"
        :style="`font-size:${print_settings?.cart_item_font_size || 7}px`"
      >
        <div
          class="flex items-center font-bold border-b border-black py-0.5 mb-0.5"
        >
          <div class="w-[50%]">Item</div>
          <div class="w-[20%] text-right">Price</div>
          <div class="w-[15%] text-right">Qty</div>
          <div class="w-[15%] text-right">Total</div>
        </div>

        <div
          v-for="item in selected_order?.cartState?.orderitems"
          class="flex text-xs py-1 border-b border-dashed"
        >
          <div class="w-[50%]">
            <div>{{ item.name }}</div>
            <div class="text-xs text-gray-600" v-if="item?.arabic_name">
              {{ item.arabic_name }}
            </div>
            <div class="text-xs text-gray-600" v-if="item?.modifiers">
              <p v-for="mod in item.modifiers">
                {{ mod?.name }} - {{ mod?.additional_price }}
              </p>
            </div>
            <div class="text-xs text-gray-600" v-if="item?.notes">
              <b>Notes:</b>{{ item.notes }}
            </div>
          </div>
          <div class="w-[20%] text-right">
            {{ getDecimalNumber(item.price, currency_decimal) }}
          </div>
          <div class="w-[15%] text-right">
            {{ getDecimalNumber(item.quantity, currency_decimal) }}
          </div>
          <div class="w-[15%] text-right">
            {{ getDecimalNumber(item.price * item.quantity, currency_decimal) }}
          </div>
        </div>
      </div>

      <div
        :style="`font-size:${print_settings?.item_qty_totals_font_size || 9}px`"
        class="text-xs border-t border-black pt-2"
      >
        <div
          class="flex items-center gap-2 font-bold"
          :style="`font-size:${
            print_settings?.total_payable_font_size || 10
          }px`"
        >
          <span class="text-nowrap">Total Due:</span>
          <span class="text-nowrap ml-2"> إجمالي المستحق : </span>
          <span class="w-full text-right"
            >SAR
            {{
              getDecimalNumber(
                selected_order?.cartState?.totalPayableAmount || 0.0,
                currency_decimal
              )
            }}</span
          >
        </div>
        <div class="flex items-center gap-2">
          <span class="text-nowrap">Total Taxable</span>
          <span class="text-nowrap ml-2"> الإجمالي للضريبة : </span>
          <span class="w-full text-right">{{
            getDecimalNumber(
              selected_order?.cartState?.totalAmount || 0.0,
              currency_decimal
            )
          }}</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-nowrap">VAT Total:</span>
          <span class="text-nowrap ml-2"> إجمالي الضريبة : </span>
          <span class="w-full text-right">{{
            getDecimalNumber(
              selected_order?.cartState?.tax || 0.0,
              currency_decimal
            )
          }}</span>
        </div>
        <div
          v-if="selected_order?.cartState?.discount"
          class="flex items-center gap-2"
        >
          <span class="text-nowrap">Total Discount:</span>
          <span class="text-nowrap ml-2"> إجمالي الخصم : </span>
          <span class="w-full">
            - SAR
            {{
              getDecimalNumber(
                selected_order?.cartState?.discount || 0.0,
                currency_decimal
              )
            }}</span
          >
        </div>
        <div class="flex justify-between">
          <span>Payment Method:</span>
          <span>{{ selected_order?.paymentMethod }}</span>
        </div>
        <div
          class="flex justify-between"
          v-if="
            selected_order?.paymentMethod &&
            selected_order?.paymentMethod.toLowerCase() == 'cash' &&
            selected_order?.cartState?.amountTendered
          "
        >
          <span>Tendered Cash:</span>
          <span
            >SAR
            {{
              getDecimalNumber(
                selected_order?.cartState?.amountTendered,
                currency_decimal
              )
            }}</span
          >
        </div>
        <div
          class="flex justify-between"
          v-if="
            selected_order?.paymentMethod &&
            selected_order?.paymentMethod.toLowerCase() == 'cash' &&
            selected_order?.cartState?.amountToBeReturned
          "
        >
          <span>Balance Cash:</span>
          <span
            >SAR
            {{
              getDecimalNumber(
                selected_order?.cartState?.amountToBeReturned,
                currency_decimal
              )
            }}</span
          >
        </div>
      </div>
      <img
        :height="`${print_settings?.qrcode_dimension || 80}px`"
        :width="`${print_settings?.qrcode_dimension || 80}px`"
        id="qr-code"
        class="my-2 mx-auto"
      />
      <div class="text-center text-xs mt-4">
        <div
          v-if="
            settings?.print_settings?.footer_message &&
            settings?.print_settings?.footer_message !== 'na'
          "
          :style="`font-size:${
            print_settings?.footer_message_font_size || 9
          }px`"
          class="text-[10px]"
        >
          {{ settings?.print_settings?.footer_message }}
        </div>
      </div>
    </div>
    <!-- Back to Orders Button -->
    <div
      class="fixed no-print bottom-14 left-0 right-0 p-2 bg-white shadow-lg flex gap-2"
    >
      <button
        @click="show_order_details = false"
        class="bg-primary text-white w-full py-2 rounded-lg font-bold flex-1"
      >
        Back To Orders
      </button>
      <button
        @click="downloadPDF"
        :disabled="is_downloading"
        class="disabled:bg-green-400 bg-green-600 text-white w-full py-2 rounded-lg font-bold flex-1"
      >
        {{ is_downloading ? "Downloading" : "Download" }}
      </button>
      <button
        @click="() => a4Print(selected_order)"
        class="bg-blue-600 text-white w-full py-2 rounded-lg font-bold flex-1"
      >
        A4 Print
      </button>
    </div>
  </div>
</template>

<script setup>
import { useMainStore } from "@/stores/main";
import { storeToRefs } from "pinia";
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
// import { generateInvoice } from "@/lib/GenerateInvoice";
import OrderItem from "@/components/OrderItem.vue";
import getDecimalNumber from "@/lib/getDecimalNumber";
import { useToast } from "vue-toast-notification";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { save } from "@tauri-apps/plugin-dialog";
import { writeFile, open, BaseDirectory } from "@tauri-apps/plugin-fs";
import QRCode from "qrcode";
import { getOrdersList } from "@/lib/db/orders";
import moment from "moment";
const store = useMainStore();
const { addOrder, setA4Order } = store;
const { settings, merchant } = storeToRefs(store);
const order_list = ref([]);
const print_settings = computed(() => settings.value.print_settings);
onMounted(() => {
  // order_list.value = store.order_list.value;
  // console.log(settings.value);
  fetchOrders();
});
const router = useRouter();

const a4Print = (order) => {
  setA4Order(order);
  router.push("/a4-print");
};

async function fetchOrders() {
  try {
    const response = await getOrdersList(
      { normalOrder: true, completed: true },
      1000
    );
    console.log("Response From SQLITE: ", response);
    if (response && response.success) {
      order_list.value = response.result;
    } else {
      const errorMsg = response?.message || "Failed to retrieve orders.";
      $toast.open({
        type: "warning",
        message: errorMsg,
        position: "top",
        duration: 800,
      });
    }
  } catch (error) {
    console.error("Error while fetching orders:", error);
    $toast.open({
      type: "warning",
      message: `Error: ${error.message || "An unexpected error occurred."}`,
      position: "top",
      duration: 800,
    });
  }
}
const selected_order = ref(order_list.value[0]);
const show_order_details = ref(false);

// Computed property for currency decimal places
const currency_decimal = computed(() => {
  return settings.value?.pos_settings?.currency_decimal || 2;
});

const openOrder = async (order) => {
  selected_order.value = order;
  show_order_details.value = true;
  generateQR(order);
};

const $toast = useToast();
const invoiceDataRef = ref(null);
function concatUint8Arrays(arrays) {
  const totalLength = arrays.reduce((sum, arr) => sum + arr.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const arr of arrays) {
    result.set(arr, offset);
    offset += arr.length;
  }
  return result;
}

// Function to convert a Uint8Array to a Base64 string
function uint8ArrayToBase64(uint8Array) {
  let binary = "";
  for (let i = 0; i < uint8Array.length; i++) {
    binary += String.fromCharCode(uint8Array[i]);
  }
  return btoa(binary);
}
function getTLVForValue(tagNum, tagValue) {
  return new Promise((resolve, reject) => {
    try {
      // Convert the tag number and value into Uint8Arrays
      let tagBuf = new Uint8Array([tagNum]);
      let tagValueLenBuf = new Uint8Array([tagValue.length]);
      let tagValueBuf = new TextEncoder().encode(tagValue);

      // Combine the buffers into a single Uint8Array
      let totalLength =
        tagBuf.length + tagValueLenBuf.length + tagValueBuf.length;
      let resultBuf = new Uint8Array(totalLength);

      resultBuf.set(tagBuf, 0);
      resultBuf.set(tagValueLenBuf, tagBuf.length);
      resultBuf.set(tagValueBuf, tagBuf.length + tagValueLenBuf.length);

      resolve(resultBuf);
    } catch (error) {
      reject(error); // Handle errors in buffer creation
    }
  });
}
const generateQR = async (data) => {
  const options = {
    qrDetails: {
      name: settings.value?.merchant?.name || null,
      vat: settings.value?.merchant?.trn
        ? settings.value?.merchant?.trn.toString()
        : "",
      date: data?.time ? new Date(data.time).toISOString() : null,
      tax:
        getDecimalNumber(
          data?.cartState?.tax,
          settings.value?.pos_settings?.currency_decimals || 2
        ) || null,
      amount:
        getDecimalNumber(
          data?.cartState?.totalPayableAmount,
          settings.value?.pos_settings?.currency_decimals || 2
        ) || null,
    },
  };
  console.log("InvoiceData: ", data);
  if (
    options?.qrDetails &&
    options.qrDetails.name &&
    options.qrDetails.date &&
    options.qrDetails.amount &&
    options.qrDetails.tax
  ) {
    if (data?.zatca_qrcode) {
      const code = data?.zatca_qrcode;
      console.log(code);
      const url = await new QRCode.toDataURL(code);
      console.log(url);
      document.getElementById("qr-code").src = url;
    } else {
      console.log("zatca_qrcode value not found");
      // Generate TLV buffers for QR code data
      const name = await getTLVForValue("1", options.qrDetails.name);
      const vatNo = await getTLVForValue(
        "2",
        options.qrDetails.vat || Math.floor(Math.random() * 9e14) + 1e14
      );
      const date = await getTLVForValue("3", options.qrDetails.date);
      const amount = await getTLVForValue("4", options.qrDetails.amount);
      const tax = await getTLVForValue("5", options.qrDetails.tax);

      // Combine TLV buffers into a single Uint8Array
      const tagsBufsArray = [name, vatNo, date, amount, tax];
      const qrCodeBuf = concatUint8Arrays(tagsBufsArray);

      // Convert the Uint8Array to a base64 string
      const qrCodeB64 = uint8ArrayToBase64(qrCodeBuf);
      const url = await new QRCode.toDataURL(qrCodeB64);
      console.log(url);
      document.getElementById("qr-code").src = url;
    }
  }
};
const is_downloading = ref(false);
const downloadPDF = async () => {
  is_downloading.value = true;
  try {
    const element = invoiceDataRef.value;
    const scale = 2; // Increase for higher quality

    // Render the invoice element to a canvas
    const canvas = await html2canvas(element, { scale, useCORS: true });
    const imgData = canvas.toDataURL("image/png");
    const imgWidth = 80; // mm
    const pageHeight = (canvas.height * imgWidth) / canvas.width;
    const pdf = new jsPDF("p", "mm", [imgWidth, pageHeight]);
    pdf.addImage(imgData, "PNG", 0, 0, imgWidth, pageHeight);

    // Get raw PDF bytes
    const pdfData = pdf.output("arraybuffer");

    // Build a filename
    const fileName = `invoice-${
      selected_order.value?.unique_id ||
      selected_order.value?.ptid ||
      selected_order.value?.id ||
      "receipt"
    }-${Date.now()}.pdf`;
    const file = await open(`Download/${fileName}`, {
      write: true,
      create: true,
      createNew: true,
      baseDir: BaseDirectory.Home,
    });
    const bytesWritten = await file.write(new Uint8Array(pdfData));
    await file.close();
  } catch (e) {
    if (e?.response || e?.message || e?.response?.message) {
      alert(e?.response || e?.message || e?.response?.message);
    } else {
      alert(JSON.stringify(e));
    }
  } finally {
    is_downloading.value = false;
  }
};
const sync = async () => {
  const data = await addOrder({ ...selected_order.value, isSync: true });
  $toast.open({
    type: data?.success ? "success" : "error",
    message: data?.message,
    position: "top",
    duration: 800,
  });
};
</script>
<style>
@font-face {
  font-family: "CalibriArabicBold";
  src: url("@/assets/Calibri/Calibri-Arabic-Bold.ttf") format("truetype");
  font-weight: bold;
  font-style: normal;
}
</style>
<style scoped>
@media print {
  @page {
    margin: 0;
    size: 80mm auto;
  }
  body {
    -webkit-print-color-adjust: exact;
  }
  .fixed {
    display: none;
  } /* Hide fixed elements during printing */
}
</style>
<style scoped>
@media print {
  @page {
    margin: 0;
    size: 80mm auto;
  }
  body {
    -webkit-print-color-adjust: exact;
    margin: 0;
  }
  #invoice-data {
    width: 80mm !important;
    min-height: 100vh;
    overflow: hidden;
    padding-bottom: 0;
    font-family: "CalibriArabicBold", sans-serif;
  }

  .fixed,
  .no-print {
    display: none !important;
  }
}
</style>
