import { defineStore } from 'pinia'
import { ref } from 'vue'
import { db } from '@/firebaseconfig'
import { collection, query, where, orderBy, onSnapshot, doc, getDoc } from 'firebase/firestore'

export const useMessagesStore = defineStore('messagesStore', () => {
  const conversations = ref([])

  // Cache pentru enrich ca să nu faci fetch de fiecare dată
  const enrichCache = {}

  function clearStore() {
    conversations.value = []
    // Golește și cache-ul!
    for (const key in enrichCache) {
      delete enrichCache[key]
    }
  }

  async function enrichConversation(conv, userId) {
    if (enrichCache[conv.id]) return { ...conv, ...enrichCache[conv.id] }
    const otherUserId = conv.members.find(uid => uid !== userId)
    let name = 'Conversatie'
    let avatar = '/default-avatar.png'
    let productImage = ''
    let productTitle = ''
    if (otherUserId) {
      const userDoc = await getDoc(doc(db, 'users', otherUserId))
      if (userDoc.exists()) {
        const data = userDoc.data()
        name = data.name || data.displayName || name
        avatar = data.photoURL || data.avatar || avatar
      }
    }
    if (conv.productId) {
      const prodDoc = await getDoc(doc(db, 'products', conv.productId))
      if (prodDoc.exists()) {
        const prod = prodDoc.data()
        productImage = prod.imageURL || ''
        productTitle = prod.name || ''
      }
    }
    enrichCache[conv.id] = { name, avatar, productImage, productTitle }
    return { ...conv, name, avatar, productImage, productTitle }
  }

  function fetchConversations(userId) {
    if (!userId) return

    // Golește cache-ul la fiecare fetch, nu doar la clearStore!
    for (const key in enrichCache) {
      delete enrichCache[key]
    }

    const q = query(
      collection(db, 'conversations'),
      where('members', 'array-contains', userId),
      orderBy('lastUpdated', 'desc')
    )

    onSnapshot(q, async snap => {
      // Pentru fiecare conversație, enrich și unreadCount
      const promises = snap.docs.map(async docu => {
        let conv = { id: docu.id, ...docu.data(), unreadCount: 0 }
        conv = await enrichConversation(conv, userId)
        // Ascultă în timp real mesajele necitite
        const msgsQ = query(
          collection(db, 'conversations', docu.id, 'messages'),
          where('read', '==', false),
          where('senderId', '!=', userId)
        )
        // Folosește promise pentru unreadCount
        const unreadPromise = new Promise(resolve => {
          onSnapshot(msgsQ, msgsSnap => {
            resolve(msgsSnap.size)
          })
        })
        conv.unreadCount = await unreadPromise
        return conv
      })

      // Așteaptă toate enrich-urile și unreadCount-urile
      conversations.value = await Promise.all(promises)
    })
  }

  return { conversations, fetchConversations, clearStore }
})
