import { supabase } from "./supabase.js";


const gallery = document.getElementById("gallery");
const loader = document.getElementById("loader");
const parallaxBg = document.querySelector(".parallax-bg");
const lightbox = document.getElementById("lightbox");
const lbImg = document.getElementById("lb-img");
const lbDesc = document.getElementById("lb-desc");
const closeLb = document.querySelector(".close-lb");


window.addEventListener("mousemove", (e) => {
  const x = (window.innerWidth / 2 - e.clientX) / 50;
  const y = (window.innerHeight / 2 - e.clientY) / 50;
  parallaxBg.style.transform = `translate(${x}px, ${y}px) scale(1.1)`;
});


async function loadGallery() {
  try {
    const { data, error } = await supabase
      .from("images")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    gallery.innerHTML = "";
    

    setTimeout(() => {
      loader.style.opacity = "0";
      setTimeout(() => loader.remove(), 500);
      
      if (data.length === 0) {
        gallery.innerHTML = "<p style='text-align:center; width:100%;'>لا توجد صور لعرضها حالياً.</p>";
        return;
      }

      data.forEach((img, index) => {
        const card = document.createElement("div");
        card.className = "card";

        card.style.animationDelay = `${index * 0.1}s`; 
        
        card.innerHTML = `
          <img src="${img.url}" loading="lazy" alt="Image">
          <div class="card-overlay">
            <div class="card-desc">${img.description || " "}</div>
          </div>
        `;


        card.addEventListener("click", () => openLightbox(img.url, img.description));
        gallery.appendChild(card);
      });
    }, 800);

  } catch (err) {
    console.error("Error loading images:", err);
    loader.style.display = "none";
    gallery.innerHTML = "<p>حدث خطأ في تحميل الصور.</p>";
  }
}


function openLightbox(url, desc) {
  lbImg.src = url;
  lbDesc.textContent = desc || "";
  lightbox.classList.add("active");
}

lightbox.addEventListener("click", (e) => {
  if (e.target !== lbImg && e.target !== lbDesc) {
    lightbox.classList.remove("active");
  }
});


loadGallery();