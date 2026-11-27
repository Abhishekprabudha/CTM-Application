/* Pain point 5: knowledge and consultant assistance. Retrieval over an approved knowledge base, with sources. */
(() => {
  const { $, $$, esc } = App, D = App.D;
  const STOP = new Set("a an the is are am i my me we our you your can could do does did to of for on in at with and or be it this that what when how which who will would should there their they on by from as about any have has need".split(" "));
  const SYN = { bag: "baggage", bags: "baggage", luggage: "baggage", suitcase: "baggage", kg: "baggage", checked: "baggage", visa: "visa", entry: "visa", japan: "japan", tokyo: "japan", business: "business", class: "cabin", cabin: "cabin", fly: "flight", flying: "flight", flights: "flight", refund: "refund", refunds: "refund", credited: "refund", money: "refund", waiver: "waiver", moved: "schedule", rescheduled: "schedule", misspelt: "name", misspelled: "name", spelling: "name", typo: "name", spelt: "name", vcc: "vcc", virtual: "vcc", card: "card", declined: "declined", hotel: "hotel", weather: "disruption", storm: "disruption", stranded: "disruption", cancelled: "cancel", cancellation: "cancel", unused: "unused", credit: "credit", sq: "sq", singapore: "singapore", halcyon: "halcyon", brightline: "brightline", northgate: "northgate", change: "change", exchange: "change", date: "change" };
  const tok = s => String(s).toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter(w => w && !STOP.has(w)).map(w => SYN[w] || w.replace(/s$/, ""));
  const CLIENTS = new Set(["halcyon", "brightline", "northgate"]);
  const docs = D.kb.map(k => ({ k, t: new Set(tok(k.tags + " " + k.title)) }));
  const df = {}; docs.forEach(d => d.t.forEach(w => (df[w] = (df[w] || 0) + 1)));
  const idf = w => Math.log(1 + docs.length / (df[w] || 0.5));
  App.answer = q => {
    const qt = [...new Set(tok(q))];
    const scored = docs.map(d => ({ k: d.k, s: qt.reduce((a, w) => a + (d.t.has(w) ? idf(w) * (CLIENTS.has(w) ? 2.5 : 1) : 0), 0) })).sort((a, b) => b.s - a.s);
    const best = scored[0], max = qt.reduce((a, w) => a + idf(w), 0) || 1;
    const conf = Math.min(98, Math.round(55 + 45 * Math.min(1, best.s / Math.max(3.5, max * 0.55))));
    return best.s >= 2.2 ? { hit: best.k, conf, also: scored.slice(1, 3).filter(x => x.s >= Math.max(2.2, best.s * 0.6)).map(x => x.k) } : { hit: null, conf: 0, also: [] };
  };

  let busy = false;
  const bubble = m => m.me ? `<div class="bub me">${esc(m.q)}</div>` :
    m.a.hit ? `<div class="bub ai"><div class="ans">${esc(m.a.hit.answer)}</div><ul>${m.a.hit.points.map(p => `<li>${esc(p)}</li>`).join("")}</ul>
      <div class="srcs">${[m.a.hit, ...m.a.also].map(k => `<span class="src"><b>${k.id}</b> · ${esc(k.title)}</span>`).join("")}</div>
      <div class="row" style="margin-top:10px"><span class="chip s-ok">${m.a.conf}% confidence</span><span class="lbl">${esc(m.a.hit.src)}</span><span style="flex:1"></span><button class="btn" data-ins="${m.i}">${App.icon("copy")}Copy for reply</button></div></div>` :
      `<div class="bub ai"><div class="ans">I don't have an approved answer for that in the knowledge base, so I won't guess.</div><div class="row" style="margin-top:10px"><span class="chip s-warn">No approved source</span><button class="btn" data-route="1">Send to the policy team</button></div></div>`;

  App.views.assist = {
    title: "Consultant assist", crumb: "Answers on policy, fare rules, baggage and booking processes, with sources",
    render() {
      const chat = App.S.chat;
      return `<div class="ld" style="grid-template-columns:minmax(0,1.7fr) minmax(280px,.8fr)">
      <div class="card chat"><div class="msgs" id="msgs">${chat.length ? chat.map(bubble).join("") : `<div class="bub ai"><div class="ans">Hi Olivia. Ask me anything about client travel policies, fare rules, baggage, entry requirements or CTM procedures. I answer only from approved sources and show where each answer comes from.</div></div>
        <div class="sugg" id="sugg">${D.suggested.map(s => `<button>${esc(s)}</button>`).join("")}</div>`}</div>
        <form class="ask" id="ask"><input id="q" placeholder="Ask about a policy, fare rule, baggage or process…" autocomplete="off" aria-label="Question"><button class="btn pri lg" type="submit">${App.icon("send")}Ask</button></form></div>
      <div style="display:grid;gap:18px;align-content:start"><div class="card"><div class="ct">Active case</div><dl class="kv"><dt>Traveller</dt><dd>Sarah Chen</dd><dt>Client</dt><dd>Halcyon Resources</dd><dt>Booking</dt><dd class="mono">7KQ2LM</dd><dt>Case</dt><dd><a href="#/changes/CS-1042">CS-1042 schedule change</a></dd></dl></div>
        <div class="card"><div class="ct">Approved knowledge <small>${D.kb.length} sources</small></div><div style="display:grid;gap:8px">${D.kb.map(k => `<div style="font-size:13px"><b class="mono" style="font-size:11.5px;color:var(--muted)">${k.id}</b> ${esc(k.title)}<div class="lbl">${esc(k.src)}</div></div>`).join("")}</div>
        <div class="lbl" style="margin-top:12px">Sample content for this demo. In production this connects to CTM's policies, SOPs and supplier rules.</div></div></div></div>`;
    },
    mount() {
      const msgs = $("#msgs");
      const ask = async q => {
        q = q.trim(); if (!q) return; if (busy) { App.toast("One moment, still answering", "warn"); return; } busy = true;
        if (!App.S.chat.length) msgs.innerHTML = "";
        const me = { me: true, q }; App.S.chat.push(me); msgs.insertAdjacentHTML("beforeend", bubble(me));
        msgs.insertAdjacentHTML("beforeend", `<div class="bub ai" id="typing"><span class="typing"><i></i><i></i><i></i></span> <span class="lbl">Searching approved sources…</span></div>`);
        msgs.scrollTop = msgs.scrollHeight;
        await App.sleep(1100);
        const a = App.answer(q), m = { a, i: App.S.chat.length }; App.S.chat.push(m);
        $("#typing").remove(); msgs.insertAdjacentHTML("beforeend", bubble(m));
        const last = msgs.lastElementChild, ans = last.querySelector(".ans"), rest = [...last.children].filter(x => x !== ans);
        rest.forEach(x => x.style.visibility = "hidden");
        await App.type(ans, ans.textContent, 220);
        rest.forEach(x => { x.style.visibility = ""; x.classList.add("reveal"); });
        msgs.scrollTop = msgs.scrollHeight;
        App.audit("assist", a.hit ? `Answered: "${q.slice(0, 60)}" from ${a.hit.id}` : `No approved answer for: "${q.slice(0, 60)}"`, "Retrieval + LLM", a.hit ? a.conf + "%" : "—", 0.004);
        if (a.hit) App.done(5);
        busy = false;
      };
      $("#ask").onsubmit = ev => { ev.preventDefault(); const v = $("#q").value; $("#q").value = ""; ask(v); };
      msgs.onclick = ev => {
        const s = ev.target.closest("#sugg button"); if (s) { ask(s.textContent); return; }
        const ins = ev.target.closest("[data-ins]"); if (ins) { const m = App.S.chat[+ins.dataset.ins]; App.copy(`${m.a.hit.answer}\n\n${m.a.hit.points.join("\n")}`); return; }
        const r = ev.target.closest("[data-route]"); if (r) { r.disabled = true; App.audit("assist", "Routed unanswered question to the policy team", "—", "Human", 0, { human: true }); App.toast("Sent to the policy team"); }
      };
      msgs.scrollTop = msgs.scrollHeight;
      $("#q").focus();
    }
  };
})();
