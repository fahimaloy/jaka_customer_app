<template>
  <div class="container my-4 overflow-scroll" id="invoice" ref="a4DataRef">
    <div class="card shadow">
      <!-- Card Header -->
      <div class="card-header">
        <div class="row w-100 align-items-center">
          <div class="col-md-4 text-start">
            <img
              :src="settings.pos_settings.logo_url || '/jaka-logo.png'"
              alt="Company Logo"
              style="max-height: 60px"
            />
          </div>
          <div class="col-md-4 text-center">
            <h3 class="mb-0">Tax Invoice | فاتورة ضريبية</h3>
          </div>
          <div class="col-md-4 text-end action-buttons">
            <!-- Back & Print/Download -->
            <button
              type="button"
              class="btn btn-outline-primary me-2"
              @click="back"
            >
              Back
            </button>
            <button
              type="button"
              :disabled="is_downloading"
              class="btn btn-outline-primary disabled:bg-blue-300"
              @click="handlePrint"
            >
              {{ is_downloading ? "Initializing..." : "Print" }}
            </button>
          </div>
        </div>
      </div>

      <!-- Card Body -->
      <div class="card-body">
        <!-- QR + Invoice Details -->
        <div class="table-responsive mb-4">
          <table class="table table-sm">
            <tbody>
              <tr>
                <th class="table-light text-start" style="width: 40%">
                  Invoice Number
                </th>
                <td class="align-middle text-center" style="width: 20%">
                  {{ invoiceData?.invoice_num }}
                </td>
                <th
                  class="table-light text-end rtl align-middle"
                  style="width: 20%"
                >
                  رقم الفاتورة
                </th>
                <td
                  class="align-middle text-center qr-container"
                  :rowspan="7"
                  style="width: 20%; padding: 15px; border: none; z-index: 9999"
                >
                  <img id="qr-code" class="qr-code" style="z-index: 99999" />
                </td>
              </tr>
              <tr>
                <th class="table-light text-start">Invoice Issue Date</th>
                <td class="text-center">
                  {{ new Date().toLocaleString() }}
                </td>
                <th class="table-light text-end rtl">تاريخ إصدار الفاتورة</th>
              </tr>
              <tr>
                <th class="table-light text-start">Branch</th>
                <td class="text-center">{{ invoiceData?.order_type }}</td>
                <th class="table-light text-end rtl">الفرع</th>
              </tr>
              <tr>
                <th class="table-light text-start">Order Source</th>
                <td class="text-center">{{ invoiceData?.order_source }}</td>
                <th class="table-light text-end rtl">مصدر الطلب</th>
              </tr>
              <tr>
                <th class="table-light text-start">Payment Method</th>
                <td class="text-center">{{ invoiceData?.paymentMethod }}</td>
                <th class="table-light text-end rtl">طريقة الدفع</th>
              </tr>
              <tr>
                <th class="table-light text-start">Payment Status</th>
                <td class="text-center">{{ invoiceData?.paymentStatus }}</td>
                <th class="table-light text-end rtl">حالة الدفع</th>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Seller / Buyer -->
        <div class="table-responsive mb-4">
          <table class="table table-bordered table-sm">
            <thead>
              <tr>
                <th colSpan="2" class="text-center bg-light bold">
                  Seller / البائع
                </th>
                <th colSpan="2" class="text-center bg-light bold">
                  Buyer / المشتري
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th class="table-light text-start" style="width: 20%">Name</th>
                <td class="text-center" style="width: 30%">
                  {{ settings.merchant.name }}
                </td>
                <td class="text-center" style="width: 30%">
                  {{ invoiceData?.customer?.name }}
                </td>
                <th class="table-light text-end rtl" style="width: 20%">
                  الاسم
                </th>
              </tr>
              <tr>
                <th class="table-light text-start">Address</th>
                <td class="text-center">
                  {{
                    [
                      settings.merchant.address_building,
                      settings.merchant.address_street,
                      settings.merchant.address_city,
                      settings.merchant.address_district,
                      settings.merchant.address_postal_code,
                    ]
                      .filter(Boolean)
                      .join(" ")
                  }}
                </td>
                <td class="text-center">
                  {{ invoiceData?.customer?.address }}
                </td>
                <th class="table-light text-end rtl">العنوان</th>
              </tr>
              <tr>
                <th class="table-light text-start">VAT Number</th>
                <td class="text-center">{{ settings.merchant.trn }}</td>
                <td class="text-center">
                  {{ invoiceData?.customer?.tax_reg_num }}
                </td>
                <th class="table-light text-end rtl">رقم ضريبة</th>
              </tr>
              <tr>
                <th class="table-light text-start">Phone</th>
                <td class="text-center">{{ settings.merchant.phone }}</td>
                <td class="text-center">
                  {{ invoiceData?.customer?.phone }}
                </td>
                <th class="table-light text-end rtl">الهاتف</th>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Order Items -->
        <div class="table-responsive">
          <table class="table table-bordered table-sm">
            <thead>
              <tr>
                <th class="table-light text-center" style="width: 50%">
                  Goods and Services / السلع والخدمات
                </th>
                <th class="table-light text-center" style="width: 12.5%">
                  Unit Price / سعر الوحدة
                </th>
                <th class="table-light text-center" style="width: 12.5%">
                  Quantity / الكمية
                </th>
                <th class="table-light text-center" style="width: 12.5%">
                  Tax Amount / مبلغ الضريبة
                </th>
                <th class="table-light text-center" style="width: 12.5%">
                  Subtotal / المجموع
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="item in invoiceData?.cartState?.orderitems"
                :key="item.id"
              >
                <td>{{ item.name }}<br />{{ item.arabic_name }}</td>
                <td class="text-end">{{ item.selling_price.toFixed(2) }}</td>
                <td class="text-end">{{ item.quantity.toFixed(2) }}</td>
                <td class="text-end">{{ item.tax.toFixed(2) }}</td>
                <td class="text-end">{{ item.totalPrice.toFixed(2) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Totals -->
        <div class="table-responsive">
          <table class="table table-bordered table-sm">
            <tbody>
              <tr>
                <th class="table-light">
                  Total (Excluding VAT) / الإجمالي (بدون ضريبة)
                </th>
                <td class="text-end">
                  {{ invoiceData?.cartState.totalAmount.toFixed(2) }}
                </td>
              </tr>
              <tr>
                <th class="table-light">Total VAT / إجمالي الضريبة</th>
                <td class="text-end">
                  {{ invoiceData?.cartState.tax.toFixed(2) }}
                </td>
              </tr>
              <tr>
                <th class="table-light">
                  Total Amount Due / المبلغ الإجمالي المستحق
                </th>
                <td class="text-end bold">
                  {{ invoiceData?.cartState?.totalPayableAmount.toFixed(2) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";

import { useMainStore } from "@/stores/main";
import { invoke } from "@tauri-apps/api/core";
import QRCode from "qrcode";
import getDecimalNumber from "@/lib/getDecimalNumber";
import { useRouter } from "vue-router";
import { onBeforeUnmount } from "vue";
import { storeToRefs } from "pinia";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { writeFile, open, BaseDirectory } from "@tauri-apps/plugin-fs";
import { join, downloadDir } from "@tauri-apps/api/path";
import { shareFile } from "tauri-plugin-share";
import { openPath, revealItemInDir } from "@tauri-apps/plugin-opener";
onBeforeUnmount(() => {
  setA4Order(null);
});

// Props
const props = defineProps({
  hideBootstrap: { type: Boolean, default: false },
});

const router = useRouter();
// const orderStore = useOrderStore();
const mainStore = useMainStore();
const { settings, a4Order } = storeToRefs(mainStore);
const { setA4Order } = mainStore;
// watch(settings, () => {
//   console.log("Settings changed", settings.value);
// });
// State
const invoiceData = ref(null);
const cssContent = ref("");

// Helpers
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
      const tagBuf = new Uint8Array([parseInt(tagNum)]);
      const tagValueBuf = new TextEncoder().encode(tagValue);
      const tagValueLenBuf = new Uint8Array([tagValueBuf.length]);
      const buf = concatUint8Arrays([tagBuf, tagValueLenBuf, tagValueBuf]);
      resolve(buf);
    } catch (e) {
      reject(e);
    }
  });
}

