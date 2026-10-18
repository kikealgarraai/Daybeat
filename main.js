// URL del webhook de n8n (workflow "Analisis de solicitudes de presupuesto fotografico", método POST).
const N8N_WEBHOOK_URL = "https://kikealgarra.app.n8n.cloud/webhook/daybeat-solicitud";

document.getElementById("year").textContent = new Date().getFullYear();

const form = document.getElementById("lead-form");
const status = document.getElementById("form-status");

// El webhook solo acepta envíos desde la web publicada; en una vista previa el formulario no envía.
const IS_LIVE = location.hostname === "kikealgarraai.github.io";

form?.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!form.reportValidity()) return;
  const data = Object.fromEntries(new FormData(form));
  if (data.web) return; // honeypot anti-spam
  delete data.web;
  delete data.privacidad; // la casilla es obligatoria para enviar; n8n no la necesita
  if (!IS_LIVE) {
    status.textContent = "Esto es una vista previa: el formulario funcionará cuando la web esté publicada.";
    return;
  }
  // n8n espera "descripcion"; "fecha" en n8n es la fecha del servicio, no la del envío.
  if (data.mensaje !== undefined) { data.descripcion = data.mensaje; delete data.mensaje; }
  data.origen = "web";
  data.enviado_en = new Date().toISOString();

  status.textContent = "Enviando…";
  try {
    const res = await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(res.status);
    form.reset();
    status.textContent = "¡Gracias! Te escribimos pronto.";
  } catch {
    status.textContent = "No se pudo enviar. Inténtalo de nuevo en un momento.";
  }
});

// Los botones de cada apartado preseleccionan el tipo de servicio en el formulario.
document.querySelectorAll("[data-servicio]").forEach((btn) => {
  btn.addEventListener("click", () => { if (form) form.elements.servicio.value = btn.dataset.servicio; });
});

// Los botones de cada tarifa dejan anotado el pack elegido.
document.querySelectorAll("[data-pack]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const msg = form?.elements.mensaje;
    if (msg && !msg.value.trim()) msg.value = `Me interesa: ${btn.dataset.pack}. `;
  });
});

// Ver las fotos de la galería en grande.
document.querySelectorAll(".gallery img").forEach((img) => {
  img.addEventListener("click", () => {
    const box = document.createElement("div");
    box.className = "lightbox";
    box.innerHTML = `<img src="${img.src}" alt="${img.alt}">`;
    box.addEventListener("click", () => box.remove());
    document.body.appendChild(box);
  });
});

// En la portada el menú se vuelve sólido al hacer scroll.
const nav = document.querySelector(".nav");
const onScroll = () => nav.classList.toggle("solid", window.scrollY > 40);
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();
