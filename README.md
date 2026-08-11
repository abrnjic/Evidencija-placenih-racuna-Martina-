<p align="center">
  <img src="https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React Native" />
  <img src="https://img.shields.io/badge/Expo-1B1F23?style=for-the-badge&logo=expo&logoColor=white" alt="Expo" />
  <img src="https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" alt="Firebase" />
</p>

# Evidencija Plaćenih Računa (Režije Tracker) 📝💶

**Evidencija Plaćenih Računa** je moderna mobilna aplikacija (Android / iOS) namijenjena jednostavnom praćenju mjesečnih režija i troškova. Razvijena je pomoću **React Native (Expo)** okvira i koristi **Firebase Cloud Firestore** za besprijekornu i sigurnu sinkronizaciju podataka u oblaku.

---

## 🌟 Ključne Značajke

*   **Nadzorna Ploča (Dashboard):** Trenutni uvid u potrošnju ovog i prošlog mjeseca, uz izravnu usporedbu.
*   **Povijest Računa:** Pregledan i moderan popis svih plaćenih računa s informacijama o datumu, iznosu, i bilješkama.
*   **Jednostavan Unos:** Brzo dodavanje novog računa s padajućim izbornikom za kategorije (Struja, Voda, Plin...).
*   **Cloud Sinkronizacija:** Baza podataka na Firebaseu osigurava da nikada ne izgubite svoje zapise, čak ni pri promjeni uređaja.
*   **Sigurnost i Moderan Dizajn:** Elegantno korisničko sučelje prilagođeno tamnim i svijetlim temama na mobilnim uređajima.

---

## 🚀 Instalacija i Pokretanje (Lokalni Razvoj)

Za pokretanje ovog projekta na svom računalu, pratite sljedeće korake:

### 1. Preduvjeti
*   Instaliran [Node.js](https://nodejs.org/) (i `npm` paketi).
*   Mobitel s instaliranom **Expo Go** aplikacijom ([Android](https://play.google.com/store/apps/details?id=host.exp.exponent) / [iOS](https://apps.apple.com/us/app/expo-go/id982107779)).

### 2. Kloniranje i Postavljanje
```bash
git clone https://github.com/abrnjic/Evidencija-placenih-racuna-Martina-.git
cd Evidencija-placenih-racuna-Martina-
npm install
```

### 3. Konfiguracija Firebase Baze
Otvorite datoteku `src/firebaseConfig.ts` i osigurajte da je unesena ispravna konfiguracija vašeg Firebase Web projekta.

### 4. Pokretanje Aplikacije
```bash
npm run start
```
*Nakon što se prikaže QR kod, skenirajte ga Expo Go aplikacijom na Vašem uređaju.*

---

## 📦 Preuzimanje APK Aplikacije

Završnu verziju Android aplikacije (`.apk` datoteka) namijenjenu direktnoj instalaciji moći ćete pronaći u sekciji **[Releases](https://github.com/abrnjic/Evidencija-placenih-racuna-Martina-/releases)** s desne strane ovog repozitorija kada aplikacija bude u potpunosti izgrađena putem Cloud servera.

---

## 🛠️ Arhitektura & Tehnologije
*   **Frontend:** React Native, Expo SDK 57, Expo Router, Expo Vector Icons
*   **Backend / DB:** Firebase JS SDK, Cloud Firestore
*   **Alati:** Date-fns (za formatiranje datuma), React Native Picker

*Napravljeno s ljubavlju za brzu i jednostavnu kontrolu Vaših financija.* ❤️
