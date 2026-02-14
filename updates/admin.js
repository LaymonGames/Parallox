import { supabase } from "./supabase.js";


const loginView = document.getElementById("loginView");
const dashboardView = document.getElementById("dashboardView");
const emailEl = document.getElementById("email");
const passwordEl = document.getElementById("password");
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const uploadBtn = document.getElementById("uploadBtn");
const imageInput = document.getElementById("imageInput");
const descInput = document.getElementById("descInput");
const adminGallery = document.getElementById("adminGallery");


checkSession();

async function checkSession() {
  const { data } = await supabase.auth.getSession();
  if (data.session) {
    showDashboard();
  } else {
    showLogin();
  }
}

function showDashboard() {
  loginView.style.display = "none";

  dashboardView.style.display = "flex"; 
  loadImages();
}

function showLogin() {
  loginView.style.display = "block";
  dashboardView.style.display = "none";
  adminGallery.innerHTML = "";
}


loginBtn.addEventListener("click", async () => {
  if(!emailEl.value || !passwordEl.value) return alert("البيانات ناقصة");
  loginBtn.innerText = "جاري التحقق...";
  loginBtn.disabled = true;

  const { error } = await supabase.auth.signInWithPassword({
    email: emailEl.value,
    password: passwordEl.value
  });

  if (error) {
    alert("خطأ في البيانات!");
    loginBtn.innerText = "دخول";
    loginBtn.disabled = false;
  } else {
    loginBtn.innerText = "دخول";
    loginBtn.disabled = false;
    showDashboard();
  }
});


logoutBtn.addEventListener("click", async () => {
  if(confirm("تأكيد الخروج؟")) {
    await supabase.auth.signOut();
    showLogin();
  }
});


async function loadImages() {
  const { data, error } = await supabase
    .from("images")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return console.error(error);

  adminGallery.innerHTML = "";
  data.forEach(img => {
    const card = document.createElement("div");

    card.className = "card";
    

    card.style.height = "auto"; 
    card.style.minHeight = "auto";
    
    card.innerHTML = `
      <img src="${img.url}" style="width:100%; height:auto; display:block; border-radius: 15px 15px 0 0;">
      
      <div style="padding:15px;">
        <input class="edit-input" value="${img.description || ""}" placeholder="تعديل الوصف" style="margin-bottom:10px;">
        <button class="delete-btn" style="background:#ff4757; margin:0;">حذف الصورة 🗑️</button>
      </div>
    `;


    const input = card.querySelector(".edit-input");
    input.addEventListener("change", (e) => updateDesc(img.id, e.target.value));

    const delBtn = card.querySelector(".delete-btn");
    delBtn.addEventListener("click", () => {
        if(confirm("حذف الصورة نهائياً؟")) deleteImage(img.id, img.url);
    });

    adminGallery.appendChild(card);
  });
}


async function updateDesc(id, newDesc) {
  await supabase.from("images").update({ description: newDesc }).eq("id", id);
}


async function deleteImage(id, url) {
  try {
    const path = url.split("/storage/v1/object/public/images/")[1];
    if(path) await supabase.storage.from("images").remove([path]);
    
    await supabase.from("images").delete().eq("id", id);
    loadImages();
  } catch (error) {
    alert("خطأ في الحذف");
  }
}


uploadBtn.addEventListener("click", async () => {
  const file = imageInput.files[0];
  if (!file) return alert("اختر صورة");

  uploadBtn.innerText = "جاري الرفع...";
  uploadBtn.disabled = true;

  const fileName = `${Date.now()}_${file.name.replace(/\s/g, '')}`;

  const { error: uploadError } = await supabase.storage
    .from("images")
    .upload(fileName, file);

  if (uploadError) {
    alert(uploadError.message);
    uploadBtn.innerText = "نشر الصورة 🚀";
    uploadBtn.disabled = false;
    return;
  }

  const { data: urlData } = supabase.storage.from("images").getPublicUrl(fileName);

  const { error: dbError } = await supabase.from("images").insert({
    url: urlData.publicUrl,
    path: fileName,
    description: descInput.value
  });

  if (!dbError) {
    imageInput.value = "";
    descInput.value = "";
    loadImages();
    alert("تم النشر!");
  }
  
  uploadBtn.innerText = "نشر الصورة 🚀";
  uploadBtn.disabled = false;
});