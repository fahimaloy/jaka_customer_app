<template>
  <div
    class="z-[99999] fixed bottom-0 left-0 right-0 h-14 bg-dark-primary p-2 flex gap-2 justify-evenly"
  >
    <router-link
      :to="item?.disabled ? null : item?.path"
      @click.prevent="item?.disabled && $event.preventDefault()"
      class="flex flex-col gap-[2px] text-xs items-center font-bold cursor-pointer relative"
      v-for="item in itemList"
      :class="route?.fullPath == item?.path ? 'text-orange-300' : 'text-white'"
    >
      <div v-html="item?.icon" class="w-5"></div>
      <div
        v-if="item.path == '/cart' && cartItems?.length > 0"
        class="absolute text-xs -top-2 -right-4 bg-red-500 text-white font-bold py-1 px-2 rounded-full"
      >
        {{ cartItems.length }}
      </div>
      <div>{{ item?.label }}</div>
    </router-link>
  </div>
</template>
<script setup>
// import TruckIcon from "../assets/icons/truck.svg?raw";
import UserIcon from "../assets/icons/user.svg?raw";
import RestaurantIcon from "../assets/icons/restaurant.svg?raw";
import BagIcon from "../assets/icons/bag.svg?raw";
import CartIcon from "../assets/icons/cart.svg?raw";
import TableIcon from "../assets/icons/table.svg?raw";
import { onMounted } from "vue";
import { useRoute } from "vue-router";
import { useMainStore } from "../stores/main";
import { storeToRefs } from "pinia";
const route = useRoute();
const store = useMainStore();
const { cartItems } = storeToRefs(store);
const itemList = [
  {
    label: "Home",
    path: "/home",
    icon: RestaurantIcon,
  },
  {
    label: "Orders",
    path: "/orders",
    icon: BagIcon,
  },
  {
    label: "Tables",
    path: "/tables",
    icon: TableIcon,
  },
  {
    label: "Customers",
    path: "/customers",
    icon: UserIcon,
    // disabled: true,
  },
  {
    label: "Cart",
    path: "/cart",
    icon: CartIcon,
  },
];
</script>