// Generate ZATCA QR
const generateQR = async (data) => {
  const details = {
    name: settings.value.merchant.name,
    vat: settings.value.merchant.trn?.toString(),
    date: data.time ? new Date(data.time).toISOString() : null,
    amount: getDecimalNumber(
      data.cartState.totalPayableAmount,
      settings.value?.pos_settings?.currency_decimals ||2
    ),
    tax: getDecimalNumber(
      data.cartState.tax,
      settings.value?.pos_settings?.currency_decimals || dee2e6
    ),
  };

  if (data.zatca_qrcode) {
    const url = await QRCode.toDataURL(data.zatca_qrcode);
    document.getElementById("qr-code").src = url;
  } else if (details.name && details.date && details.amount && details.tax) {
    const tags = [
      await getTLVForValue("1", details.name),
      await getTLVForValue("2", details.vat),
      await getTLVForValue("3", details.date),
      await getTLVForValue("4", details.amount),
      await getTLVForValue("5", details.tax),
    ];
    const qrBuf = concatUint8Arrays(tags);
    document.getElementById("qr-code").src = uint8ArrayToBase64(qrBuf);
  }
};
const is_downloading = ref(false);
const a4DataRef = ref(null);

const handlePrint = async () => {
  is_downloading.value = true;
  const customCss = `
    body {

      margin: 0 !important;
      padding: 10mm !important;
      overflow: visible !important;
    }
    .card {
      box-shadow: none !important;
      border: 0 !important;
    }
    .action-buttons {
      display: none !important;
    }
    .shadow {
      box-shadow: none;
    }
    #invoice {
      width: 210mm !important;
    }
    @page {
      size: A4;
      padding: 0;
      margin: 0;
    }
  `;
  try {
    const element = a4DataRef.value;
    const scale = 2;

    // 1) Capture with html2canvas, injecting your CSS into the cloned document
    const canvas = await html2canvas(element, {
      scale,
      useCORS: true,
      onclone: (clonedDoc) => {
        if (customCss) {
          const styleEl = clonedDoc.createElement("style");
          styleEl.type = "text/css";
          styleEl.appendChild(clonedDoc.createTextNode(customCss));
          clonedDoc.head.appendChild(styleEl);
        }
      },
    });

    // 2) Build the PDF exactly as before
    const imgData = canvas.toDataURL("image/png");
    const imgWidth = 80; // mm
    const pageHeight = (canvas.height * imgWidth) / canvas.width;
    const pdf = new jsPDF("p", "mm", [imgWidth, pageHeight]);
    pdf.addImage(imgData, "PNG", 0, 0, imgWidth, pageHeight);
    const pdfData = pdf.output("arraybuffer");

    // 3) Write it to Downloads
    const fileName = `A4-invoice-${
      invoiceData.value?.unique_id ||
      invoiceData.value?.ptid ||
      invoiceData.value?.id ||
      "receipt"
    }-${Date.now()}.pdf`;
    const downloadsPath = await downloadDir();
    const filePath = await join(downloadsPath, fileName);

    const file = await open(filePath, {
      write: true,
      create: true,
      createNew: true,
      // baseDir: BaseDirectory.Download,
    });
    await file.write(new Uint8Array(pdfData));
    await file.close();

    // await revealItemInDir(filePath);
    await shareFile(filePath, "application/pdf");
  } catch (e) {
    alert(e?.response || e?.message || JSON.stringify(e));
  } finally {
    is_downloading.value = false;
  }
};
// try {
//   await invoke("plugin:printer|print_page");
// } catch (err) {
//   alert(`Print failed: ${err?.toString()}`);
// }
// };

