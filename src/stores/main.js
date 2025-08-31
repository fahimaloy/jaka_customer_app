import { ref, computed } from "vue";
import { defineStore } from "pinia";
import axios from "axios";
import moment from "moment";
import calculatePriceAndTax, { formatDecimalToEighth } from "@/lib/calculate";
import { TABLESTATES } from "@/lib/conf";
import { ORDERSTATES, PAYMENTSTATUS } from "@/lib/constants";
import { bulkCreateCustomers, getCustomersList } from "../lib/db/customers";
import { getItemsByQuery, saveBulkItems } from "../lib/db/items";

import {
  getSingleOrder,
  addOrder as dbAddOrder,
  updateOrder,
} from "@/lib/db/orders";
import { basename } from "@tauri-apps/api/path";
export const useMainStore = defineStore(
  "main",
  () => {
    const syncStatus = ref({
      slug: null,
      total: "∞",
      synced: 0,
      completed: false,
    });
    const selectedCategoryId = ref(0);
    const all_items = ref([]);
    const shiftUser = ref(null);
    const all_categories = ref([]);
    const user_data = ref(null);
    const baseURL = ref(null);
    const locations = ref([]);
    const location = ref(null);
    const initialToken = ref(null);
    const location_users = ref([]);
    const merchant = ref(null);
    const token = ref(null);
    const authenticated = ref(false);
    const all_customer_list = ref([]);
    const filteredItems = ref([]);
    const pos_device = ref(null);
    const order_list = ref([]);
    const forceLogout = ref(false);
    const setSelectedCategoryId = (id) => {
      selectedCategoryId.value = id;
      return id;
    };
    const floorNtables = ref([]);
    const selectedTable = ref(null);
    const pos_key = ref(null);
    const tableOrderEditStatus = ref(null);
    const selectedTableOrder = ref(null);

    const getItems = async (isRecentItems = false) => {
      syncStatus.value.slug = "items";
      syncStatus.value.completed = false;
      try {
        const HEADERS = {
          headers: {
            Authorization: token.value,
          },
        };
        const URL = `${baseURL.value}/${
          isRecentItems ? "recent-items" : "aggregators-items"
        }`;
        const response = await axios.post(URL, {}, HEADERS);
        const data = response?.data;
        const items = isRecentItems
          ? data?.data?.items
          : data?.results?.data?.items;
        console.log("NEW ITEMS RESPONSE: ", response, items);
        if (!isRecentItems) {
          const categories = data?.results?.data?.categories;
          console.log("Categories: ", categories);
          all_categories.value =
            categories && categories?.length ? categories : [];
        }
        const COUNT = data?.count;
        let syncedCount = items?.length;
        syncStatus.value.total = COUNT;
        syncStatus.value.synced = items?.length;
        const allItems =
          items && items?.length
            ? items.map((el) => {
                return {
                  _id: el?.id.toString(),
                  search_name: el?.name.toLowerCase(),
                  ...el,
                };
              })
            : [];
        console.log("ALLITEMS FROM NEW API: ", allItems);
        // await saveItemsToPouchDB(allItems, !isRecentItems, isRecentItems);
        try {
          await saveBulkItems(allItems, true);
          console.log("SQL - Saved Items");
        } catch (e) {
          console.log("SQL - Error Saving Items: ", e);
          console.error(e);
        }
        // all_items.value = allItems;
        let nextRoute = data?.next;
        while (nextRoute) {
          const loopResponse = await axios.post(nextRoute, {}, HEADERS);
          console.log("RESPONSE: ", loopResponse);
          const loopAllItems =
            loopResponse?.data?.results?.data?.items &&
            loopResponse?.data?.results?.data?.items?.length
              ? loopResponse?.data?.results?.data?.items.map((el) => {
                  return {
                    _id: el?.id.toString(),
                    search_name: el?.name.toLowerCase(),
                    ...el,
                  };
                })
              : [];
          console.log(
            "ALLITEMS FROM NEW API: ",
            loopAllItems,
            "ROUTE: ",
            nextRoute
          );
          syncedCount = syncedCount + loopAllItems?.length;
          syncStatus.value.synced = syncedCount;
          nextRoute = loopResponse?.data?.next;
          try {
            await saveBulkItems(loopAllItems, false);
            console.log("SQL - Saved Items");
          } catch (e) {
            console.log("SQL - Error Saving Items: ", e);
            console.error(e);
          }
          // all_items.value = [...all_items.value, loopResponse];
        }
        syncStatus.value.completed = true;

        setTimeout(() => {
          setSyncStatus({
            slug: null,
            total: "∞",
            synced: 0,
            completed: false,
          });
        }, 500);
        // return syncedCount;
        return {
          success: true,
        };
      } catch (error) {
        setTimeout(() => {
          setSyncStatus({
            slug: null,
            total: "∞",
            synced: 0,
            completed: false,
          });
        }, 500);
        if (
          error?.response?.data?.detail ==
          "Authentication credentials were not provided."
        ) {
          forceLogout.value = true;
        }
        console.log(
          "Error Occurred During Fetching Items & Categories: \n",
          error
        );
        console.error(error);
        return {
          error: true,
          success: false,
        };
      }
    };
    const setAuthenticated = (payload) => {
      authenticated.value = payload;
    };
    const getBaseURL = async ({ email, password }) => {
      try {
        const response = await axios.post("https://app.jakac.com/api/domains", {
          email,
          password,
        });
        console.log(response?.data);
        return response?.data?.domain;
      } catch (error) {
        console.log(error);
        throw error;
      }
    };

    const storeLogin = async (
      { email, password, pos_license_key },
      URLEnd = "store-login",
      pinLogin = null
    ) => {
      forceLogout.value = false;
      try {
        console.log(baseURL.value);
        if (!baseURL.value) {
          const base = await getBaseURL({ email, password });
          const URL = `https://${base}/api`;
          baseURL.value = URL;
        }
        let payload;
        if (pinLogin) {
          payload = {
            email,
            access_pin: pinLogin,
            pos_license_key: pos_key.value,
            token: initialToken.value,
          };
        } else {
          payload = {
            email,
            password,
            pos_license_key: pos_login_type.value ? pos_license_key : undefined,
          };
          if (initialToken.value) {
            payload.token = initialToken.value;
          }
        }
        let HEADERS = {
          Authorization: initialToken.value ? initialToken.value : null,
        };
        const response = await axios.post(
          `${baseURL.value}/${
            pos_login_type.value ? URLEnd : "callcenter-login"
          }`,
          payload,
          {
            headers: HEADERS,
          }
        );
        if (response?.data?.success == true && response?.data?.data) {
          locations.value = response?.data?.data?.locations || [];
          location_users.value = response?.data?.data?.location_users || [];
          merchant.value = response?.data?.data?.merchant || null;
          token.value = response?.data?.data?.token || null;
          if (!pos_login_type.value) {
            initialToken.value = response?.data?.data?.tokens?.access;
            token.value = response?.data?.data?.tokens?.access;
          } else if (!pinLogin) {
            initialToken.value = response?.data?.data?.token;
          }
          user_data.value = response?.data?.data?.user || [];
          location.value = response?.data?.data?.location;
          pos_device.value = response?.data?.data?.pos_device || null;
          if (pos_license_key) pos_key.value = pos_license_key;
          if (pinLogin && user_data.value) {
            await axios
              .post(
                baseURL.value + "/open-shift",
                {
                  user: response?.data?.data?.user?.id,
                  location: response?.data?.data?.location.id,
                  pos_device: response?.data?.data?.pos_device?.id,
                },
                {
                  headers: {
                    Authorization: `${initialToken.value}`,
                  },
                }
              )
              .then(async (data) => {
                shiftUser.value = Object.assign(
                  {},
                  {
                    id: data.data.shift_id,
                    location_user_id: user_data.value.id,
                    shiftStart: moment().format("YYYY/MM/DD  h:mm a"),
                  },
                  {
                    pin: pinLogin,
                  }
                );
              })
              .catch((error) => {
                if (
                  error?.response?.data?.detail ==
                  "Authentication credentials were not provided."
                ) {
                  forceLogout.value = true;
                }
              });
          }
          if (token.value) {
            localStorage.setItem("token", token.value);
          } else {
          }
          return { success: true, error: false };
        }
      } catch (error) {
        authenticated.value = false;
        console.error(error);
        console.log(error);
        if (error?.response?.data?.error) {
          if (error.response.data.error == "Invalid license key") {
            localStorage.removeItem("pos_key");
          } else if (
            error.response.data.error == "Login already exists" ||
            error.response.data.error ==
              "Login security error. This pos license might be logged in somewhere else"
          ) {
            return {
              error: true,
              errorMsg: error.response.data.error,
              showLoginAlert: true,
            };
          }
          return {
            error: true,
            errorMsg: error.response.data.error,
          };
        } else if (error?.response?.data) {
          return {
            error: true,
            errorMsg: error.response.data,
          };
        } else {
          try {
            return {
              error: true,
              errorMsg: JSON.stringify(error),
            };
          } catch {
            return {
              error: true,
              errorMsg: "Error During Login",
            };
          }
        }
      }
    };
    // const getStoreSettings = async ({pos})
    const shiftLogout = async (summary) => {
      authenticated.value = true;
      try {
        await axios.post(
          `${baseURL.value}/close-shift`,
          {
            token: initialToken.value,
            shift_id: shiftUser.value?.id,
            user: user_data.value?.id,
            location: location.value?.id,
            ...summary,
            pos_device: pos_device.value.id,
          },
          {
            headers: {
              Authorization: initialToken.value,
            },
          }
        );
      } catch (e) {
        alert("Error While Shifting Out!");
        console.log(e);
      }
      shiftUser.value = null;
      return 0;
    };
    const posLogout = () => {
      all_items.value = [];
      shiftUser.value = null;
      all_categories.value = [];
      user_data.value = null;
      baseURL.value = null;
      locations.value = [];
      location_users.value = [];
      merchant.value = null;
      token.value = null;
      pos_login_type.value = true;
      defaultLocation.value = null;
      authenticated.value = false;
    };
    const filterItems = async () => {
      const criteria = {
        selectedCategory: selectedCategoryId.value,
        quantity: 50,
      };
      try {
        const response = await getItemsByQuery(criteria);
        console.log("FilterItems SQL Fetched Item Response: ", response);
        if (response?.success && response?.result) {
          filteredItems.value = response.result;
        }
      } catch (e) {
        console.log(e);
      }
      // const existingItems = all_items.value;
      // if (selectedCategoryId.value && selectedCategoryId.value != 0) {
      //   filteredItems.value = existingItems.filter(
      //     (item) => item?.category == selectedCategoryId.value
      //   );
      // } else if (!selectedCategoryId || selectedCategoryId.value == 0)
      //   filteredItems.value = existingItems;
    };
    const searchItems = async (value) => {
      if (value) {
        const existingItems = all_items.value;
        console.log(existingItems);
        try {
          const criteria = {
            text: value,
            selectedCategory: selectedCategoryId.value,
            quantity: 50,
          };
          const response = await getItemsByQuery(criteria);
          console.log("SearchItems SQL Fetched Item Response: ", response);
          if (response?.success && response?.result) {
            filteredItems.value = response.result;
          }
        } catch (e) {
          console.log(e);
        }
      } else {
        filterItems();
      }
    };
    const cartItems = ref([]);
    const cartState = ref({
      totalAmount: 0,
      totalPayableAmount: 0,
      amountTendered: 0,
      amountToBeReturned: 0,
      tax: 0,
      discount: 0,
      discount_note: null,
      charges: 0,
    });
    const resetCart = () => {
      selected_customer.value = null;
      selectedTable.value = null;
      cartState.value = {
        totalAmount: 0,
        totalPayableAmount: 0,
        amountTendered: 0,
        amountToBeReturned: 0,
        tax: 0,
        discount: 0,
        discount_note: null,
        charges: 0,
      };
      cartItems.value = [];
    };
    const calculateCartState = (remove = false) => {
      if (cartItems.value && cartItems.value?.length) {
        const totalWithoutTax = cartItems.value.reduce(
          (total, item) =>
            total + parseFloat(item.price) * parseFloat(item.quantity),
          0
        );

        // Calculate the total tax amount for the cart.
        const totalTax = cartItems.value.reduce(
          (total, item) => total + parseFloat(item.tax),
          0
        );
        // Calculate the total payable amount for the cart.
        const totalWithTax = parseFloat(totalWithoutTax) + parseFloat(totalTax);
        if (remove) {
          cartState.value.discount = 0;
        }
        const DISCOUNT = remove
          ? 0
          : cartState.value.discount
          ? parseFloat(cartState.value.discount)
          : 0;
        cartState.value.totalAmount = formatDecimalToEighth(totalWithoutTax);
        cartState.value.tax = formatDecimalToEighth(totalTax);
        cartState.value.totalPayableAmount = formatDecimalToEighth(
          totalWithTax - DISCOUNT
        );
      } else {
        cartState.value.totalAmount = 0;
        cartState.value.totalPayableAmount = 0;
        cartState.value.amountTendered = 0;
        cartState.value.amountToBeReturned = 0;
        cartState.value.tax = 0;
      }
    };
    const addCashAmount = (payload) => {
      cartState.value = {
        ...cartState.value,
        amountTendered: payload,
        amountToBeReturned: payload - cartState.value.totalPayableAmount,
      };
    };
    const addToCart = (item) => {
      const index = cartItems.value.findIndex(
        (existingItems) => existingItems?.id == item?.id
      );
      if (index == -1) {
        const newItem = Object.assign({}, item);
        console.log(item);
        const { basePrice, taxAmount } = calculatePriceAndTax(
          newItem.selling_price,
          newItem.tax_percent,
          newItem?.is_tax_inclusive
        );
        const quantity = item?.quantity ? parseFloat(item?.quantity) : 1;
        newItem.quantity = quantity;
        newItem.tax = formatDecimalToEighth(taxAmount * newItem.quantity);

        newItem.totalPrice = formatDecimalToEighth(
          newItem?.is_tax_inclusive
            ? basePrice * newItem.quantity + newItem.tax
            : basePrice * newItem.quantity
        );
        console.log(newItem, basePrice);
        newItem.charge = 0;
        newItem.price = basePrice;
        cartItems.value.push(newItem);
      } else {
        cartItems.value = cartItems.value.map((ei) => {
          if (ei.id == item.id) {
            const existingItem = Object.assign({}, ei);
            if (item?.selling_price) {
              existingItem.selling_price = item.selling_price;
            }
            if (item?.notes != undefined) {
              existingItem.notes = item.notes;
            }
            if (item?.selected_unit) {
              existingItem.selected_unit = item.selected_unit;
            }
            const { basePrice, taxAmount } = calculatePriceAndTax(
              existingItem.selling_price,
              existingItem.tax_percent,
              existingItem.is_tax_inclusive
            );
            existingItem.modifiers = item?.modifiers || [];
            if (item?.add_quantity) {
              existingItem.quantity = item.add_quantity;
            } else {
              existingItem.quantity = existingItem.quantity + 1;
            }
            existingItem.tax = formatDecimalToEighth(
              taxAmount * existingItem.quantity
            );
            existingItem.charge = 0;
            existingItem.totalPrice = formatDecimalToEighth(
              existingItem?.is_tax_inclusive
                ? basePrice * existingItem.quantity + existingItem.tax
                : basePrice * existingItem.quantity
            );
            existingItem.price = basePrice;
            if (existingItem?.add_quantity) {
              delete existingItem.add_quantity;
            }
            return existingItem;
          }
          return ei;
        });
        console.log(cartItems.value);
      }
      calculateCartState(true);
    };
    const removeFromCart = (item, removeAll = false) => {
      if (removeAll) {
        cartItems.value = cartItems.value.filter((ei) => ei.id !== item.id);
        return;
      }
      if (item?.quantity > 1) {
        cartItems.value = cartItems.value.map((ei) => {
          if (ei.id == item.id) {
            const existingItem = Object.assign({}, ei);
            const { basePrice, taxAmount } = calculatePriceAndTax(
              ei.selling_price,
              ei.tax_percent,
              ei.is_tax_inclusive
            );

            if (item?.remove_quantity) {
              existingItem.quantity = item.remove_quantity;
            } else {
              existingItem.quantity -= 1;
            }
            existingItem.tax = formatDecimalToEighth(
              parseFloat(existingItem.tax) - taxAmount
            );

            existingItem.totalPrice = formatDecimalToEighth(
              existingItem?.is_tax_inclusive
                ? basePrice * existingItem.quantity + existingItem.tax
                : basePrice * existingItem.quantity
            );
            existingItem.price = basePrice;
            if (existingItem?.remove_quantity) {
              delete existingItem.remove_quantity;
            }
            return existingItem;
          }
          return ei;
        });
      } else if (item?.quantity <= 1) {
        cartItems.value = cartItems.value.filter((ei) => ei.id != item.id);
      }

      calculateCartState(true);
    };
    const clearCart = () => {
      cartItems.value = [];
      cartState.value = {
        totalAmount: 0,
        totalPayableAmount: 0,
        amountTendered: 0,
        amountToBeReturned: 0,
        tax: 0,
        discount: 0,
        discount_note: null,
        charges: 0,
      };
    };

    const settings = ref(null);
    const fetchStoreSettings = async () => {
      syncStatus.value.slug = "settings";
      syncStatus.value.completed = false;
      syncStatus.value.synced = 1;
      syncStatus.value.total = 2;
      try {
        const response = await axios.post(
          `${baseURL.value}/store-settings`,
          { pos_device: "callcenter" },
          {
            headers: {
              Authorization: `${token.value}`,
            },
          }
        );
        // if(response.d)
        settings.value = response.data?.data;
        console.log(response);
      } catch (error) {
        if (
          error?.response?.data?.detail ==
          "Authentication credentials were not provided."
        ) {
          forceLogout.value = true;
        }
        if (error?.response?.data?.message) {
          return {
            error: true,
            success: false,
            message: error?.response?.data?.message,
          };
        } else if (error?.resposne?.data) {
          return {
            error: true,
            success: false,
            message: error?.resposne?.data,
          };
        } else if (error?.response?.data?.error) {
          return {
            success: false,
            error: true,
            errorMsg: error.response.data.error,
          };
        } else {
          return {
            success: false,
            error: true,
            errorMsg: "Error During Login",
          };
        }
      }
      syncStatus.value.completed = true;
      setTimeout(() => {
        setSyncStatus({
          slug: null,
          total: "∞",
          synced: 0,
          completed: false,
        });
      }, 500);
    };

    const selected_order_type = ref(null);
    const selectOrderType = (payload) => {
      selected_order_type.value = payload;
    };
    // const addOrder = async (payload) => {
    //   const isSync = payload?.isSync;
    //   if (!isSync) {
    //     const orderIndex = order_list.value.findIndex(
    //       (item) => item.ptid == payload.ptid
    //     );
    //     if (orderIndex == -1) {
    //       order_list.value.unshift(payload);
    //     }
    //   }
    //   if (payload?.table && payload?.table?.id && floorNtables.value.length) {
    //     floorNtables.value = floorNtables.value.map((floor) => {
    //       if (floor?.tables?.length) {
    //         floor.tables = floor.tables.map((table) => {
    //           if (table?.id == payload.table?.id) {
    //             table.status = TABLESTATES.FREE;
    //             table.order_id = undefined;
    //             table.ptid = undefined;
    //             table.time = undefined;
    //             table.tableOrder = [];
    //           }
    //           return table;
    //         });
    //       }
    //       return floor;
    //     });
    //   }
    //   if (payload?.isSync) {
    //     delete payload.isSync;
    //   }
    //   if (navigator.onLine) {
    //     try {
    // const response = await axios.post(
    //   `${baseURL.value}/place-order`,
    //   { data: payload },
    //   {
    //     headers: {
    //       Authorization: token.value || localStorage.getItem("token"),
    //     },
    //   }
    // );

    // console.log(response?.data);
    // if (
    //   response?.data?.success == true &&
    //   response?.data?.reason != "duplicate"
    // ) {
    //   order_list.value = order_list.value.map((order) => {
    //     if (order?.ptid == response?.data?.ptid) {
    //       return {
    //         ...order,
    //         ...response?.data,
    //         is_synced: 1,
    //       };
    //     }
    //     return order;
    //   });
    //   return {
    //     error: false,
    //     success: true,
    //     message: "Successfully Placed Order",
    //   };
    // } else if (response?.data?.reason == "duplicate") {
    //   order_list.value = order_list.value.map((order) => {
    //     if (response?.data?.ptid && order?.ptid == response?.data?.ptid) {
    //       return {
    //         ...order,
    //         is_synced: 1,
    //       };
    //     } else if (order?.ptid == payload?.ptid) {
    //       return {
    //         ...order,
    //         is_synced: 1,
    //       };
    //     }
    //     return order;
    //   });
    //   return {
    //     error: false,
    //     success: true,
    //     message: "Successfully Updated Order",
    //   };
    // } else {
    //   return {
    //     error: true,
    //     success: false,
    //     message: response?.data?.message || "Error Placing Order",
    //   };
    // }
    //     } catch (error) {
    //       if (
    //         error?.response?.data?.detail ==
    //         "Authentication credentials were not provided."
    //       ) {
    //         forceLogout.value = true;
    //       }
    //       if (error?.response?.data?.message) {
    //         return {
    //           error: true,
    //           success: false,
    //           message: error?.response?.data?.message,
    //         };
    //       } else if (error?.resposne?.data) {
    //         return {
    //           error: true,
    //           success: false,
    //           message: error?.resposne?.data,
    //         };
    //       } else if (error?.response?.data?.error) {
    //         return {
    //           success: false,
    //           error: true,
    //           errorMsg: error.response.data.error,
    //         };
    //       } else {
    //         return {
    //           success: false,
    //           error: true,
    //           errorMsg: "Error During Login",
    //         };
    //       }
    //     }
    //   } else {
    //     return {
    //       error: false,
    //       success: true,
    //       message: "Internet Not Available, Order Placed Locally",
    //     };
    //   }
    //   selected_customer.value = null;
    // };
    const addOrder = async (payload) => {
      // Update floor table statuses if payload contains table info.

      // Remove temporary sync flag before saving.
      if (payload?.isSync) {
        delete payload.isSync;
      }
      if (!pos_login_type.value) {
        payload.location = defaultLocation.value ? defaultLocation.value.name : "callcenter";
        payload.paymentMethod = "Credit";
        payload.order_source = "carhop";
        payload.paymentStatus = "pending";
      } else {
        // For kiosk mode, always include selected location if available
        if (defaultLocation.value) {
          payload.location = defaultLocation.value.name;
          payload.location_id = defaultLocation.value.id;
        }
      }

      if (navigator.onLine) {
        try {
          const OrderURL = `${baseURL.value}/kiosk-order`;
          const response = await axios.post(
            OrderURL,
            { data: payload },
            {
              headers: {
                Authorization: token.value || localStorage.getItem("token"),
              },
            }
          );
          const existingOrder = await getSingleOrder(payload.ptid, false).catch(
            () => ({
              success: false,
            })
          );
          if (response?.data?.success == true) {
            if (existingOrder.success) {
              // If an order with the provided ptid exists, merge the payload and update the order.
              const updatedOrder = {
                ...existingOrder.result,
                ...response?.data,
                is_synced: 1,
              };

              await updateOrder(updatedOrder);
              return {
                error: false,
                success: true,
                message: "Successfully Updated Order",
              };
            } else {
              // Otherwise, add the new order using the provided addOrder function.
              await dbAddOrder({ ...payload, ...response?.data, is_synced: 1 });
              return {
                error: false,
                success: true,
                message: "Successfully Placed Order",
              };
            }
          } else {
            return {
              error: true,
              success: false,
              message: response?.data?.message || "Error Placing Order",
            };
          }
        } catch (error) {
          // Handle errors and trigger potential logout if authentication fails.
          if (
            error?.response?.data?.detail ===
            "Authentication credentials were not provided."
          ) {
            forceLogout.value = true;
          }
          if (error?.response?.data?.message) {
            return {
              error: true,
              success: false,
              message: error.response.data.message,
            };
          } else if (error?.response?.data?.error) {
            return {
              success: false,
              error: true,
              errorMsg: error.response.data.error,
            };
          } else if (error?.resposne?.data) {
            return {
              error: true,
              success: false,
              message: error.resposne.data,
            };
          } else {
            return {
              success: false,
              error: true,
              errorMsg: "Error processing order",
            };
          }
        }
      } else {
        await dbAddOrder({ ...payload, is_synced: 0 });
        return {
          error: false,
          success: true,
          message: "Internet Not Available, Order Placed Locally",
        };
      }
      selected_customer.value = null;
    };

    // Create customer function
    const createCustomer = async (phone) => {
      try {
        const payload = {
          data: {
            name: phone,
            phone: phone.replace(/\D/g, ''), // Store digits only
            language: "English"
          }
        };
        
        const response = await axios.post(
          `${baseURL.value}/create-customer`,
          payload,
          {
            headers: {
              Authorization: token.value || localStorage.getItem("token"),
              'Content-Type': 'application/json'
            },
          }
        );
        
        console.log('Customer creation response:', response.data);
        return {
          success: true,
          customer: response.data
        };
      } catch (error) {
        console.log('Customer creation failed (continuing with flow):', error);
        return {
          success: false,
          error: error
        };
      }
    };

    // Simple kiosk order without SQL saving
    const placeKioskOrder = async (customerPhone, paymentInfo = null) => {
      // Determine payment method and status
      const paymentMethod = paymentInfo?.method === 'CASH' ? 'Cash' : 'Card';
      const paymentBrand = paymentInfo?.brand || null;
      const isCOD = paymentInfo?.method === 'CASH';
      
      // Generate unique identifiers
      const currentTime = Date.now();
      const ptid = `${user_data.value?.id || 'kiosk'}-${currentTime}`;
      const invoiceId = `CC_${user_data.value?.id || 'K'}-${new Date().toLocaleDateString('en-GB').replace(/\//g, '')}-${Math.floor(currentTime / 1000)}`;
      
      const payload = {
        cartState: {
          orderitems: cartItems.value.map(item => ({
            id: item.id,
            item_code: item.item_code || item.id?.toString(),
            name: item.name,
            selling_price: item.selling_price || item.price,
            totalPrice: item.totalPrice,
            quantity: item.quantity,
            tax_percent: item.tax_percent || 0,
            discount_amount: item.discount_amount || null,
            discount_percentage: item.discount_percentage || null,
            modifiers: item.modifiers || [],
            note: item.note || null
          })),
          totalAmount: cartState.value.totalAmount,
          tax: cartState.value.tax,
          discount: cartState.value.discount || 0,
          totalPayableAmount: cartState.value.totalPayableAmount,
          paymentMethod: paymentMethod,
          discount_note: null
        },
        notes: null,
        order_type: "TAKE AWAY",
        order_source: "kiosk",
        orderStatus: "pending",
        id: invoiceId,
        ptid: ptid,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "+0300",
        time: currentTime,
        location: {
          id: defaultLocation.value?.id || 1,
          name: defaultLocation.value?.name || "kiosk",
          arabic_name: defaultLocation.value?.arabic_name || null
        },
        paymentMethod: paymentMethod,
        paymentStatus: isCOD ? PAYMENTSTATUS.PENDING : PAYMENTSTATUS.PAID,
        customer: {
          phone: customerPhone.replace(/\D/g, ''),
          name: customerPhone
        },
        store_id: settings.value?.store?.id || 1,
        user: {
          id: user_data.value?.id || 1,
          username: user_data.value?.username || "kiosk@jaka.live",
          name: user_data.value?.name || "Kiosk User"
        },
        total: cartState.value.totalPayableAmount?.toFixed(2) || "0.00"
      };

      try {
        console.log('Kiosk Order Payload:', payload);
        console.log('Order Status:', payload.orderStatus);
        console.log('Payment Status:', payload.paymentStatus);
        
        const OrderURL = `${baseURL.value}/kiosk-order`;
        const response = await axios.post(
          OrderURL,
          { data: payload },
          {
            headers: {
              Authorization: token.value || localStorage.getItem("token"),
            },
          }
        );

        if (response?.data?.success) {
          return {
            success: true,
            orderNumber: response?.data?.unique_id || response?.data?.order_id || payload.ptid,
            ptid: response?.data?.ptid || payload.ptid,
            invoice_num: response?.data?.invoice_num || payload.id,
            total_payable_amount: response?.data?.total_payable_amount || payload.total,
            business_date: response?.data?.business_date,
            message: response?.data?.message || "Order placed successfully"
          };
        } else {
          return {
            success: false,
            message: response?.data?.message || "Failed to place order"
          };
        }
      } catch (error) {
        console.error("Kiosk order error:", error);
        return {
          success: false,
          message: error?.response?.data?.message || "Network error"
        };
      }
    };

    // Reset all kiosk state
    const resetKioskState = () => {
      selected_customer.value = null;
      cartItems.value = [];
      cartState.value = {
        totalAmount: 0,
        totalPayableAmount: 0,
        amountTendered: 0,
        amountToBeReturned: 0,
        tax: 0,
        discount: 0,
        discount_note: null,
        charges: 0,
      };
    };

    // Clear cart but preserve customer for navigation
    const clearCartOnly = () => {
      cartItems.value = [];
      cartState.value = {
        totalAmount: 0,
        totalPayableAmount: 0,
        amountTendered: 0,
        amountToBeReturned: 0,
        tax: 0,
        discount: 0,
        discount_note: null,
        charges: 0,
      };
    };
    const customerSync = ref({
      status: false,
      total: 0,
      completed: false,
      synced: 0,
    });
    const syncCustomer = ref(false);
    const setSyncCustomer = (payload) => {
      syncCustomer.value = payload;
    };
    const acknowledged = ref(0);
    const resetCustomerSync = (payload) => {
      const obj = {
        status: false,
        total: 0,
        synced: 0,
      };
      if (payload?.completed) {
        obj.completed = payload?.completed;
        syncCustomer.value = false;
      } else obj.completed = false;
      customerSync.value = obj;
      acknowledged.value = 0;
    };
    const updateCustomerSync = (payload) => {
      if (payload?.data)
        customerSync.value = Object.assign(
          {},
          customerSync.value,
          payload.data,
          payload
        );
      if (payload?.acknowledged) acknowledged.value = payload.acknowledged;
    };
    const customer_list = ref([]);
    const addCustomers = (list, deleteAll) => {
      if (deleteAll) customer_list.value = [];
      all_customer_list.value = [...customer_list.value, ...list];
    };
    const selected_customer = ref(null);
    const set_selected_customer = (cust) => {
      selected_customer.value = cust;
    };

    // Customer syncing removed for kiosk mode
    const logoutForcefully = () => {
      // initialToken.value = null;
      shiftUser.value = null;
      user_data.value = null;
      localStorage.setItem("token", token.value);
      authenticated.value = false;
      forceLogout.value = false;
    };
    const applyDiscount = (payload) => {
      // const { orderitems } = state;
      const { discountType, discountAmount, discountNote } = payload;

      if (cartState.value.discount > 0) {
        cartState.value.discount = 0;
        cartState.value.discount_note = null;
        calculateCartState(true);
      } else {
        calculateCartState();
      }

      if (
        discountType == "fixed" ||
        discountType == "percentage" ||
        discountType == "final"
      ) {
        let Discount;
        cartState.value.discount_note = discountNote;
        if (discountType == "fixed") {
          Discount = parseFloat(discountAmount);
        } else if (discountType == "percentage") {
          Discount =
            (parseFloat(cartState.value.totalPayableAmount) *
              parseFloat(discountAmount)) /
            100;
        } else if (discountType == "final") {
          Discount =
            parseFloat(cartState.value.totalPayableAmount) -
            parseFloat(discountAmount);
        }
        if (Discount) {
          cartState.value.discount = Discount;
        }
      } else if (discountType == "remove") {
        if (cartState.value.discount) {
          cartState.value.discount = 0;
        }
      }
      calculateCartState();
    };
    const setSyncStatus = (payload) => {
      syncStatus.value = payload;
    };
    const addCustomer = async (payload) => {
      try {
        const newCustomer = {
          language: payload?.language,
          name: payload?.name,
          email: payload?.email || "",
          phone: payload?.phone,
          address: payload?.address || "",
          tax_reg_num: payload?.tax_reg_num || "",
          pos_id: settings.value?.pos_device?.id,
          user_id: shiftUser.value?.location_user_id,
          location_id: defaultLocation.value
            ? locations.value.find((el) => el.id == defaultLocation.value)
            : settings.value?.location?.id,
        };
        if (payload?.type == "update") {
          newCustomer.type = "update";
          newCustomer.id = payload?.id;
        }
        const response = await axios.post(
          `${baseURL.value}/create-store-customer`,
          {
            data: newCustomer,
          },
          {
            headers: {
              Authorization: token.value,
            },
          }
        );

        const res = response.data;
        if (res?.id) {
          if (payload?.type == "update") {
            const index = customer_list.value.findIndex(
              (el) => el.id == res.id
            );
            if (index !== -1) {
              customer_list.value[index] = res;
            } else {
              customer_list.value.push(res);
            }
          } else {
            customer_list.value.push(res);
          }
          all_customer_list.value = customer_list.value;
          selected_customer.value = res;
          return {
            success: true,
            error: false,
            message: "Successfully Added Customer!",
          };
        }
        if (res?.error && res?.payload?.data?.error) {
          return {
            error: true,
            success: false,
            message: res.payload.data.error,
          };
        }
      } catch (error) {
        console.log(error.response);
        if (
          error?.response?.data?.detail ==
          "Authentication credentials were not provided."
        ) {
          forceLogout.value = true;
        }
        if (error?.response?.data?.error) {
          // console.log(error.response);
          return {
            success: false,
            error: true,
            message: error.response.data.error,
          };
        } else {
          console.log(error);
          return {
            success: false,
            error: true,
            message: "Error Occurred",
          };
        }
      }
    };
    const setForceLogout = (payload) => {
      forceLogout.value = payload;
    };
    const searchCustomers = async (payload) => {
      // const response =
      //   !payload || payload == ""
      //     ? all_customer_list.value.slice(0, 50)
      //     : all_customer_list.value.filter((el) => {
      //         if (
      //           el?.name.startsWith(payload) ||
      //           el?.phone.startsWith(payload)
      //         ) {
      //           return el;
      //         }
      //       });
      try {
        console.log("Fetching customers...");
        const response = await getCustomersList(payload);
        console.log("Customers Response:", response);
        if (response?.success) {
          console.log("Customers fetched successfully: ", response.result);
          customer_list.value = response.result;
        }
      } catch (e) {
        console.log("Error fetching customers:", e);
        console.log(e);
      }
      // return response;
    };

    const fetchCustomers = async () => {
      try {
        console.log("Fetching customers...");
        const response = await getCustomersList();
        console.log("Customers Response:", response);
        if (response?.success) {
          console.log("Customers fetched successfully: ", response.result);
          customer_list.value = response.result;
        }
      } catch (e) {
        console.log("Error fetching customers:", e);
        console.log(e);
      }
    };

    const fetchFloorNTables = async () => {
      try {
        const HEADERS = {
          headers: {
            Authorization: token.value || localStorage.getItem("token"),
          },
        };
        const URL = `${baseURL.value}/get-floors`;
        const response = await axios.post(
          URL,
          {
            pos_device: pos_device.value,
          },
          HEADERS
        );
        const data = response?.data;
        console.log("NEW CUSTOMER RESPONSE: ", response);

        if (data?.success && data?.data?.floors?.length) {
          const previousFloors = Array.isArray(floorNtables.value)
            ? floorNtables.value.map((floor) =>
                Array.isArray(floor)
                  ? floor.map((table) => ({ ...table }))
                  : floor && Array.isArray(floor.tables)
                  ? {
                      ...floor,
                      tables: floor.tables.map((table) => ({ ...table })),
                    }
                  : floor
              )
            : [];

          const existingTableLookup = {};
          previousFloors.forEach((floor) => {
            if (Array.isArray(floor)) {
              floor.forEach((table) => {
                if (table && table.id != null) {
                  existingTableLookup[table.id] = table;
                }
              });
            } else if (floor && Array.isArray(floor.tables)) {
              floor.tables.forEach((table) => {
                if (table && table.id != null) {
                  existingTableLookup[table.id] = table;
                }
              });
            }
          });

          floorNtables.value = data.data.floors.map((floor) => {
            if (Array.isArray(floor)) {
              return floor.map((newTable) => {
                const existingTable = existingTableLookup[newTable.id];
                if (
                  existingTable &&
                  (existingTable.status === TABLESTATES.BUSY ||
                    existingTable.status === TABLESTATES.READYTOBILL)
                ) {
                  return {
                    ...existingTable,
                    name: newTable.name,
                  };
                }
                newTable.backend_status = newTable?.status;
                newTable.status = newTable?.status || "active";
                newTable.name = newTable.name.replaceAll(" ", "");
                return newTable;
              });
            } else if (floor && Array.isArray(floor.tables)) {
              const updatedTables = floor.tables.map((newTable) => {
                const existingTable = existingTableLookup[newTable.id];
                if (
                  existingTable &&
                  (existingTable.status === TABLESTATES.BUSY ||
                    existingTable.status === TABLESTATES.READYTOBILL)
                ) {
                  return {
                    ...existingTable,
                    name: newTable.name,
                  };
                }
                newTable.backend_status = newTable?.status;
                newTable.status = "active";
                return newTable;
              });
              return { ...floor, tables: updatedTables };
            }
            return floor;
          });
        }

        return {
          success: true,
          error: false,
          message: "Successfully Synced Floors & Tables",
        };
      } catch (error) {
        if (
          error?.response?.data?.detail ===
          "Authentication credentials were not provided."
        ) {
          forceLogout.value = true;
        }
        if (error?.response?.data?.message) {
          return {
            error: true,
            success: false,
            message: error?.response?.data?.message,
          };
        } else if (error?.resposne?.data) {
          return {
            error: true,
            success: false,
            message: error?.resposne?.data,
          };
        } else if (error?.response?.data?.error) {
          return {
            success: false,
            error: true,
            errorMsg: error.response.data.error,
          };
        } else {
          return {
            success: false,
            error: true,
            errorMsg: "Error While Syncing Floors & Tables",
          };
        }
      }
    };
    const setSelectedTable = (table) => {
      selectedTable.value = table;
    };
    function generateTokenCounter(
      lastResetDateTime,
      currentDateTime,
      cardIntegration = false
    ) {
      // console.clear();
      const print_settings = settings.value?.print_settings;
      let count = localStorage.getItem("LTNC") || 0;

      count = typeof count == "string" ? parseInt(count) : count;
      if (count == 0) {
        count = print_settings?.order_starting_number
          ? parseInt(print_settings.order_starting_number) - 1
          : 0;
      }
      console.log(lastResetDateTime, currentDateTime);
      if (!lastResetDateTime) {
        const time = currentDateTime.getTime();
        if (!cardIntegration) {
          localStorage.setItem("LTNRT", time);
        }
        count++;
        if (!cardIntegration) {
          localStorage.setItem("LTNC", count);
        }
        return count;
      }
      // `2000-01-01T${print_settings.order_number_reset_time}.00Z`,
      const resetTime = new Date(
        `2000-01-01T${
          settings.value?.pos_settings?.late_night_business_end_time ||
          "00:00:00"
        }.00Z`
      );
      const timeString =
        settings.value?.pos_settings?.late_night_business_end_time ||
        "00:00:00";

      // const reset = new Date(resetTime);
      const current = new Date();

      const currentHour = current.getHours();
      const currentMinutes = current.getMinutes();
      const [resetHour, resetMinutes] = timeString.split(":").map(Number);

      if (print_settings?.reset_order_number_daily) {
        // if (resetTime < currentDateTime) {
        if (
          new Date(lastResetDateTime).getDate() !==
          new Date(currentDateTime).getDate()
        ) {
          console.log("Inside Date Condition: ", resetHour);
          if (currentHour < resetHour) {
            console.log("BEFORE TIME");
            // setPrevDay(true);
            count++;
            if (!cardIntegration) {
              localStorage.setItem("LTNC", count);
            }
            return count;
          } else {
            const time = currentDateTime.getTime();
            if (!cardIntegration) {
              localStorage.setItem("LTNRT", time);
              localStorage.setItem(
                "LTNC",
                print_settings?.order_starting_number
                  ? print_settings.order_starting_number
                  : 1
              );
            }
            return print_settings?.order_starting_number
              ? print_settings.order_starting_number
              : 1;
          }
        }
        // }
      }
      count++;
      console.log("REACHED BOTTOM: ", count);
      if (!cardIntegration) {
        localStorage.setItem("LTNC", count);
      }
      return count;
    }

    function addOrderToTable() {
      // Generate the current time, ptid, and order id.
      const time = new Date().getTime();
      const ptid = `${settings.value?.pos_device?.id || ""}-${time}`;
      const LTNRT = localStorage.getItem("LTNRT") || null;
      const id = generateTokenCounter(
        LTNRT ? new Date(parseInt(LTNRT)) : null,
        new Date(time)
      );

      // Get values from your reactive references.
      const waiter = user_data.value;
      const cart = cartState.value;
      const table = selectedTable.value; // The currently selected table.
      const customer = selected_customer.value;

      console.log(cart);

      let currentTable = null;

      // Iterate over floorsNTables to locate and update the matching table.
      floorNtables.value = floorNtables.value.map((floor) => {
        floor.tables = floor.tables.map((tableItem) => {
          if (tableItem.id === table.id) {
            // // If no order exists, initialize with the current order data.
            if (!tableItem.tableOrder || !tableItem.tableOrder.length) {
              tableItem.tableOrder = [
                {
                  ...cart,
                  time,
                  waiter,
                  customer,
                  orderitems: cartItems.value,
                },
              ];
              tableItem.status = TABLESTATES.BUSY;
              tableItem.order_id = id;
              tableItem.ptid = ptid;
              tableItem.time = time;
            } else {
              // Append to the existing order.
              tableItem.tableOrder.push({
                ...cart,
                time,
                waiter,
                customer,
                orderitems: cartItems.value,
              });
            }
            currentTable = tableItem;
          }
          return tableItem;
        });
        return floor;
      });

      // Update the selected table reference.
      selectedTable.value = null;
      resetCart();
    }

    function clearSelectedTable() {
      selectedTable.value = null;
    }

    function setTableOrderEditStatus(payload) {
      tableOrderEditStatus.value = payload;
    }

    function setSelectedTableOrder(payload) {
      selectedTableOrder.value = payload;
    }

    function resetTableState({ id }) {
      for (let i = 0; i < floorNtables.value.length; i++) {
        const table = floorNtables.value[i].tables.find(
          (item) => item.id === id
        );
        if (table) {
          delete table.tableOrder;
          delete table.status;
          delete table.order_id;
          delete table.ptid;
          delete table.time;
          table.status = TABLESTATES.FREE;
          break;
        }
      }
    }

    function updateTableStateStatus({ id, status, waiters }) {
      let updated = false;
      for (let i = 0; i < floorNtables.value.length && !updated; i++) {
        for (let j = 0; j < floorNtables.value[i].tables.length; j++) {
          if (floorNtables.value[i].tables[j].id === id) {
            floorNtables.value[i].tables[j].status = status;
            floorNtables.value[i].tables[j].waiters = waiters;
            if (selectedTable.value && selectedTable.value.id === id) {
              selectedTable.value.status = status;
            }
            updated = true;
            break;
          }
        }
      }
    }
    // function updateTableOrderHistory(index, payloadItems) {
    //   if (!selectedTable.value || !selectedTable.value.tableOrder) return;
    //   const tableOrders = selectedTable.value.tableOrder;
    //   if (index < 0 || index >= tableOrders.length) return;
    //   tableOrders[index].history = payloadItems;
    //   if (!tableOrders[index].orderitems) return;
    //   payloadItems.forEach((payloadItem) => {
    //     const orderItem = tableOrders[index].orderitems.find(
    //       (item) => item.id === payloadItem.id
    //     );
    //     if (orderItem) {
    //       orderItem.quantity =
    //         (orderItem.quantity || 0) - (payloadItem.quantity || 0);
    //     }
    //   });
    // }
    function updateTableOrderHistory(index, payloadItems) {
      if (!selectedTable.value || !selectedTable.value.tableOrder) return;
      const tableOrders = selectedTable.value.tableOrder;

      if (index < 0 || index >= tableOrders.length) return;

      tableOrders[index].orderitems = tableOrders[index].orderitems.filter(
        (item) =>
          !payloadItems.some((deletedItem) => deletedItem.id === item.id)
      );

      tableOrders[index].history = [
        ...(tableOrders[index].history || []),
        ...payloadItems.map((item) => ({
          ...item,
          action: "deleted",
          timestamp: new Date().toISOString(),
        })),
      ];

      tableOrders[index].totalPayableAmount = tableOrders[
        index
      ].orderitems.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
    }
    function tableReadyToBill() {
      cartItems.value = [];
      if (!selectedTable.value || !selectedTable.value.tableOrder) return;
      const combined = {};
      selectedTable.value.tableOrder.forEach((order) => {
        if (order.orderitems && Array.isArray(order.orderitems)) {
          order.orderitems.forEach((item) => {
            if (combined[item.id]) {
              const newQty = combined[item.id].quantity + item.quantity;
              combined[item.id].quantity += item.quantity;
              const { basePrice, taxAmount } = calculatePriceAndTax(
                combined[item.id]?.price,
                item?.tax_percent,
                false
              );
              combined[item.id].tax = taxAmount * newQty;
              combined[item.id].totalPrice = (basePrice + taxAmount) * newQty;
            } else {
              combined[item.id] = { ...item };
            }
          });
        }
      });
      cartItems.value = Object.values(combined);
      calculateCartState();
      const tableId = selectedTable.value.id;
      floorNtables.value = floorNtables.value.map((floor) => {
        floor.tables = floor.tables.map((tableItem) => {
          if (tableItem.id === tableId) {
            tableItem.status = TABLESTATES.READYTOBILL;
            selectedTable.value = tableItem;
          }
          return tableItem;
        });
        return floor;
      });
    }
    const clearTable = (payload) => {
      floorNtables.value = floorNtables.value.map((floor) => {
        if (floor?.tables?.length) {
          floor.tables = floor.tables.map((table) => {
            if (table?.id == payload.table?.id) {
              table.status = TABLESTATES.FREE;
              table.order_id = undefined;
              table.ptid = undefined;
              table.time = undefined;
              table.tableOrder = [];
            }
            return table;
          });
        }
        return floor;
      });
    };
    const item_reset = ref(false);
    const factoryReset = () => {
      authenticated.value = null;

      selectedCategoryId.value = 0;
      all_items.value = [];
      shiftUser.value = null;
      all_categories.value = [];
      user_data.value = null;
      baseURL.value = null;
      locations.value = [];
      location.value = null;
      initialToken.value = null;
      location_users.value = [];
      merchant.value = null;
      token.value = null;
      all_customer_list.value = [];
      filteredItems.value = [];
      pos_device.value = null;
      order_list.value = [];
      defaultLocation.value = null;
      item_reset.value = true;
    };
    const a4Order = ref(null);
    const setA4Order = (order) => {
      a4Order.value = order;
    };
    const pos_login_type = ref(false);
    const set_pos_login_type = (payload) => {
      pos_login_type.value = payload;
    };
    const defaultLocation = ref(null);
    const setDefaultLocation = (locationId) => {
      const selectedLocation = locations.value.find(loc => loc.id === locationId);
      defaultLocation.value = selectedLocation;
    };
    return {
      location,
      storeLogin,
      getBaseURL,
      baseURL,
      user_data,
      getItems,
      all_items,
      locations,
      merchant,
      token,
      setAuthenticated,
      authenticated,
      all_categories,
      selectedCategoryId,
      setSelectedCategoryId,
      location_users,
      shiftUser,
      pos_key,
      shiftLogout,
      posLogout,
      filterItems,
      filteredItems,
      addToCart,
      cartItems,
      cartState,
      calculateCartState,
      pos_device,
      settings,
      fetchStoreSettings,
      removeFromCart,
      clearCart,
      selected_order_type,
      selectOrderType,
      resetCart,
      addCashAmount,
      searchItems,
      order_list,
      addOrder,
      resetCustomerSync,
      updateCustomerSync,
      customerSync,
      acknowledged,
      addCustomers,
      customer_list,
      syncCustomer,
      setSyncCustomer,
      selected_customer,
      set_selected_customer,
      fetchCustomers,
      forceLogout,
      setForceLogout,
      logoutForcefully,
      applyDiscount,
      initialToken,
      location,
      syncStatus,
      addCustomer,
      searchCustomers,
      floorNtables,
      selectedTable,
      fetchFloorNTables,
      setSelectedTable,
      addOrderToTable,
      tableOrderEditStatus,
      selectedTableOrder,
      clearSelectedTable,
      setTableOrderEditStatus,
      setSelectedTableOrder,
      resetTableState,
      updateTableStateStatus,
      updateTableOrderHistory,
      tableReadyToBill,
      clearTable,
      item_reset,
      factoryReset,
      a4Order,
      setA4Order,
      pos_login_type,
      set_pos_login_type,
      defaultLocation,
      setDefaultLocation,
      createCustomer,
      placeKioskOrder,
      resetKioskState,
      clearCartOnly,
    };
  },
  {
    persist: {
      enabled: true, // Enable persistence
      strategies: [
        {
          storage: localStorage,
        },
      ],
    },
  }
);
