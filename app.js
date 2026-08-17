import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, collection, getDocs, doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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
const profileBtn = document.getElementById('profileBtn');
const profileModal = document.getElementById('profileModal');
const closeProfile = document.getElementById('closeProfile');
const followBtn = document.getElementById('followBtn');
const editProfileBtn = document.getElementById('editProfileBtn');
const editForm = document.getElementById('editForm');
const saveProfileBtn = document.getElementById('saveProfileBtn');

let currentViewedUserId = null;

// Логин
loginBtn.onclick = async () => {
  const email = document.getElementById('authEmail').value;
  const password = document.getElementById('authPassword').value;
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (e) {
    alert("Ошибка входа: " + e.message);
  }
};

logoutBtn.onclick = () => signOut(auth);

// Отслеживание состояния входа
onAuthStateChanged(auth, async (user) => {
  if (user) {
    loginBtn.classList.add('hidden');
    logoutBtn.classList.remove('hidden');
    profileBtn.classList.remove('hidden');
    
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
      await setDoc(userRef, {
        email: user.email,
        followers: [],
        following: [],
        likes: 0
      });
    }
  } else {
    loginBtn.classList.remove('hidden');
    logoutBtn.classList.add('hidden');
    profileBtn.classList.add('hidden');
  }
});

// Модальное окно
profileBtn.onclick = () => openProfile(auth.currentUser.uid);
closeProfile.onclick = () => profileModal.classList.add('hidden');

async function openProfile(userId) {
  currentViewedUserId = userId;
  profileModal.classList.remove('hidden');
  editForm.classList.add('hidden');
  
  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);
  
  if (userSnap.exists()) {
    const data = userSnap.data();
    document.getElementById('profileUsername').innerText = data.email ? data.email.split('@')[0] : 'User';
    document.getElementById('profileBio').innerText = data.bio || 'Описание профиля отсутствует...';
    document.getElementById('profileAvatar').src = data.avatarUrl || 'https://via.placeholder.com/100';
    
    document.getElementById('followersCount').innerText = data.followers ? data.followers.length : 0;
    document.getElementById('followingCount').innerText = data.following ? data.following.length : 0;
    document.getElementById('likesCount').innerText = data.likes || 0;

    if (auth.currentUser && auth.currentUser.uid === userId) {
      editProfileBtn.classList.remove('hidden');
      followBtn.classList.add('hidden');
    } else if (auth.currentUser) {
      editProfileBtn.classList.add('hidden');
      followBtn.classList.remove('hidden');
      const isFollowing = data.followers && data.followers.includes(auth.currentUser.uid);
      followBtn.innerText = isFollowing ? "Отписаться" : "Подписаться";
    }
  }
}

// Редактирование
editProfileBtn.onclick = () => editForm.classList.toggle('hidden');

saveProfileBtn.onclick = async () => {
  if (!auth.currentUser) return;
  const avatarUrl = document.getElementById('editAvatarUrl').value;
  const bio = document.getElementById('editBioInput').value;
  
  const userRef = doc(db, "users", auth.currentUser.uid);
  await updateDoc(userRef, {
    ...(avatarUrl && { avatarUrl }),
    ...(bio && { bio })
  });
  
  openProfile(auth.currentUser.uid);
};

// Подписка
followBtn.onclick = async () => {
  if (!auth.currentUser) return alert("Сначала войдите в аккаунт");
  
  const targetUserRef = doc(db, "users", currentViewedUserId);
  const currentUserRef = doc(db, "users", auth.currentUser.uid);
  
  const targetSnap = await getDoc(targetUserRef);
  const isFollowing = targetSnap.data().followers?.includes(auth.currentUser.uid);

  if (isFollowing) {
    await updateDoc(targetUserRef, { followers: arrayRemove(auth.currentUser.uid) });
    await updateDoc(currentUserRef, { following: arrayRemove(currentViewedUserId) });
  } else {
    await updateDoc(targetUserRef, { followers: arrayUnion(auth.currentUser.uid) });
    await updateDoc(currentUserRef, { following: arrayUnion(currentViewedUserId) });
  }
  
  openProfile(currentViewedUserId);
};

// Загрузка ленты
async function loadVideos() {
  try {
    const querySnapshot = await getDocs(collection(db, "videos"));
    container.innerHTML = "";

    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const card = document.createElement('div');
      card.className = 'video-card';
      card.innerHTML = `
        <video class="video-player" src="${data.url}" controls loop muted playsinline></video>
        <div class="card-info">
          <div>
            <span class="author-link" onclick="openProfile('${data.authorId}')">@${data.authorName || 'user'}</span>
            <p style="font-size:13px; color:#aaa; margin-top:4px;">${data.title || ''}</p>
          </div>
          <button class="btn btn-secondary">❤️ ${data.likes || 0}</button>
        </div>
      `;
      container.appendChild(card);
    });
  } catch (e) {
    console.error(e);
  }
}

window.openProfile = openProfile;
loadVideos();