// Navigate back
const back = () => {
  setTimeout(() => {
    setA4Order(null);
    router.push("/home");
  }, 500);
};

// Watch for data changes
watch(
  a4Order,
  (newA4) => {
    const data = newA4;
    if (data) {
      invoiceData.value = data;
      generateQR(data);
    }
  },
  { immediate: true }
);
</script>
<!-- <style module scoped src="@/assets/css/bootstrap.min.css"></style> -->
<style scoped>
/* Layout */
.container {
  width: 100% !important;
  padding: 0 0.75rem !important;
  margin: 0 auto !important;
}
/* add your @media breakpoints here if needed */

.row {
  display: flex !important;
  flex-wrap: wrap !important;
  margin: 0 -0.75rem !important;
}

.col-md-4 {
  flex: 0 0 33.333333% !important;
  max-width: 33.333333% !important;
}

.w-100 {
  width: 100% !important;
}
.align-items-center {
  align-items: center !important;
}

/* Spacing */
.my-4 {
  margin: 1.5rem 0 !important;
}
.mb-4 {
  margin-bottom: 1.5rem !important;
}
.me-2 {
  margin-inline-end: 0.5rem !important;
}
.p-2 {
  padding: 0.5rem !important;
}
.mb-0 {
  margin-bottom: 0 !important;
}

