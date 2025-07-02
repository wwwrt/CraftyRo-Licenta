/**
 * =====================================================================================
 * MESSAGES STORE - GESTIONAREA GLOBALĂ A CONVERSAȚIILOR
 * =====================================================================================
 * 
 * DESCRIERE:
 * Store-ul Pinia pentru gestionarea conversațiilor și stării globale a mesagelor.
 * Oferă funcționalități pentru încărcarea conversațiilor, îmbogățirea cu detalii
 * despre utilizatori și produse, și sincronizarea în timp real cu Firebase.
 * 
 * FUNCȚIONALITĂȚI:
 * • Încărcarea conversațiilor din Firebase Firestore
 * • Îmbogățirea conversațiilor cu detalii despre utilizatori și produse
 * • Cache pentru optimizarea performanței
 * • Filtrarea conversațiilor fără mesaje
 * • Gestionarea stării globale a aplicației
 * 
 * =====================================================================================
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'
import { db } from '@/firebaseconfig'
import { collection, query, where, orderBy, onSnapshot, doc, getDoc, getDocs } from 'firebase/firestore'

export const useMessagesStore = defineStore('messagesStore', () => {
  // =====================================================================================
  // STAREA STORE-ULUI
  // =====================================================================================
  const conversations = ref([])
  const enrichCache = {}

  // =====================================================================================
  // FUNCȚII PENTRU ÎMBOGĂȚIREA CONVERSAȚIILOR
  // =====================================================================================
  
  /**
   * Îmbogățește o conversație cu detalii despre utilizator și produs
   */
  async function enrichConversation(conv, currentUserId) {
    if (enrichCache[conv.id]) {
      return { ...conv, ...enrichCache[conv.id] }
    }

    let name = 'Utilizator necunoscut'
    let avatar = null
    let productImage = null
    let productTitle = ''

    const otherUserId = conv.members.find(uid => uid !== currentUserId)
    if (otherUserId) {
      try {
        const userDoc = await getDoc(doc(db, 'users', otherUserId))
        if (userDoc.exists()) {
          const userData = userDoc.data()
          name = userData.displayName || userData.name || 'Utilizator'
          avatar = userData.photoURL
        }
      } catch (error) {
        console.error('Eroare la încărcarea utilizatorului:', error)
      }
    }

    if (conv.productId) {
      try {
        const prodDoc = await getDoc(doc(db, 'products', conv.productId))
        if (prodDoc.exists()) {
          const prod = prodDoc.data()
          productImage = prod.images && prod.images.length > 0 ? prod.images[0] : null
          productTitle = prod.name || ''
        }
      } catch (error) {
        console.error('Eroare la încărcarea produsului:', error)
      }
    }
    
    enrichCache[conv.id] = { name, avatar, productImage, productTitle }
    return { ...conv, name, avatar, productImage, productTitle }
  }

  // =====================================================================================
  // FUNCȚII PRINCIPALE
  // =====================================================================================
  
  /**
   * Încarcă conversațiile utilizatorului din Firebase
   */
  function fetchConversations(userId) {
    if (!userId) return

    for (const key in enrichCache) {
      delete enrichCache[key]
    }

    const q = query(
      collection(db, 'conversations'),
      where('members', 'array-contains', userId),
      orderBy('lastUpdated', 'desc')
    )

    onSnapshot(q, async snap => {
      console.log('Se încarcă conversațiile din Firebase...', snap.docs.length)
      
      const promises = snap.docs.map(async docu => {
        let conv = { id: docu.id, ...docu.data(), unreadCount: 0 }
        
        if (!conv.lastMessage) {
          console.log('Se omite conversația fără ultimul mesaj:', docu.id)
          return null
        }
        
        conv = await enrichConversation(conv, userId)
        
        const unreadMsgsQ = query(
          collection(db, 'conversations', docu.id, 'messages'),
          where('read', '==', false),
          where('senderId', '!=', userId)
        )
        const unreadSnap = await getDocs(unreadMsgsQ)
        conv.unreadCount = unreadSnap.size
        
        return conv
      })

      const resolvedConversations = await Promise.all(promises)
      conversations.value = resolvedConversations.filter(conv => conv !== null)
      console.log('Conversații încărcate:', conversations.value.length)
    })
  }

  /**
   * Resetează store-ul
   */
  function clearStore() {
    conversations.value = []
    for (const key in enrichCache) {
      delete enrichCache[key]
    }
  }

  return { conversations, fetchConversations, clearStore }
})
