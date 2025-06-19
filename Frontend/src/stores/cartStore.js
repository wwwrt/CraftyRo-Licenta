import { defineStore } from 'pinia'
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, getDoc, onSnapshot } from 'firebase/firestore'
import { db } from '@/firebaseconfig'
import { getAuth } from 'firebase/auth'

export const useCartStore = defineStore('cart', {
  state: () => ({
    products: []
  }),
  actions: {
    async fetchCartItems() {
      const auth = getAuth()
      const user = auth.currentUser
      if (!user) {
        this.products = []
        return
      }
      const q = collection(db, 'users', user.uid, 'cart') 
      const snapshot = await getDocs(q)
      this.products = snapshot.docs.map(doc => ({ ...doc.data(), docId: doc.id }))
    },
    async addProductToCart(product) {
      const auth = getAuth()
      const user = auth.currentUser
      if (!user) {
        console.log('NU esti logat!')
        return
      }
      // Ia userId-ul vânzătorului dacă nu există
      if (!product.userId) {
        const prodDoc = await getDoc(doc(db, 'products', product.id))
        if (prodDoc.exists()) {
          product.userId = prodDoc.data().userId
        }
      }
      // Caută dacă există deja produsul în cart pentru userul curent
      const existing = this.products.find(p => p.productId === product.id)
      if (existing && existing.docId) {
        const ref = doc(db, 'users', user.uid, 'cart', existing.docId)
        await updateDoc(ref, { quantity: existing.quantity + 1 })
        // Nu modifica direct this.products aici!
      } else {
        await addDoc(collection(db, 'users', user.uid, 'cart'), {
          productId: product.id,
          name: product.name,
          price: product.price,
          image: product.images?.[0] || product.imageURL || 'https://via.placeholder.com/288x192?text=Imagine+Produs',
          quantity: 1,
          userId: user.uid,
          sellerId: product.sellerId || product.userId,
          status: 'in_cart' // <-- status explicit!
        })
        // Nu mai face push manual în this.products!
      }
    },
    async removeProductFromCart(docId) {
      const auth = getAuth()
      const user = auth.currentUser
      if (!user) return
      await deleteDoc(doc(db, 'users', user.uid, 'cart', docId))
      this.products = this.products.filter(p => p.docId !== docId)
    },
    async updateQuantity(docId, quantity) {
      if (quantity < 1) return
      const auth = getAuth()
      const user = auth.currentUser
      if (!user) return
      await updateDoc(doc(db, 'users', user.uid, 'cart', docId), { quantity })
      const prod = this.products.find(p => p.docId === docId)
      if (prod) prod.quantity = quantity
    },
    listenToCart() {
      const auth = getAuth()
      const user = auth.currentUser
      if (!user) {
        this.products = []
        return
      }
      const q = collection(db, 'users', user.uid, 'cart')
      if (this._unsubscribeCart) this._unsubscribeCart()
      this._unsubscribeCart = onSnapshot(q, snap => {
        // FILTRARE: doar produse active (nu completed, nu removed)
        this.products = snap.docs
          .map(doc => ({ ...doc.data(), docId: doc.id }))
          .filter(p => p.status !== 'completed' && p.status !== 'removed')
      })
    },
    async finalizeProductInCart(product) {
      const auth = getAuth()
      const user = auth.currentUser
      if (!user) return
      await updateDoc(doc(db, 'users', user.uid, 'cart', product.docId), {
        finalizationResponse: true,
        status: 'completed'
      })
      const prod = this.products.find(p => p.docId === product.docId)
      if (prod) {
        prod.finalizationResponse = true
        prod.status = 'completed'
      }
    }
  }
})