/* Overflow */
.overflow-scroll {
  overflow: scroll !important;
}

/* Text alignment */
.text-start {
  text-align: left !important;
}
.text-center {
  text-align: center !important;
}
.text-end {
  text-align: right !important;
}

/* Direction */
.rtl {
  direction: rtl !important;
}

/* Backgrounds */
.bg-white {
  background-color: #fff !important;
}
.bg-light {
  background-color: #f8f9fa !important;
}

/* Borders */
.border {
  border: 1px solid #dee2e6 !important;
}

/* Tables */
.table {
  width: 100% !important;
  margin-bottom: 1rem !important;
  color: #212529 !important;
  border-collapse: collapse !important;
}
.table-sm th,
.table-sm td {
  padding: 0.3rem !important;
}
.table-bordered {
  border: 1px solid #dee2e6 !important;
}
.table-bordered th,
.table-bordered td {
  border: 1px solid #dee2e6 !important;
}
.table-light {
  background-color: #f8f9fa !important;
}
.table-responsive {
  width: 100% !important;
  overflow-x: auto !important;
  -webkit-overflow-scrolling: touch !important;
}

/* Cards */
.card {
  position: relative !important;
  display: flex !important;
  flex-direction: column !important;
  background-color: #fff !important;
  border: 1px solid rgba(0, 0, 0, 0.125) !important;
  border-radius: 0.25rem !important;
}
.card-header {
  padding: 0.75rem 1.25rem !important;
  background-color: rgba(0, 0, 0, 0.03) !important;
  border-bottom: 1px solid rgba(0, 0, 0, 0.125) !important;
}
.card-body {
  flex: 1 1 auto !important;
  padding: 1.25rem !important;
}

/* Shadow */
.shadow {
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
}

/* Buttons */
.btn {
  display: inline-block !important;
  font-weight: 400 !important;
  text-align: center !important;
  vertical-align: middle !important;
  user-select: none !important;
  border: 1px solid transparent !important;
  padding: 0.375rem 0.75rem !important;
  font-size: 1rem !important;
  line-height: 1.5 !important;
  border-radius: 0.25rem !important;
  transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out,
    border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out !important;
}
.btn-outline-primary {
  color: #0d6efd !important;
  border-color: #0d6efd !important;
}
.btn-outline-primary:hover {
  color: #fff !important;
  background-color: #0d6efd !important;
  border-color: #0d6efd !important;
}
@media print {
  body {
    margin: 0 !important;
    padding: 10mm !important;
    overflow: visible !important;
  }
  .card {
    box-shadow: none !important;
    border: 0 !important;
  }
  .action-buttons {
    display: none !important;
  }
  .shadow {
    box-shadow: none;
  }
  #invoice {
    width: 210mm !important;
  }
  @page {
    size: A4;
    padding: 0;
    margin: 0;
  }
}
</style>
