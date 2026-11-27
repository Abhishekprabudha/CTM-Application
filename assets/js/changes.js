/* Pain point 1: changes, exchanges, cancellations and disruption handling. */
(() => {
  const { $, $$, esc } = App, D = App.D;
  const STG = ["Understand", "Booking", "Fare rules", "Policy", "Options", "Approve", "Execute", "Reply"];
  let busy = false;
  const st = id => App.S.cases[id];
  const stageIdx = s => [0, 5, 7, 8][s.stage];

  const listHTML = cur => D.cases.map(c => {
    const s = st(c.id), done = s.stage >= 3;
    return `<a class="li ${c.id === cur ? "sel" : ""} ${c.priority === "Urgent" && !done ? "urgent" : ""}" href="#/changes/${c.id}">
      ${App.avatar(c.traveller)}<div><div class="t1"><b>${esc(c.traveller)}</b><time>${c.id}</time></div><div class="t2">${esc(c.type)} · ${esc(App.client(c.client))}</div></div>
      <div class="tg">${done ? App.chip("Resolved", "s-ok") : s.stage === 2 ? App.chip("Reply ready", "s-info") : s.stage === 1 ? App.chip("Awaiting approval", "s-warn") : App.chip(c.priority, "p-" + c.priority)}</div></a>`;
  }).join("");

  function drawTL(el, c, withOpts) {
    const svg = el.querySelector("svg"), W = el.clientWidth, H = el.clientHeight; if (!W) return;
    const T0 = 4, T1 = 44, L = 110, R = 90, top = 24, bot = 22, X = h => L + (h - T0) / (T1 - T0) * (W - L - R);
    const rows = [...c.timeline.rows, ...(withOpts ? c.options.filter(o => o.tl).map(o => ({ n: `${o.k} · ${o.fl}`, d: o.tl.d, a: o.tl.a, c: o.best ? "#2148FB" : "#9AA9F5", b: o.best })) : [])];
    const rh = Math.min(30, (H - top - bot) / rows.length);
    const hh = h => (h >= 24 ? "4 Dec " : "") + String(Math.floor(h % 24)).padStart(2, "0") + ":" + String(Math.round((h % 1) * 60)).padStart(2, "0");
    let g = "";
    [6, 12, 18, 24, 30, 36, 42].forEach(h => { g += `<line x1="${X(h)}" x2="${X(h)}" y1="${top - 4}" y2="${H - bot}" stroke="#151A3C" stroke-opacity=".08"/><text x="${X(h)}" y="${H - 6}" font-size="11" text-anchor="middle" fill="#5B6286">${h === 24 ? "4 Dec" : (h % 24) + ":00"}</text>`; });
    rows.forEach((r, i) => { const y = top + i * rh + rh / 2; g += `<text x="${L - 10}" y="${y + 4}" font-size="12" text-anchor="end" fill="#151A3C" font-weight="${r.b ? 600 : 400}">${esc(r.n)}</text><rect x="${X(r.d)}" y="${y - 7}" width="${X(r.a) - X(r.d)}" height="14" rx="7" fill="${r.c}" fill-opacity="${r.x ? .35 : 1}"/>${r.x ? `<line x1="${X(r.d)}" x2="${X(r.a)}" y1="${y}" y2="${y}" stroke="#151A3C"/>` : ""}<text x="${X(r.a) + 6}" y="${y + 4}" font-size="11" fill="#5B6286">${hh(r.a)}${r.x ? " · cancelled" : ""}</text>`; });
    const m = c.timeline.meeting;
    g += `<line x1="${X(m)}" x2="${X(m)}" y1="${top - 4}" y2="${H - bot}" stroke="#E9A23B" stroke-width="2.5"/><rect x="${X(m) - 50}" y="0" width="100" height="18" rx="9" fill="#E9A23B"/><text x="${X(m)}" y="13" font-size="11" text-anchor="middle" fill="#1C2453" font-weight="600">Meeting 09:00</text>`;
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`); svg.innerHTML = g;
  }

  const ruleRows = list => list.map(r => `<div class="st"><span class="ok ${r[0] === "ok" ? "" : r[0]}">${r[0] === "ok" ? "✓" : "!"}</span><div>${esc(r[1])}</div><span class="meta" style="font-weight:600;color:${r[0] === "ok" ? "var(--green)" : "var(--amber)"}">${esc(r[2])}</span></div>`).join("");

  function optHTML(o, s) {
    const chosen = (s.chosen || "A") === o.k;
    return `<div class="opt ${chosen ? (s.stage >= 2 ? "chosen" : "best") : ""}" data-k="${o.k}"><span class="rk ${o.best ? "" : "g"}">${o.best ? "Recommended" : "Option " + o.k}</span>
      <h3>${esc(o.fl)} <small>${esc(o.cr)}</small></h3>
      ${o.dep ? `<div class="times"><div>${o.dep}<small>${o.from} · ${esc(o.day)}</small></div><i></i><div>${o.arr}<small>${o.to}</small></div></div>` : `<div style="height:10px"></div>`}
      <div class="facts"><div><span>Cost</span><span class="${o.costOk ? "g" : "a"}">${esc(o.cost)}</span></div><div><span>Basis</span><span>${esc(o.basis)}</span></div><div><span>Travel policy</span><span class="${o.polOk ? "g" : "a"}">${esc(o.pol)}</span></div>${o.extra ? `<div><span>Detail</span><span>${esc(o.extra)}</span></div>` : ""}</div>
      <div class="why">${esc(o.why)}</div></div>`;
  }

  function analysisHTML(c, s) {
    return `<div class="grid2 reveal">
      <div class="card"><div class="ct">Booking ${c.pnr} <small>Amadeus</small></div><div class="pnr mono">${c.pnrLines.map(l => `<span class="${l[0]}">${esc(l[1])}</span>`).join("\n")}</div>
        ${c.conflict ? `<div class="callout cb-bad" style="margin-top:12px"><span class="ok bad">!</span><div><b>Conflict:</b> ${esc(c.conflict)}</div></div>` : ""}
        ${c.timeline ? `<div class="fig" id="tl" style="margin-top:12px"><svg></svg></div>` : ""}</div>
      <div style="display:grid;gap:18px"><div class="card"><div class="ct">What the agent understood</div><dl class="kv">${c.understand.map(u => `<dt>${esc(u[0])}</dt><dd>${esc(u[1])}${u[2] ? ` <span class="lbl">· ${esc(u[2])}</span>` : ""}</dd>`).join("")}</dl></div>
        <div class="card"><div class="ct">Fare rules</div><div class="steps">${ruleRows(c.rules)}</div></div>
        <div class="card"><div class="ct">${esc(App.client(c.client))} travel policy</div><div class="steps">${ruleRows(c.policy)}</div></div></div></div>
      <div class="card reveal"><div class="ct">Options <small>Ranked by the servicing agent · click to choose another</small></div><div class="opts" id="opts">${c.options.map(o => optHTML(o, s)).join("")}</div>
        <div class="approve" style="margin-top:16px" id="apr">${s.stage >= 2 ? `<span class="ok">✓</span><div class="txt"><b>Approved by Olivia M.</b> Option ${s.chosen}: ${esc(c.options.find(o => o.k === s.chosen).fl)}.</div>` :
        `${App.avatar("Olivia M")}<div class="txt"><b>Your decision.</b> <span id="aprTxt">Agent recommends option A: ${esc(c.options[0].fl)}, ${esc(c.options[0].cost)}, ${esc(c.options[0].pol.toLowerCase())}.</span></div><button class="btn" id="bEsc">Escalate</button><button class="btn pri lg" id="bApprove">${App.icon("check")}Approve and execute</button>`}</div></div>`;
  }

  function replyHTML(c, s) {
    const r = c.reply;
    return `<div class="grid2 reveal"><div class="card"><div class="ct">Execution <small>${s.stage >= 2 ? "Completed " + esc(s.execAt || "") : ""}</small></div><div id="exe"><div class="steps">${c.tasks.map(t => `<div class="st"><span class="ok">✓</span><div><b>${esc(t[0])}</b><small>${esc(t[1])}</small></div><span class="meta"></span></div>`).join("")}</div></div>
      <div class="term mono" id="term" style="margin-top:12px">${c.tasks.map(t => `<span class="p">› </span>${esc(t[2])}`).join("\n")}</div></div>
      <div class="card"><div class="ct">Reply to ${esc(r.to)} <small>${s.stage >= 3 ? "Sent " + esc(s.sentAt) : "Drafted by agent · edit before sending"}</small></div>
        <div class="tabs" style="margin-bottom:12px"><button class="tab on" data-ch="mail">Email</button><button class="tab" data-ch="wa">WhatsApp</button></div>
        <div id="chMail"><p style="margin:0 0 8px"><b>Subject:</b> ${esc(r.subj)}</p><div class="msg">${esc(r.body[0])}\n\n${esc(r.body[1])}</div><div class="flight">${r.facts.map(f => `<div><span class="lbl">${esc(f[0])}</span><b>${esc(f[1])}</b></div>`).join("")}</div><div class="msg">${r.body.slice(2).map(esc).join("\n\n")}</div></div>
        <div id="chWa" class="hidden"><div class="wa">${esc(r.body[1])}\n\n${r.facts.map(f => `${esc(f[0])}: ${esc(f[1])}`).join("\n")}</div></div>
        <div class="row" style="margin-top:14px">${s.stage >= 3 ? App.chip("Sent to " + r.to, "s-ok") + App.chip(`Handled in ${c.handled} vs ~${c.manual} min manual`, "s-info") : `<button class="btn pri lg" id="bSend">${App.icon("send")}Send reply</button><button class="btn" id="bCopy">${App.icon("copy")}Copy</button>`}</div></div></div>`;
  }

  function workspace(c) {
    const s = st(c.id), em = c.email ? D.emails.find(e => e.id === c.email) : null;
    return `<div class="card"><div class="row" style="justify-content:space-between;align-items:flex-start">
        <div><div class="row">${App.chip(c.type, "c-chg")}${App.chip(c.priority, "p-" + c.priority)}<span class="lbl">${c.id} · PNR ${c.pnr}</span></div>
        <h2 style="font-size:22px;margin:10px 0 4px">${esc(c.traveller)} <span class="lbl" style="font-size:15px">${esc(c.role)}, ${esc(App.client(c.client))}</span></h2><div class="muted">${esc(c.summary)}</div></div>
        ${s.stage === 0 ? `<button class="btn pri lg" id="bRun">${App.icon("spark")}Run servicing agent</button>` : ""}</div>
        <div style="margin-top:14px">${App.stageBar(STG, stageIdx(s))}</div></div>
      <div class="grid2"><div class="card"><div class="ct">Request <small>${em ? esc(em.time) + " · email" : "Phone call logged by consultant"}</small></div>${em ? `<b>${esc(em.subj)}</b><div class="msg" style="margin-top:8px">${esc(em.body)}</div>` : `<div class="msg">"Our conference in Brisbane has been cancelled by the organiser. Please cancel my trip next week." Hannah Kirk, 07:20</div>`}</div>
        <div class="card"><div class="ct">Traveller</div><dl class="kv"><dt>Name</dt><dd>${esc(c.traveller)}</dd><dt>Client</dt><dd>${esc(App.client(c.client))} · ${esc(D.clients[c.client].tier)}</dd><dt>Profile</dt><dd>${esc(c.profile)}</dd><dt>Booking</dt><dd class="mono">${c.pnr}</dd></dl><div id="run" style="margin-top:12px"></div></div></div>
      <div id="ana">${s.stage >= 1 ? analysisHTML(c, s) : ""}</div><div id="rep">${s.stage >= 2 ? replyHTML(c, s) : ""}</div>`;
  }

  App.views.changes = {
    title: "Changes and disruption", crumb: "Exchanges, reissues, rerouting, cancellations, schedule changes and fare rules",
    render(id) {
      const c = D.cases.find(x => x.id === id) || D.cases[0];
      const open = D.cases.filter(x => st(x.id).stage < 3).length;
      return `<div class="tiles"><div class="tile"><span class="lbl">Open cases</span><b>${open}</b></div><div class="tile"><span class="lbl">Resolved this session</span><b>${D.cases.length - open}</b></div><div class="tile"><span class="lbl">Avg agent handling</span><b>2m 35s</b><div class="d up">vs ~23 min manual</div></div><div class="tile hl"><span class="lbl">Consultant decisions needed</span><b>${D.cases.filter(x => st(x.id).stage === 1).length}</b></div></div>
      <div class="ld" style="grid-template-columns:minmax(300px,.6fr) minmax(0,2fr)"><div class="card sticky" style="padding:8px"><div class="list">${listHTML(c.id)}</div></div><div style="display:grid;gap:18px" id="ws" data-id="${c.id}">${workspace(c)}</div></div>`;
    },
    mount(id) {
      const c = D.cases.find(x => x.id === id) || D.cases[0], s = st(c.id);
      const redraw = () => { $("#ws").innerHTML = workspace(c); bind(); };
      const bind = () => {
        const tl = $("#tl"); if (tl) { drawTL(tl, c, true); new ResizeObserver(() => drawTL(tl, c, true)).observe(tl); }
        const run = $("#bRun"); if (run) run.onclick = analyse;
        const opts = $("#opts"); if (opts && s.stage === 1) opts.onclick = ev => { const o = ev.target.closest(".opt"); if (!o) return; s.chosen = o.dataset.k; $$(".opt", opts).forEach(x => x.classList.toggle("best", x === o)); const op = c.options.find(x => x.k === s.chosen); $("#aprTxt").textContent = `You chose option ${op.k}: ${op.fl}, ${op.cost}, ${op.pol.toLowerCase()}.`; };
        const ap = $("#bApprove"); if (ap) ap.onclick = execute;
        const es = $("#bEsc"); if (es) es.onclick = () => { App.audit("changes", `Escalated ${c.id} to team leader`, "—", "Human", 0, { human: true }); App.toast("Escalated to the team leader queue"); };
        $$("#rep .tab").forEach(t => t.onclick = () => { $$("#rep .tab").forEach(x => x.classList.toggle("on", x === t)); $("#chMail").classList.toggle("hidden", t.dataset.ch !== "mail"); $("#chWa").classList.toggle("hidden", t.dataset.ch !== "wa"); });
        const sd = $("#bSend"); if (sd) sd.onclick = () => { s.stage = 3; s.sentAt = App.now().slice(0, 5); App.audit("changes", `Sent confirmation to ${c.reply.to}`, "—", "Human", 0, { human: true }); App.done(c.manual); const em = App.S.emails.find(e => e.id === c.email); if (em) { em.status = "replied"; em.sentAt = s.sentAt; } App.toast(`${c.id} resolved and confirmation sent`); App.route(); };
        const cp = $("#bCopy"); if (cp) cp.onclick = () => App.copy(`${c.reply.subj}\n\n${c.reply.body.join("\n\n")}`);
      };
      async function analyse() {
        if (busy) return; busy = true; $("#bRun").disabled = true;
        await App.run($("#run"), [
          { t: "Read the request", sub: c.understand[0][1], ms: 700, model: "Intent classifier", conf: c.understand[0][2] || "96%", cost: 0.001 },
          { t: `Retrieved booking ${c.pnr} from Amadeus`, sub: "Segments, tickets and remarks", ms: 800, model: "Amadeus API" },
          { t: "Checked fare rules", sub: c.rules[0][1], ms: 900, model: "Fare rules RAG", conf: "96%", cost: 0.009 },
          { t: `Checked ${App.client(c.client)} policy`, sub: c.policy[0][1], ms: 800, model: "Policy RAG", conf: "99%", cost: 0.005 },
          { t: `Ranked ${c.options.length} options`, sub: "Cost, policy, arrival and traveller preferences", ms: 1000, model: "Reasoning LLM", conf: "94%", cost: 0.018 }
        ], "changes");
        s.stage = 1; s.chosen = "A"; busy = false; App.badges();
        App.toast("Options ready for your approval"); redraw();
        $("#ana").scrollIntoView({ behavior: "smooth", block: "start" });
      }
      async function execute() {
        if (busy) return; busy = true;
        const op = c.options.find(o => o.k === (s.chosen || "A"));
        App.audit("changes", `Approved option ${op.k} (${op.fl}) for ${c.id}`, "—", "Human", 0, { human: true });
        $("#apr").innerHTML = `<span class="ok">✓</span><div class="txt"><b>Approved by Olivia M.</b> Executing option ${op.k}: ${esc(op.fl)}…</div>`;
        $("#rep").innerHTML = `<div class="card reveal"><div class="ct">Executing approved plan</div><div id="exe"></div><div class="term mono" id="term" style="margin-top:12px"></div></div>`;
        $("#rep").scrollIntoView({ behavior: "smooth", block: "start" });
        const term = $("#term");
        const steps = c.tasks.map(t => ({ t: t[0], sub: t[1], ms: 750, model: /amadeus|book|reissue|cancel|seat|rebook|revalidate|convert/i.test(t[0]) ? "Amadeus API" : "Mid-office API", extra: { reversible: true } }));
        const obs = new MutationObserver(() => { const n = $$("#exe .st:not(.wait)").length; term.innerHTML = c.tasks.slice(0, n).map(t => `<span class="p">› </span>${esc(t[2])}`).join("\n"); });
        obs.observe($("#exe"), { subtree: true, attributes: true });
        await App.run($("#exe"), steps, "changes");
        obs.disconnect();
        App.audit("changes", `Drafted confirmation for ${c.reply.to}`, "Reasoning LLM", "95%", 0.012);
        s.stage = 2; s.execAt = App.now().slice(0, 5); busy = false; App.badges(); redraw();
        $("#rep").scrollIntoView({ behavior: "smooth", block: "start" });
      }
      bind();
    }
  };
})();
