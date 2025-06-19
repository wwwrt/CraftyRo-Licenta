<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { auth, googleProvider, facebookProvider, db } from "../firebaseconfig"
import { signInWithPopup, signInWithEmailAndPassword, onAuthStateChanged, sendPasswordResetEmail} from "firebase/auth"
import { doc, setDoc, updateDoc, collection, getDocs } from "firebase/firestore"

const email = ref('')
const password = ref('')
const router = useRouter()
const currentUser = ref(null)
const showReset = ref(false)
const resetEmail = ref('')
const codeError = ref('')
const resetSent = ref(false)
const loginError = ref('')



const saveUser = async (user) => {
  const refDoc = doc(db, "users", user.uid)
  const defaultPhoto = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || user.email || 'User')}&background=eee&color=bbb&size=120`
  await setDoc(refDoc, {
    uid: user.uid,
    displayName: user.displayName || "",
    email: user.email || "",
    photoURL: user.photoURL || defaultPhoto,
    createdAt: new Date()
  }, { merge: true })
}

// Ascultăm schimbarea autentificării
onMounted(() => {
  onAuthStateChanged(auth, (user) => {
    currentUser.value = user
  })
})

const loginWithEmail = async () => {
  loginError.value = ''
  try {
    const result = await signInWithEmailAndPassword(auth, email.value, password.value)
    await saveUser(result.user)
    router.push('/')
  } catch (error) {
    if (
      error.code === 'auth/user-not-found' ||
      error.code === 'auth/wrong-password' ||
      error.code === 'auth/invalid-credential'
    ) {
      loginError.value = 'Emailul sau parola nu sunt corecte.'
    } else {
      loginError.value = "Eroare la autentificare: " + error.message
    }
  }
}

const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider)
    await saveUser(result.user)
    router.push('/')
  } catch (error) {
    alert("Google login error: " + error.message)
  }
}

const loginWithFacebook = async () => {
  try {
    const result = await signInWithPopup(auth, facebookProvider)
    await saveUser(result.user)
    router.push('/')
  } catch (error) {
    alert("Facebook login error: " + error.message)
  }
}


// Functie pentru a corecta utilizatorii existenti
async function fixUsers() {
  const usersSnapshot = await getDocs(collection(db, 'users'))
  for (const userDoc of usersSnapshot.docs) {
    const data = userDoc.data()
    const defaultPhoto = `https://ui-avatars.com/api/?name=${encodeURIComponent(data.displayName || data.email || 'User')}&background=eee&color=bbb&size=120`
    await updateDoc(doc(db, 'users', userDoc.id), {
      photoURL: data.photoURL || defaultPhoto
    })
  }
}
fixUsers()


// --- RESETARE PAROLĂ CU COD ---
const handleResetRequest = async () => {
  codeError.value = ''
  resetSent.value = false
  try {
    await sendPasswordResetEmail(auth, resetEmail.value)
    resetSent.value = true
  } catch (e) {
    codeError.value = 'Eroare la trimiterea emailului: ' + e.message
  }
}
</script>

<template>
  <div class="w-full lg:max-w-xl p-6 space-y-6 sm:p-8 rounded-2xl shadow-xl bg-[#d4a373] text-[#fefae0]">
    <h2 class="text-2xl font-bold">Autentificare în CraftyRO</h2>
    <template v-if="!currentUser">
      <form v-if="!showReset" @submit.prevent="loginWithEmail" class="space-y-4">
        <div>
          <label for="email" class="block text-sm font-medium">Email</label>
          <input v-model="email" type="email" id="email" class="bg-[#fefae0] text-[#d4a373] rounded-lg w-full p-2.5" placeholder="exemplu@email.com" required />
        </div>
        <div>
          <label for="password" class="block text-sm font-medium">Parolă</label>
          <input v-model="password" type="password" id="password" class="bg-[#fefae0] text-[#d4a373] rounded-lg w-full p-2.5" placeholder="••••••••" required />
        </div>
        <div v-if="loginError" class="text-red-600 text-sm text-center">{{ loginError }}</div>
        <button type="submit" class="w-full bg-[#e7c8a0] text-[#484564] font-medium py-2 rounded-lg hover:bg-[#484564] hover:text-white transition">
          Autentificare cu email
        </button>
      </form>

      <div v-if="!showReset" class="flex flex-row items-center justify-center gap-6 mt-4">
        <button
          @click="loginWithGoogle"
          class="w-14 h-14 flex items-center justify-center rounded-full bg-white border border-[#e7c8a0] hover:bg-[#fefae0] transition"
          aria-label="Autentificare cu Google"
          type="button"
        >
          <img src="/Glogo.png" alt="Google" class="w-8 h-8 object-contain" />
        </button>
        <button
          @click="loginWithFacebook"
          class="w-14 h-14 flex items-center justify-center rounded-full bg-white border border-[#e7c8a0] hover:bg-[#fefae0] transition"
          aria-label="Autentificare cu Facebook"
          type="button"
        >
          <img src="/Flogo.png" alt="Facebook" class="w-14 h-14 object-contain" />
        </button>
      </div>

      <div class="text-sm font-medium pt-4 text-center" v-if="!showReset">
        Nu ai cont?
        <RouterLink class="hover:underline text-[#484564]" :to="{ name: 'signup' }">Creează unul!</RouterLink>
      </div>
      <div class="text-center mt-2" v-if="!showReset">
        <button @click="showReset = true" class="text-[#484564] font-medium underline hover:text-[#d4a373]">Ai uitat parola?</button>
      </div>

      <!-- RESETARE PAROLĂ -->
      <div v-if="showReset">
        <form v-if="!resetSent" @submit.prevent="handleResetRequest" class="space-y-4">
          <label for="reset-email" class="block text-sm font-medium">Emailul tău</label>
          <input v-model="resetEmail" id="reset-email" type="email" class="bg-[#fefae0] text-[#d4a373] rounded-lg w-full p-2.5" required>
          <div v-if="codeError" class="text-red-600 text-sm text-center">{{ codeError }}</div>
          <button type="submit" class="w-full bg-[#e7c8a0] text-[#484564] font-medium py-2 rounded-lg hover:bg-[#484564] hover:text-white transition">
            Primește email de resetare
          </button>
        </form>
        <div v-else class="mt-2 text-green-600 text-center">
          Ți-am trimis un email cu un link de resetare a parolei. Verifică inbox-ul și urmează instrucțiunile pentru a-ți seta o parolă nouă.
        </div>
        <div class="text-center mt-2">
          <button @click="showReset = false; resetEmail=''; resetSent=false; codeError='';" class="text-[#484564] underline hover:text-[#d4a373]">Înapoi la autentificare</button>
        </div>
      </div>
    </template>
    <!-- ... restul codului pentru user logat ... -->
  </div>
</template>
