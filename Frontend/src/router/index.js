import { createRouter, createWebHistory } from 'vue-router'

import AboutUs from '@/screens/AboutUs.vue'
import CraftyLearn from '@/screens/CraftyLearn.vue'
import ProductCategories from '@/screens/ProductCategories.vue'
import CraftyExhibition from '@/screens/CraftyExhibition.vue'
import VIP from '@/screens/VIP.vue'
import MyProfile from '@/screens/MyProfile.vue'
import HomePage from '@/screens/HomePage.vue'
import Leaderboard from '@/screens/CraftyLeaderboard.vue'
import Points from '@/screens/Points.vue'
import SignUp from '@/screens/SignUp.vue'
import LogIn from '@/screens/LogIn.vue'
import CraftyShop from '@/screens/CraftyShop.vue'
import UpdateProduct from '@/screens/UpdateProduct.vue'
import NewProduct from '@/screens/NewProduct.vue'
import CraftyFavorites from '@/screens/CraftyFavorites.vue'
import CraftyOrders from '@/screens/CraftyOrders.vue'
import MessagesView from '@/screens/MessagesView.vue'
import CartHome from '@/screens/CartHome.vue'
import MyOrders from '@/screens/MyOrders.vue'
import MySales from '@/screens/MySales.vue'
import OrderForm from '@/screens/OrderForm.vue'
import UserProfile from '@/screens/UserProfile.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomePage
  },
  {
    path: '/exhibition',
    name: 'exhibition',
    component: CraftyExhibition
  },
  {
    path: '/leaderboard',
    name: 'leaderboard',
    component: Leaderboard
  },
  {
    path: '/about',
    name: 'about',
    component: AboutUs
  },
  {
    path: '/points',
    name: 'points',
    component: Points
  },
  {
    path: '/vip',
    name: 'vip',
    component: VIP
  },
  {
    path: '/profile',
    name: 'profile',
    component: MyProfile
  },
  {
    path: '/shop',
    name: 'shop',
    component: CraftyShop
  },
  {
    path: '/categories',
    name: 'categories',
    component: ProductCategories
  },
  {
    path: '/login',
    name: 'login',
    component: LogIn
  },
  {
    path: '/signup',
    name: 'signup',
    component: SignUp
  },
  {
    path: '/new-product',
    name: 'new-product',
    component: NewProduct
  },
  {
    path: '/update-product/:id',
    name: 'update-product',
    component: UpdateProduct
  },
  {
    path: '/cart',
    name: 'cart',
    component: CartHome
  },
  {
    path: '/learn',
    name: 'learn',
    component: CraftyLearn
  },
  {
    path: '/favorites',
    name: 'favorites',
    component: CraftyFavorites
  },
  {
    path: '/orders',
    name: 'orders',
    component: CraftyOrders
  },
  {
    path: '/messages',
    name: 'messages',
    component: MessagesView
  },
  {
    path: '/product/:id',
    name: 'product-detail',
    component: () => import('@/screens/ProductDetail.vue')
  },
  {
    path: '/payment-method',
    name: 'payment-method',
    component: () => import('@/screens/PaymentMethod.vue')
  },
  {
    path: '/my-orders',
    name: 'my-orders',
    component: MyOrders
  },
  {
    path: '/my-sales',
    name: 'my-sales',
    component: MySales
  },
  {
    path: '/order-form',
    name: 'order-form',
    component: OrderForm
  },
  {
    path: '/user/:id',
    name: 'user-profile',
    component: UserProfile
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
  // eslint-disable-next-line no-unused-vars
  // scrollBehavior(_to, _from, _savedPosition) {
  //   // Forțează fereastra să revină la coordonatele (0,0) la fiecare navigare.
  //   // Aceasta este soluția standard pentru problema de redare la tranziția
  //   // de la o pagină `fixed` (MessagesView) la o pagină cu flux normal.
  //   return { top: 0, left: 0 }
  // }
})

export default router
