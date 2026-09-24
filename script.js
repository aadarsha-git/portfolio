/* ========= EDIT HERE: change image file paths, WhatsApp number and testimonials ========= */
const CONFIG = {
  whatsapp: "9779749366229", 
  // Each group lives in its own folder next to index.html. Below, only type the file names.
  folders: { hero: "heroimages/", clients: "clients/", featured: "featured/", about: "about-me/", testimonials: "testimonials/", welcome: "" },
  welcome: "namskar.png",
  about: ["aadarsha flower.png", "image2.png"],
  // Replace these generated lists with your own, e.g. ["poster1.png", "poster2.png"]
  heroImages: Array.from({ length: 12 }, (_, i) => `image${i + 1}.png`),
  clientLogos: Array.from({ length: 8 }, (_, i) => `image${i + 1}.png`),
  featured: Array.from({ length: 9 }, (_, i) => `image${i + 1}.png`),
  testimonials: [
    { img: "image1.png", name: "Client Name", text: "Replace this with your first client's testimonial." },
    { img: "image2.png", name: "Client Name", text: "Replace this with your second client's testimonial." },
    { img: "image3.png", name: "Client Name", text: "Replace this with your third client's testimonial." },
    { img: "image4.png", name: "Client Name", text: "Replace this with your fourth client's testimonial." }
  ]
};
const P = (group, file) => CONFIG.folders[group] + file;


const $ = s => document.querySelector(s);
const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
const mk = (src, alt = "") => {
  const i = new Image(); i.src = src; i.alt = alt; i.loading = "lazy";
  i.onerror = () => { i.removeAttribute("src"); i.style.background = `hsl(${(src.length * 47 + src.charCodeAt(5) * 13) % 360} 25% 20%)`; };
  return i;
};

/* Headline: split into words for the entrance */
const h = $("#headline");
h.setAttribute("aria-label", h.textContent);
h.innerHTML = h.textContent.split(" ").map((w, i) => `<span class="w" aria-hidden="true"><span style="--i:${i}">${w}</span></span>`).join(" ");

/* Kinetic hero gallery: rows drift in opposite directions and react to scroll speed and mouse */
const kin = $("#kinetic"), rows = [];
for (let r = 0; r < 4; r++) {
  const el = document.createElement("div"); el.className = "krow";
  const list = CONFIG.heroImages.slice(r * 2).concat(CONFIG.heroImages.slice(0, r * 2));
  for (let k = 0; k < 4; k++) list.forEach(s => el.append(mk(P("hero", s))));
  kin.append(el);
  rows.push({ el, x: 0, dir: r % 2 ? 1 : -1, speed: .45 + r * .18 });
}
let vel = 0, lastY = scrollY, mx = 0, tmx = 0;
addEventListener("mousemove", e => { tmx = e.clientX / innerWidth - .5; glow.style.transform = `translate(${e.clientX}px,${e.clientY}px)`; });
const glow = $("#glow");
function tick() {
  vel += (Math.max(-60, Math.min(60, scrollY - lastY)) - vel) * .1; lastY = scrollY;
  mx += (tmx - mx) * .05;
  rows.forEach(r => {
    const w = r.el.scrollWidth / 4; // one copy of the set
    r.x += r.dir * (r.speed + Math.abs(vel) * .25);
    if (r.x <= -w) r.x += w; if (r.x > 0) r.x -= w;
    r.el.style.transform = `translateX(${r.x - mx * r.dir * 80}px) skewX(${-vel * .35}deg)`;
  });
  requestAnimationFrame(tick);
}
if (!still) tick();

/* Client logo marquee (duplicated for a seamless loop) */
const track = $("#clients");
const cl = CONFIG.clientLogos, reps = Math.max(1, Math.ceil(innerWidth / (cl.length * 118)));
for (let k = 0; k < reps * 2; k++) cl.forEach(s => track.append(mk(P("clients", s))));

/* Featured grid with 3D tilt */
CONFIG.featured.forEach(s => {
  const c = document.createElement("div"); c.className = "card reveal"; c.append(mk(P("featured", s), "Featured design"));
  c.addEventListener("mousemove", e => {
    const b = c.getBoundingClientRect(), x = (e.clientX - b.left) / b.width - .5, y = (e.clientY - b.top) / b.height - .5;
    c.style.transform = `perspective(700px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) scale(1.03)`;
  });
  c.addEventListener("mouseleave", () => c.style.transform = "");
  $("#grid").append(c);
});

