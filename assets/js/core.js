/* Core: state, routing, audit log, agent step runner, shared UI helpers. */
(() => {
  const D = window.DATA;
  const App = (window.App = { views: {}, D });
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  Object.assign(App, { $, $$, esc });

  const P = 'fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"';
  const ICON = {
    home: `<svg viewBox="0 0 24 24" ${P}><path d="M3 12l9-8 9 8"/><path d="M5 10v10h14V10"/></svg>`,
    inbox: `<svg viewBox="0 0 24 24" ${P}><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>`,
    chg: `<svg viewBox="0 0 24 24" ${P}><path d="M2 16l20-6-3-3-7 2-5-4-2 1 3 5-4 1-2-2-1 1z"/></svg>`,
    pay: `<svg viewBox="0 0 24 24" ${P}><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20M6 15h4"/></svg>`,
    fin: `<svg viewBox="0 0 24 24" ${P}><path d="M5 3h10l4 4v14H5z"/><path d="M9 12h6M9 16h6M9 8h3"/></svg>`,
    kb: `<svg viewBox="0 0 24 24" ${P}><path d="M21 12a8 8 0 01-11.6 7.1L4 20l1-4.6A8 8 0 1121 12z"/><path d="M9 10h6M9 13.5h4"/></svg>`,
    audit: `<svg viewBox="0 0 24 24" ${P}><path d="M12 3l8 3v6c0 5-3.4 8-8 9-4.6-1-8-4-8-9V6z"/><path d="M8.5 12l2.5 2.5 4.5-5"/></svg>`,
    play: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>`,
    reset: `<svg viewBox="0 0 24 24" ${P}><path d="M3 12a9 9 0 109-9 9 9 0 00-6.4 2.6L3 8"/><path d="M3 3v5h5"/></svg>`,
    fast: `<svg viewBox="0 0 24 24" ${P}><path d="M4 6l8 6-8 6zM13 6l8 6-8 6z"/></svg>`,
    slow: `<svg viewBox="0 0 24 24" ${P}><path d="M7 6l10 6-10 6z"/></svg>`,
    check: `<svg viewBox="0 0 24 24" ${P}><path d="M5 12.5l4.5 4.5L19 7"/></svg>`,
    send: `<svg viewBox="0 0 24 24" ${P}><path d="M22 2L11 13M22 2l-7 20-4-9-9-4z"/></svg>`,
    plus: `<svg viewBox="0 0 24 24" ${P}><path d="M12 5v14M5 12h14"/></svg>`,
    down: `<svg viewBox="0 0 24 24" ${P}><path d="M12 4v12M6 11l6 6 6-6M4 20h16"/></svg>`,
    copy: `<svg viewBox="0 0 24 24" ${P}><rect x="8" y="8" width="13" height="13" rx="2"/><path d="M16 8V5a2 2 0 00-2-2H5a2 2 0 00-2 2v9a2 2 0 002 2h3"/></svg>`,
    spark: `<svg viewBox="0 0 24 24" ${P}><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M6 18l2.5-2.5M15.5 8.5L18 6"/></svg>`
  };
  App.icon = n => ICON[n] || "";

  /* ---------- state ---------- */
  const fresh = () => ({
    emails: D.emails.map(e => ({ ...e, intent: null, status: "new" })),
    triaged: false,
    cases: Object.fromEntries(D.cases.map(c => [c.id, { stage: 0, chosen: null }])),
    pays: Object.fromEntries(D.payments.map(p => [p.id, { stage: 0 }])),
    tx: Object.fromEntries(D.uninvoiced.map(t => [t.id, "pending"])),
    reconRun: false,
    rf: Object.fromEntries(D.refunds.map(r => [r.id, r.status])),
    chased: false,
    chat: [],
    audit: D.auditSeed.map(a => ({ time: a[0], module: a[1], agent: a[2], action: a[3], model: a[4], conf: a[5], cost: a[6] })),
    handled: 0, minutesSaved: 0
  });
  App.S = fresh();
  App.speed = 1;

  const T0 = Date.now(), BASE = 7 * 3600 + 38 * 60;
  App.now = () => { const s = BASE + Math.floor((Date.now() - T0) / 1000); return [Math.floor(s / 3600), Math.floor(s / 60) % 60, s % 60].map(x => String(x).padStart(2, "0")).join(":"); };
  App.sleep = ms => new Promise(r => setTimeout(r, ms * App.speed));
  App.client = k => (D.clients[k] ? D.clients[k].name : "");
  App.money = (n, c = "A$") => c + Number(n).toLocaleString("en-AU", { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 });
  const AGENT_OF = { triage: "Triage agent", changes: "Servicing agent", payments: "Payments agent", recon: "Reconciliation agent", assist: "Assist agent" };
  App.agentOf = m => AGENT_OF[m] || "Agent";

  App.audit = (module, action, model = "—", conf = "—", cost = 0, extra = {}) => {
    App.S.audit.push({ time: App.now(), module, agent: extra.human ? "Olivia M., consultant" : App.agentOf(module), action, model, conf, cost, ...extra });
    App.badges();
  };
  App.done = (minutes) => { App.S.handled++; App.S.minutesSaved += minutes || 0; };

  App.toast = (msg, kind = "") => {
    const t = document.createElement("div");
    t.className = "toast";
    t.innerHTML = `<span class="ok ${kind}">${kind === "warn" ? "!" : "✓"}</span><div>${esc(msg)}</div>`;
    $("#toasts").appendChild(t);
    setTimeout(() => { t.style.transition = "opacity .4s"; t.style.opacity = "0"; setTimeout(() => t.remove(), 400); }, 3600);
  };

  /* steps: [{t, sub, ms, kind, model, conf, cost}] — renders a live checklist and writes each step to the audit log */
  App.run = async (el, steps, module) => {
    el.innerHTML = `<div class="steps">${steps.map((s, i) => `<div class="st wait"><span class="ok idle">${i + 1}</span><div><b>${esc(s.t)}</b><small>${esc(s.sub || "")}</small></div><span class="meta"></span></div>`).join("")}</div>`;
    const rows = $$(".st", el);
    for (let i = 0; i < steps.length; i++) {
      const r = rows[i], s = steps[i], ok = $(".ok", r);
      r.classList.remove("wait"); ok.className = "ok run"; ok.textContent = "";
      await App.sleep(s.ms || 650);
      ok.className = "ok " + (s.kind || ""); ok.textContent = s.kind === "warn" || s.kind === "bad" ? "!" : "✓";
      $(".meta", r).textContent = s.conf && s.conf !== "—" ? `${s.conf} · ${App.now()}` : App.now();
      if (module && s.log !== false) App.audit(module, s.t, s.model || "—", s.conf || "—", s.cost || 0, s.extra || {});
    }
  };

  /* typed text into an element */
  App.type = async (el, text, cps = 160) => {
    el.textContent = "";
    const step = Math.max(1, Math.round(text.length / (cps * 1.2 * App.speed + 1)));
    for (let i = 0; i < text.length; i += step) { el.textContent = text.slice(0, i + step); await new Promise(r => setTimeout(r, 1000 / 60)); }
    el.textContent = text;
  };

  App.chip = (txt, cls = "") => `<span class="chip ${cls}">${esc(txt)}</span>`;
  App.stageBar = (names, cur) => `<div class="stages">${names.map((n, i) => `<span class="stg ${i < cur ? "done" : i === cur ? "on" : ""}"><i></i>${esc(n)}</span>`).join("")}</div>`;
  App.initials = n => n.replace(/[^A-Za-z ]/g, "").split(/\s+/).filter(Boolean).map(w => w[0]).slice(0, 2).join("").toUpperCase();
  const PAL = ["#E5484D", "#B77900", "#2148FB", "#7357E8", "#0B8E9B", "#13955D", "#4A5175"];
  App.color = n => PAL[[...String(n)].reduce((a, c) => a + c.charCodeAt(0), 0) % PAL.length];
  App.avatar = n => `<div class="av" style="background:${App.color(n)}">${esc(App.initials(n))}</div>`;

  App.modal = html => {
    const m = document.createElement("div");
    m.className = "modal"; m.innerHTML = `<div class="box" role="dialog" aria-modal="true">${html}</div>`;
    m.addEventListener("click", e => { if (e.target === m || e.target.closest("[data-close]")) m.remove(); });
    document.body.appendChild(m);
    const f = m.querySelector("input,textarea,button"); f && f.focus();
    return m;
  };
  App.copy = async txt => { try { await navigator.clipboard.writeText(txt); App.toast("Copied to clipboard"); } catch (e) { App.toast("Copy is blocked in this browser", "warn"); } };
  App.download = (name, text) => { const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([text], { type: "text/csv" })); a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500); };

  /* ---------- navigation ---------- */
  const NAV = [
    ["home", "Command centre", "home"],
    ["h", "Pain points"],
    ["inbox", "Email and enquiry triage", "inbox"],
    ["changes", "Changes and disruption", "chg"],
    ["payments", "Payments and VCC", "pay"],
    ["recon", "Invoices and refunds", "fin"],
    ["assist", "Consultant assist", "kb"],
    ["h", "Governance"],
    ["audit", "UniStack audit", "audit"]
  ];
  App.counts = () => {
    const S = App.S;
    return {
      inbox: S.triaged ? S.emails.filter(e => e.status === "new" && e.intent && !e.intent.noAction).length : S.emails.filter(e => e.status === "new").length,
      changes: D.cases.filter(c => S.cases[c.id].stage < 3).length,
      payments: D.payments.filter(p => S.pays[p.id].stage < 3).length,
      recon: S.reconRun ? D.uninvoiced.filter(t => S.tx[t.id] === "exception").length + D.refunds.filter(r => S.rf[r.id] === "overdue").length : D.uninvoiced.length
    };
  };
  App.badges = () => {
    const c = App.counts();
    for (const k in c) { const b = $(`#nav [data-v="${k}"] .cnt`); if (b) { b.textContent = c[k]; if (k === "changes" || k === "payments") b.classList.toggle("hot", c[k] > 0); } }
  };
  function drawNav(cur) {
    const c = App.counts();
    $("#nav").innerHTML = NAV.map(n => n[0] === "h" ? `<div class="navh">${n[1]}</div>` :
      `<a class="nav ${n[0] === cur ? "on" : ""}" data-v="${n[0]}" href="#/${n[0]}">${App.icon(n[2])}<span>${n[1]}</span>${c[n[0]] != null ? `<span class="cnt ${(n[0] === "changes" || n[0] === "payments") && c[n[0]] > 0 ? "hot" : ""}">${c[n[0]]}</span>` : ""}</a>`).join("");
  }
  App.route = () => {
    const h = location.hash.replace(/^#\/?/, "") || "home";
    const [v, ...p] = h.split("/").map(decodeURIComponent);
    const view = App.views[v] ? v : "home";
    const V = App.views[view];
    drawNav(view);
    $("#title").textContent = V.title;
    $("#crumb").textContent = V.crumb || "";
    const main = $("#main");
    main.innerHTML = `<div class="page fade-in">${V.render(...p)}</div>`;
    main.scrollTop = 0;
    V.mount && V.mount(...p);
  };
  App.go = h => { if (location.hash === h) App.route(); else location.hash = h; };

  App.start = () => {
    const sp = $("#bSpeed");
    const setSpeed = () => { sp.innerHTML = App.icon(App.speed < 1 ? "fast" : "slow"); sp.title = App.speed < 1 ? "Agent speed: fast (click for normal)" : "Agent speed: normal (click for fast)"; };
    sp.onclick = () => { App.speed = App.speed < 1 ? 1 : 0.35; setSpeed(); App.toast(App.speed < 1 ? "Agent speed: fast" : "Agent speed: normal"); };
    setSpeed();
    $("#bReset").innerHTML = App.icon("reset");
    $("#bReset").onclick = () => { App.S = fresh(); App.toast("Demo reset to the start of the morning"); App.go("#/home"); };
    const tick = () => { $("#clock").textContent = "Thu 3 Dec · " + App.now().slice(0, 5) + " AEDT"; };
    tick(); setInterval(tick, 5000);
    addEventListener("hashchange", App.route);
    App.route();
  };
})();
