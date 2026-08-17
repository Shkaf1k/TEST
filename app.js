import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { 
  getFirestore, 
  collection, 
  getDocs 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Конфигурация Firebase (замените на свои данные из Firebase Console)
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// DOM Элементы
const authModal = document.getElementById("authModal");
const profileModal = document.getElementById("profileModal");
const showAuthBtn = document.getElementById("showAuthBtn");
const closeAuth = document.getElementById("closeAuth");
const closeProfile = document.getElementById("closeProfile");
const authSubmitBtn = document.getElementById("authSubmitBtn");
const toggleAuthText = document.getElementById("toggleAuthText");
const modalTitle = document.getElementById("modalTitle");
const authEmail = document.getElementById("authEmail");
const authPassword = document.getElementById("authPassword");
const profileEmail = document.getElementById("profileEmail");
const logoutBtn = document.getElementById("logoutBtn");
const videoContainer = document.getElementById("videoContainer");

let isSignUp = false;

// Управление модальными окнами
showAuthBtn.onclick = () => {
  if (auth.currentUser) {
    profileEmail.innerText = auth.currentUser.email;
    profileModal.classList.remove("hidden");
  } else {
    authModal.classList.remove("hidden");
  }
};

closeAuth.onclick = () => authModal.classList.add("hidden");
closeProfile.onclick = () => profileModal.classList.add("hidden");

// Переключение между Входом и Регистрацией
toggleAuthText.onclick = () => {
  isSignUp = !isSignUp;
  modalTitle.innerText = isSignUp ? "Регистрация" : "Вход";
  authSubmitBtn.innerText = isSignUp ? "Зарегистрироваться" : "Войти";
  toggleAuthText.innerText = isSignUp ? "Уже есть аккаунт? Войти" : "Нет аккаунта? Зарегистрироваться";
};

// Регистрация / Вход
authSubmitBtn.onclick = async () => {
  const email = authEmail.value;
  const password = authPassword.value;

  try {
    if (isSignUp) {
      await createUserWithEmailAndPassword(auth, email, password);
    } else {
      await signInWithEmailAndPassword(auth, email, password);
    }
    authModal.classList.add("hidden");
    authEmail.value = "";
    authPassword.value = "";
  } catch (error) {
    alert(error.message);
  }
};

// Выход из аккаунта
logoutBtn.onclick = async () => {
  await signOut(auth);
  profileModal.classList.add("hidden");
};

// Отслеживание состояния пользователя
onAuthStateChanged(auth, (user) => {
  if (user) {
    showAuthBtn.innerText = "Профиль";
  } else {
    showAuthBtn.innerText = "Войти";
  }
});

// Загрузка видео из Firestore
async function loadVideos() {
  try {
    const querySnapshot = await getDocs(collection(db, "videos"));
    videoContainer.innerHTML = "";
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      createVideoCard(data.url, data.likes || 0);
    });
  } catch (e) {
    console.error("Ошибка загрузки видео: ", e);
  }
}

function createVideoCard(url, likes) {
  const card = document.createElement("div");
  card.className = "video-card";
  card.innerHTML = `
    <video class="video-player" src="${url}" loop muted playsinline></video>
    <div class="video-sidebar">
      <button class="sidebar-btn">❤️ ${likes}</button>
    </div>
  `;

  const video = card.querySelector("video");
  card.onclick = () => {
    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  };

  videoContainer.appendChild(card);
}

loadVideos();