/* Testimonials: 2 at a time, auto-slide every 7s, paused while hovered */
const tt = $("#ttrack"), dots = $("#tdots"), tv = $("#tview");
CONFIG.testimonials.forEach(t => {
  const s = document.createElement("div"); s.className = "tslide";
  const c = document.createElement("div"); c.className = "tcard";
  const p = document.createElement("p"); p.textContent = t.text;
  const b = document.createElement("b"); b.textContent = t.name;
  c.append(mk(P("testimonials", t.img), t.name), p, b); s.append(c); tt.append(s);
});
let page = 0, pages = 1, hover = false, timer;
function go(i) {
  page = i; tt.style.transform = `translateX(-${i * 100}%)`;
  [...dots.children].forEach((d, j) => d.classList.toggle("on", j === i));
  clearTimeout(timer); if (!still) timer = setTimeout(next, 7000);
}
function next() { hover ? go(page) : go((page + 1) % pages); }
function layout() {
  const pv = innerWidth < 760 ? 1 : 2;
  pages = Math.ceil(CONFIG.testimonials.length / pv);
  tt.style.setProperty("--pv", pv); dots.innerHTML = "";
  for (let i = 0; i < pages; i++) { const d = document.createElement("button"); d.setAttribute("aria-label", "Show testimonials " + (i + 1)); d.onclick = () => go(i); dots.append(d); }
  go(Math.min(page, pages - 1));
}
["mouseenter", "focusin"].forEach(ev => tv.addEventListener(ev, () => hover = true));
["mouseleave", "focusout"].forEach(ev => tv.addEventListener(ev, () => hover = false));
addEventListener("resize", layout); layout();

/* Scroll reveal */
const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: .15 });
document.querySelectorAll(".reveal").forEach((el, i) => { el.style.transitionDelay = (i % 3) * 90 + "ms"; io.observe(el); });

/* Nav state and scroll progress */
addEventListener("scroll", () => {
  $("#nav").classList.toggle("solid", scrollY > 40);
  $("#progress").style.transform = `scaleX(${scrollY / (document.body.scrollHeight - innerHeight)})`;
}, { passive: true });

/* Magnetic buttons */
if (!still) document.querySelectorAll(".magnet").forEach(b => {
  b.addEventListener("mousemove", e => { const r = b.getBoundingClientRect(); b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .2}px,${(e.clientY - r.top - r.height / 2) * .3}px)`; });
  b.addEventListener("mouseleave", () => b.style.transform = "");
});

/* Contact form opens WhatsApp with the message filled in */
$("#form").addEventListener("submit", e => {
  e.preventDefault();
  const f = new FormData(e.target), err = $("#err");
  if (!f.get("name").trim() || !f.get("phone").trim() || !f.get("service")) { err.textContent = "Please fill in your name, WhatsApp number and what you want."; return; }
  err.textContent = "";
  const text = `Hi Aadarsha, I'm ${f.get("name")}.\nService: ${f.get("service")}\nChannel/Brand: ${f.get("brand") || "-"}\nMy WhatsApp: ${f.get("phone")}\nMessage: ${f.get("msg") || "-"}`;
  open(`https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(text)}`, "_blank");
});

$("#yr").textContent = new Date().getFullYear();

/* About photos */
["#about1", "#about2"].forEach((id, i) => { const im = $(id); im.onerror = () => im.removeAttribute("src"); im.src = P("about", CONFIG.about[i]); });

/* Welcome character: centered on load, shrinks and docks at the side when closed */
const wel = $("#welcome"), veil = $("#veil");
$("#wimg").src = P("welcome", CONFIG.welcome);
document.documentElement.style.overflow = "hidden";
function closeWelcome() { wel.classList.add("dock"); veil.classList.add("off"); document.documentElement.style.overflow = ""; }
$("#wclose").onclick = closeWelcome; veil.onclick = closeWelcome;
addEventListener("keydown", e => { if (e.key === "Escape" && !wel.classList.contains("dock")) closeWelcome(); });
$("#wclose").focus();