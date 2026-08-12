<p align="center">
  <img src="https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React Native" />
  <img src="https://img.shields.io/badge/Expo-1B1F23?style=for-the-badge&logo=expo&logoColor=white" alt="Expo" />
  <img src="https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" alt="Firebase" />
  <img src="https://img.shields.io/badge/Gemini_AI-8E75B2?style=for-the-badge&logo=googlebard&logoColor=white" alt="Gemini AI" />
</p>

# Evidencija Plaćenih Računa (Režije Tracker) 📝💶

**Evidencija Plaćenih Računa** je napredna mobilna aplikacija (Android / iOS) namijenjena jednostavnom praćenju mjesečnih režija i troškova. Razvijena je pomoću **React Native (Expo)** okvira i koristi **Firebase Cloud Firestore** za sigurnu sinkronizaciju, uz dodatak moćne **umjetne inteligencije (Gemini AI)** za potpuno automatizirano skeniranje.

---

## 🌟 Ključne Značajke

*   ** Pametno AI Skeniranje (Gemini Vision):** Inovativna značajka koja omogućuje slikanje bilo kojeg računa (čak i onog iz trgovine). Umjetna inteligencija automatski prepoznaje iznos, izdavatelja, datum dospijeća i točnu kategoriju, ispunjavajući obrazac umjesto vas!
*   ** Skener HUB3 Uplatnica:** Ugrađen brzi 2D skener za standardne hrvatske HUB3 uplatnice.
*   ** Mjesečno Budžetiranje:** Mogućnost postavljanja ograničenja potrošnje za svaku kategoriju, praćeno vizualnim trakama napretka (progress bars) na početnom ekranu.
*   ** Nadzorna Ploča (Dashboard):** Trenutni uvid u potrošnju, usporedba ovog i prošlog mjeseca, te grafički prikaz budžeta.
*   ** Premium Animacije:** Uglađeni prijelazi i kaskadna animacija lista uz pomoć `react-native-reanimated`.
*   ** Izvoz u PDF:** Brzi izvoz evidencije plaćanja u PDF format i dijeljenje preko aplikacija (WhatsApp, Mail, itd.).
*   ** Biometrijska Sigurnost:** Mogućnost zaključavanja aplikacije prilikom pokretanja pomoću otiska prsta ili Face ID-a (App Lock).
*   ** Pametni Podsjetnici:** Automatske Push obavijesti svakog 20. u mjesecu kao podsjetnik za plaćanje računa.
*   ** Cloud Sinkronizacija:** Baza podataka na Firebaseu osigurava da nikada ne izgubite zapise.

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

### 3. Konfiguracija Firebase i Gemini API-ja
*   Otvorite datoteku `src/firebaseConfig.ts` i osigurajte da je unesena ispravna konfiguracija vašeg Firebase Web projekta.
*   Za omogućavanje AI značajki, u postavkama same aplikacije unesite besplatni [Google Gemini API ključ](https://aistudio.google.com/app/apikey).

### 4. Pokretanje Aplikacije
```bash
npm run start
```
*Nakon što se prikaže QR kod, skenirajte ga Expo Go aplikacijom na Vašem uređaju.*

---

## 📦 Preuzimanje APK Aplikacije

Završnu verziju Android aplikacije (`.apk` datoteka) namijenjenu direktnoj instalaciji uvijek možete pronaći na našem stalnom linku na najnoviju verziju (Najnoviji Release):

🔗 **[Preuzmi Najnoviji APK (Latest Release)](https://github.com/abrnjic/Evidencija-placenih-racuna-Martina-/releases/latest)**

---

## 🛠️ Arhitektura & Tehnologije
*   **Frontend:** React Native, Expo SDK 57, Expo Router, Reanimated
*   **AI Integracija:** @google/generative-ai
*   **Backend / DB:** Firebase JS SDK, Cloud Firestore
*   **Alati:** Expo Camera, Expo Print (PDF), Expo Local Authentication

*Napravljeno s ljubavlju za brzu i jednostavnu kontrolu Vaših financija.* ❤️
