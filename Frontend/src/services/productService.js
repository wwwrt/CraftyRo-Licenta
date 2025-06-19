// src/services/productService.js
import { collection, addDoc, doc, updateDoc, deleteDoc, getDoc } from "firebase/firestore"
import { db } from "../firebaseconfig"

export async function addProduct(product) {
  try {
    const docRef = await addDoc(collection(db, "products"), product)
    console.log("Produs adăugat cu ID:", docRef.id)
    return docRef.id
  } catch (error) {
    console.error("Eroare la adăugare produs:", error)
    throw error
  }
}

export async function updateProduct(product) {
  const productRef = doc(db, "products", product.id)
  try {
    await updateDoc(productRef, {
      name: product.name,
      price: product.price,
      stock: product.stock
    })
    console.log("Produs actualizat:", product.id)
  } catch (error) {
    console.error("Eroare la actualizare produs:", error)
    throw error
  }
}

export async function deleteProduct(productId) {
  try {
    await deleteDoc(doc(db, "products", productId))
    console.log("Produs șters:", productId)
  } catch (error) {
    console.error("Eroare la ștergere produs:", error)
    throw error
  }
}

export async function fetchSingleProduct(id) {
  const docRef = doc(db, "products", id)
  const docSnap = await getDoc(docRef)

  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() }
  } else {
    console.log("No such product!")
    return null
  }
}
