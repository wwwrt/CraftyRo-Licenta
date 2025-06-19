### 1. Instalează Firebase CLI

Asigură-te că ai Node.js instalat pe sistemul tău. Apoi, instalează Firebase CLI global folosind npm:

```bash
npm install -g firebase-tools
```

### 2. Autentifică-te în Firebase

Deschide terminalul și autentifică-te în contul tău Firebase:

```bash
firebase login
```

### 3. Creează un proiect Firebase

Dacă nu ai deja un proiect Firebase, creează unul în [Firebase Console](https://console.firebase.google.com/). Notează-ți ID-ul proiectului.

### 4. Inițializează Firebase în proiectul tău

Navighează în directorul aplicației tale (de exemplu, `/Users/timm/Desktop/Licență/CraftyRo/Frontend`) și inițializează Firebase:

```bash
cd /Users/timm/Desktop/Licență/CraftyRo/Frontend
firebase init
```

Alege opțiunea "Hosting" și urmează pașii:

- Selectează proiectul tău Firebase.
- Alege directorul public (de obicei, `dist` sau `build`, în funcție de cum îți construiești aplicația).
- Alege să configurezi aplicația ca o aplicație cu o singură pagină (SPA) dacă aplicația ta folosește routing.
- Alege să scrii peste fișierul `index.html` dacă este cazul.

### 5. Construiește aplicația

Dacă folosești un framework (de exemplu, Vue.js), asigură-te că construiești aplicația pentru producție. De obicei, acest lucru se face cu:

```bash
npm run build
```

Asigură-te că fișierele construite sunt în directorul pe care l-ai specificat în pasul anterior (de exemplu, `dist`).

### 6. Publică aplicația

După ce aplicația este construită, publică-o pe Firebase Hosting:

```bash
firebase deploy
```

### 7. Accesează aplicația

După ce procesul de deploy este complet, Firebase îți va oferi un URL unde poți accesa aplicația ta.

### 8. Configurări suplimentare (opțional)

Dacă ai nevoie de configurări suplimentare, cum ar fi redirecționarea sau setările de securitate, poți edita fișierul `firebase.json` generat în directorul proiectului tău.

### Concluzie

Acum aplicația ta ar trebui să fie disponibilă pe Firebase Hosting! Asigură-te că verifici documentația oficială Firebase pentru mai multe detalii și opțiuni avansate.