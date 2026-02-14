import { supabase } from "./supabase.js";

const gallery = document.getElementById("gallery");

async function loadGallery() {
  const { data } = await supabase
    .from("images")
    .select("*")
    .order("created_at", { ascending: false });

  gallery.innerHTML = "";
  data.forEach(img => {
    gallery.innerHTML += `
      <div class="card">
        <img src="${img.url}">
        <p>${img.description || ""}</p>
      </div>
    `;
  });
}

loadGallery();
