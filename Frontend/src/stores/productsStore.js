import { defineStore } from 'pinia'
import { collection, onSnapshot } from 'firebase/firestore'  // importă onSnapshot
import { db } from '../firebaseconfig'

export const useProductsStore = defineStore('products', {
  state: () => ({
    products: []
  }),
  actions: {
    fetchProducts() {
      const colRef = collection(db, 'products')
      onSnapshot(colRef, (snapshot) => {
        this.products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      }, (error) => {
        console.error('Firestore snapshot error:', error)
      })
    },
    addProduct(product) {
      this.products.push(product)
    },
    updateProduct(updatedProduct) {
      const index = this.products.findIndex(p => p.id === updatedProduct.id)
      if (index !== -1) this.products[index] = updatedProduct
    },
    deleteProduct(productId) {
      this.products = this.products.filter(p => p.id !== productId)
    }
  }
})
