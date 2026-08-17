import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Замените своими данными из Firebase Console
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const container = document.getElementById('videoContainer');

async function loadVideos() {
  const querySnapshot = await getDocs(collection(db, "videos"));
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    createVideoCard(data.url, data.likes || 0);
  });
}

function createVideoCard(url, likesCount) {
  const videoCard = document.createElement('div');
  videoCard.className = 'video-card';
  
  videoCard.innerHTML = `
    <video class="video-player" src="${url}" loop></video>
    <div class="video-sidebar">
      <button class="sidebar-button">❤️ ${likesCount}</button>
    </div>
  `;

  const video = videoCard.querySelector('video');
  videoCard.addEventListener('click', () => {
    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  });

  container.appendChild(videoCard);
}

loadVideos();
