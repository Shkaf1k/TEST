import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyACr1SSptV2sjy8KwAeihcGH7wGlxcG7D8",
  authDomain: "toktok-d643a.firebaseapp.com",
  projectId: "toktok-d643a",
  storageBucket: "toktok-d643a.firebasestorage.app",
  messagingSenderId: "285685756382",
  appId: "1:285685756382:web:ffc060fd3082f932cbed4f",
  measurementId: "G-7NNFHFM5DF"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const container = document.getElementById('videoContainer');
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');

loginBtn.onclick = async () => {
  const email = document.getElementById('authEmail').value;
  const password = document.getElementById('authPassword').value;
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (e) {
    alert("Ошибка: " + e.message);
  }
};

logoutBtn.onclick = () => signOut(auth);

onAuthStateChanged(auth, (user) => {
  if (user) {
    loginBtn.classList.add('hidden');
    logoutBtn.classList.remove('hidden');
  } else {
    loginBtn.classList.remove('hidden');
    logoutBtn.classList.add('hidden');
  }
});

async function loadVideos() {
  try {
    const querySnapshot = await getDocs(collection(db, "videos"));
    container.innerHTML = "";

    if (querySnapshot.empty) {
      container.innerHTML = `
        <div class="video-card" style="padding: 20px; text-align: center;">
          <p>Нет видео для отображения.</p>
        </div>
      `;
      return;
    }

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const card = document.createElement('div');
      card.className = 'video-card';
      card.innerHTML = `
        <video class="video-player" src="${data.url}" controls loop muted playsinline></video>
        <div class="card-info">
          <span class="card-title">${data.title || 'Без названия'}</span>
          <button class="like-btn">❤️ ${data.likes || 0}</button>
        </div>
      `;
      container.appendChild(card);
    });
  } catch (e) {
    console.error(e);
  }
}

loadVideos();
