/* Pain point 2: payment and virtual card exceptions. */
(() => {
  const { $, $$, esc } = App, D = App.D;
  const STG = ["Diagnose", "Recommend", "Approve", "Execute", "Notify"];
  let busy = false;
  const st = id => App.S.pays[id];
  const sevCls = { Urgent: "p-Urgent", High: "p-High", Normal: "p-Normal" };

  const list = cur => D.payments.map(p => {
    const s = st(p.id);
    return `<a class="li ${p.id === cur ? "sel" : ""} ${p.sev === "Urgent" && s.stage < 3 ? "urgent" : ""}" href="#/payments/${p.id}">
      ${App.avatar(p.supplier)}<div><div class="t1"><b>${esc(p.supplier)}</b><time>${p.id}</time></div><div class="t2">${esc(p.type)} · ${esc(p.traveller)}</div></div>
      <div class="tg">${s.stage >= 3 ? App.chip("Resolved", "s-ok") : s.stage === 2 ? App.chip("Message ready", "s-info") : s.stage === 1 ? App.chip("Awaiting approval", "s-warn") : App.chip(p.sev, sevCls[p.sev])}</div></a>`;
  }).join("");

  const checks = p => p.checks.map(c => `<div class="st"><span class="ok ${c[2] === "ok" ? "" : c[2]}">${c[2] === "ok" ? "✓" : "!"}</span><div><b>${esc(c[0])}</b><small>${esc(c[1])}</small></div><span class="meta"></span></div>`).join("");

  function detail(p) {
    const s = st(p.id);
    return `<div class="card"><div class="row" style="justify-content:space-between;align-items:flex-start"><div>
        <div class="row">${App.chip(p.type, "c-pay")}${App.chip(p.sev, sevCls[p.sev])}<span class="lbl">${p.id} · ${esc(p.ref)}</span></div>
        <h2 style="font-size:22px;margin:10px 0 4px">${esc(p.supplier)}</h2><div class="muted">${esc(p.traveller)} · ${esc(App.client(p.client))} · ${esc(p.amount)} · <b style="color:var(--red)">${esc(p.due)}</b></div></div>
        ${s.stage === 0 ? `<button class="btn pri lg" id="bRun">${App.icon("spark")}Run payments agent</button>` : ""}</div>
        <div style="margin-top:14px">${App.stageBar(STG, [0, 2, 4, 5][s.stage])}</div></div>
      <div class="grid2"><div class="card"><div class="ct">Signals checked <small>Card platform, booking, client billing profile</small></div><div id="chk">${s.stage >= 1 ? `<div class="steps">${checks(p)}</div>` : `<div class="lbl">The agent checks the card, the booking and ${esc(App.client(p.client))}'s billing rules.</div>`}</div></div>
        <div style="display:grid;gap:18px" id="diag">${s.stage >= 1 ? diagHTML(p, s) : ""}</div></div>
      <div id="exec">${s.stage >= 2 ? execHTML(p, s) : ""}</div>`;
  }
  const diagHTML = (p, s) => `<div class="card reveal"><div class="ct">Diagnosis <small>Payments agent · 97% confidence</small></div><div class="callout cb-warn"><span class="ok warn">!</span><div><b>Root cause.</b> ${esc(p.cause)}</div></div></div>
    <div class="card reveal"><div class="ct">Recommended fix</div><div class="callout cb-info"><span class="ok idle">→</span><div>${esc(p.fix)}</div></div>
      <div class="lbl" style="margin:12px 0 6px">Alternatives considered</div>${p.alts.map(a => `<div class="lbl">· ${esc(a)}</div>`).join("")}
      <div class="approve" style="margin-top:14px">${s.stage >= 2 ? `<span class="ok">✓</span><div class="txt"><b>Approved by Olivia M.</b></div>` : `${App.avatar("Olivia M")}<div class="txt"><b>Your decision.</b> Approve the fix and the agent carries it out.</div><button class="btn pri lg" id="bApprove">${App.icon("check")}Approve and execute</button>`}</div></div>`;
  const execHTML = (p, s) => `<div class="grid2 reveal"><div class="card"><div class="ct">Execution</div><div class="steps">${p.tasks.map(t => `<div class="st"><span class="ok">✓</span><div><b>${esc(t[0])}</b><small>${esc(t[1])}</small></div><span class="meta mono">${esc(t[2])}</span></div>`).join("")}</div></div>
    <div class="card"><div class="ct">Message to ${esc(p.msg.to)} <small>${s.stage >= 3 ? "Sent " + esc(s.sentAt) : "Drafted · edit before sending"}</small></div><p style="margin:0 0 8px"><b>Subject:</b> ${esc(p.msg.subj)}</p>
      <div class="field" style="margin:0"><textarea id="pmsg" ${s.stage >= 3 ? "disabled" : ""}>${esc(p.msg.body)}</textarea></div>
      <div class="row" style="margin-top:12px">${s.stage >= 3 ? App.chip("Sent", "s-ok") + App.chip("Exception closed", "s-ok") : `<button class="btn pri lg" id="bSend">${App.icon("send")}Send and close</button>`}</div></div></div>`;

  App.views.payments = {
    title: "Payments and VCC", crumb: "Card declines, VCC failures, missing payment details and hotel payment confirmations",
    render(id) {
      const p = D.payments.find(x => x.id === id) || D.payments[0];
      const open = D.payments.filter(x => st(x.id).stage < 3);
      return `<div class="tiles"><div class="tile"><span class="lbl">Open exceptions</span><b>${open.length}</b></div><div class="tile"><span class="lbl">Due today</span><b>${open.filter(x => /today/i.test(x.due)).length}</b></div><div class="tile"><span class="lbl">Auto-resolved overnight</span><b>23</b><div class="d up">VCC resends, guarantees, confirmations</div></div><div class="tile hl"><span class="lbl">Value at risk today</span><b>A$4,234</b></div></div>
      <div class="ld" style="grid-template-columns:minmax(300px,.6fr) minmax(0,2fr)"><div class="card sticky" style="padding:8px"><div class="list">${list(p.id)}</div></div><div style="display:grid;gap:18px" id="pws">${detail(p)}</div></div>`;
    },
    mount(id) {
      const p = D.payments.find(x => x.id === id) || D.payments[0], s = st(p.id);
      const redraw = () => { $("#pws").innerHTML = detail(p); bind(); };
      const bind = () => {
        const r = $("#bRun"); if (r) r.onclick = diagnose;
        const a = $("#bApprove"); if (a) a.onclick = execute;
        const sd = $("#bSend"); if (sd) sd.onclick = () => { s.stage = 3; s.sentAt = App.now().slice(0, 5); App.audit("payments", `Sent message to ${p.msg.to}, closed ${p.id}`, "—", "Human", 0, { human: true }); App.done(14); App.toast(`${p.id} resolved`); App.route(); };
      };
      async function diagnose() {
        if (busy) return; busy = true; $("#bRun").disabled = true;
        await App.run($("#chk"), p.checks.map(c => ({ t: c[0], sub: c[1], kind: c[2] === "ok" ? "" : c[2], ms: 550, model: /client|rule|profile|cap/i.test(c[0]) ? "Policy RAG" : "Card platform API", conf: "99%", cost: 0.001 })), "payments");
        App.audit("payments", `Diagnosed ${p.id}: ${p.type}`, "Reasoning LLM", "97%", 0.007);
        s.stage = 1; busy = false; App.badges(); redraw();
      }
      async function execute() {
        if (busy) return; busy = true;
        App.audit("payments", `Approved fix for ${p.id}`, "—", "Human", 0, { human: true });
        $("#exec").innerHTML = `<div class="card reveal"><div class="ct">Executing</div><div id="pexe"></div></div>`;
        $("#exec").scrollIntoView({ behavior: "smooth", block: "start" });
        await App.run($("#pexe"), p.tasks.map(t => ({ t: t[0], sub: t[1], ms: 800, model: /vcc|card|ticket|fop|guarantee/i.test(t[0]) ? "Card platform API" : "Supplier API", extra: { reversible: true } })), "payments");
        App.audit("payments", `Drafted message to ${p.msg.to}`, "Reasoning LLM", "95%", 0.004);
        s.stage = 2; busy = false; App.badges(); redraw();
        $("#exec").scrollIntoView({ behavior: "smooth", block: "start" });
      }
      bind();
    }
  };
})();
