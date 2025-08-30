import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import Login from "@/views/Login.vue";
import Registration from "@/views/Registration.vue";
import PhoneLogin from "@/views/PhoneLogin.vue";
import ShiftLogin from "@/views/ShiftLogin.vue";
import Cart from "@/views/Cart.vue";
import Checkout from "@/views/Checkout.vue";
import Orders from "@/views/Orders.vue";
import Customers from "@/views/Customers.vue";
import Sync from "@/views/Sync.vue";
import ShiftOut from "@/views/ShiftOut.vue";
import Settings from "@/views/Settings.vue";
import Tables from "@/views/Tables.vue";
import ItemCU from "@/views/ItemCU.vue";
import CustomerCU from "@/views/CustomerCU.vue";
import Printer from "@/views/Printer.vue";
import Invoice from "@/views/Invoice.vue";
import DefaultLocation from "@/views/DefaultLocation.vue";
import SalesReturn from "@/views/sales-return/SalesReturn.vue";
import Debug from "@/views/Debug.vue"
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/login",
      name: "login",
      component: Login,
    },
    {
      path: "/debug",
      name: "debug",
      component: Debug,
    },
    {
      path: "/registration",
      name: "registration",
      component: Registration,
    },
    {
      path: "/shift-login",
      name: "shift-login",
      component: ShiftLogin,
    },
    {
      path: "/shift-out",
      name: "shift-out",
      component: ShiftOut,
    },
    {
      path: "/home",
      name: "home",
      component: HomeView,
    },
    {
      path: "/sync",
      name: "sync",
      component: Sync,
    },
    {
      path: "/tables",
      name: "tables",
      component: Tables,
    },
    {
      path: "/cart",
      name: "cart",
      component: Cart,
    },
    {
      path: "/settings",
      name: "settings",
      component: Settings,
    },
    {
      path: "/checkout",
      name: "checkout",
      component: Checkout,
    },
    {
      path: "/orders",
      name: "orders",
      component: Orders,
    },
    {
      path: "/default-location",
      name: "default-location",
      component: DefaultLocation,
    },
    {
      path: "/sales-return",
      name: "sales-return",
      component: SalesReturn,
    },
    {
      path: "/customers",
      name: "customers",
      component: Customers,
    },
    {
      path: "/about",
      name: "about",
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import("../views/AboutView.vue"),
    },
    {
      path: "/items/:mode(edit|add)/:item?",
      component: ItemCU,
    },
    {
      path: "/customers/:mode(edit|add)/:customer?",
      component: CustomerCU,
    },
    {
      path: "/printer",
      component: Printer,
    },

    {
      path: "/a4-print",
      component: Invoice,
    },
  ],
});

export default router;
