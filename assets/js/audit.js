/* UniStack audit: every agent and human action, with model, confidence, cost and roll back. */
(() => {
  const { $, $$, esc } = App, D = App.D;
  const MODS = [["all", "All"], ["triage", "Triage"], ["changes", "Changes"], ["payments", "Payments"], ["recon", "Reconciliation"], ["assist", "Assist"], ["human", "Human decisions"]];
  const MCH = { triage: ["Triage", "c-chg"], changes: ["Changes", "c-chg"], payments: ["Payments", "c-pay"], recon: ["Reconciliation", "c-fin"], assist: ["Assist", "c-kb"] };
  let f = "all";

  const rows = () => App.S.audit.map((a, i) => ({ ...a, i })).filter(a => f === "all" || (f === "human" ? a.human : a.module === f)).reverse();
  const table = () => `<table><thead><tr><th>Time</th><th>Actor</th><th>Area</th><th>Action</th><th>Model or system</th><th class="n">Confidence</th><th class="n">Cost A$</th><th></th></tr></thead><tbody>
    ${rows().map(a => `<tr style="${a.human ? "background:var(--greent)" : ""}${a.rolled ? ";opacity:.5" : ""}"><td class="mono lbl">${esc(a.time)}</td><td style="white-space:nowrap"><span class="dot ${a.human ? "human" : ""}" style="display:inline-block;margin:0 6px 0 0"></span>${esc(a.agent)}</td><td>${App.chip(...MCH[a.module])}</td><td>${a.rolled ? "<s>" : ""}${esc(a.action)}${a.rolled ? "</s> " + App.chip("Rolled back", "s-warn") : ""}</td><td class="lbl">${esc(a.model)}</td><td class="n">${esc(a.conf)}</td><td class="n">${a.cost ? a.cost.toFixed(3) : "—"}</td>
    <td>${a.reversible && !a.rolled ? `<button class="btn" data-rb="${a.i}" style="min-height:32px;padding:0 10px;font-size:12.5px">Roll back</button>` : ""}</td></tr>`).join("")}</tbody></table>`;

  App.views.audit = {
    title: "UniStack audit", crumb: "Every agent action logged, scored, costed and reversible",
    render() {
      const A = App.S.audit, agentActs = A.filter(a => !a.human), confs = agentActs.map(a => parseFloat(a.conf)).filter(x => !isNaN(x));
      const cost = A.reduce((s, a) => s + (a.cost || 0), 0);
      return `<div class="tiles"><div class="tile"><span class="lbl">Actions logged today</span><b>${A.length}</b></div><div class="tile"><span class="lbl">Human decisions</span><b>${A.filter(a => a.human).length}</b></div><div class="tile"><span class="lbl">Average agent confidence</span><b>${confs.length ? (confs.reduce((a, b) => a + b, 0) / confs.length).toFixed(1) : "—"}%</b></div><div class="tile hl"><span class="lbl">Model cost today</span><b>A$${cost.toFixed(2)}</b></div></div>
      <div class="card"><div class="row" style="justify-content:space-between;margin-bottom:12px"><div class="tabs" id="mf">${MODS.map(m => `<button class="tab ${m[0] === f ? "on" : ""}" data-m="${m[0]}">${m[1]}</button>`).join("")}</div><button class="btn" id="bExp">${App.icon("down")}Export log</button></div>
        <div class="tscroll" id="atab">${table()}</div></div>
      <div><h2 style="font-size:20px;margin:6px 0 12px">AI passports</h2><div class="passes">${D.agents.map(g => `<div class="card pass"><div class="ct"><span class="orb"></span>${esc(g.name)} <small>${g.ver}</small></div><div class="lbl" style="margin-bottom:10px">${esc(g.does)}</div><dl><dt>Models</dt><dd>${esc(g.models)}</dd><dt>Autonomy</dt><dd>${esc(g.autonomy)}</dd><dt>Last evaluation</dt><dd>${g.acc} · 27 Nov 2026</dd><dt>Data stays in</dt><dd>Australia</dd><dt>Actions today</dt><dd>${A.filter(a => a.module === g.id && !a.human).length}</dd></dl></div>`).join("")}</div></div>`;
    },
    mount() {
      const draw = () => { $("#atab").innerHTML = table(); };
      $("#mf").onclick = ev => { const b = ev.target.closest(".tab"); if (!b) return; f = b.dataset.m; $$("#mf .tab").forEach(x => x.classList.toggle("on", x === b)); draw(); };
      $("#atab").onclick = ev => {
        const b = ev.target.closest("[data-rb]"); if (!b) return;
        const a = App.S.audit[+b.dataset.rb];
        const m = App.modal(`<h2 style="font-size:20px">Roll back this action?</h2><p class="muted">${esc(a.action)}</p><div class="callout cb-warn"><span class="ok warn">!</span><div>The original state is restored and both actions stay on the record. In production this runs the reverse transaction in Amadeus, the card platform or mid-office.</div></div><div class="row" style="justify-content:flex-end;margin-top:16px"><button class="btn" data-close>Cancel</button><button class="btn pri" id="bConf">Roll back</button></div>`);
        $("#bConf").onclick = () => { a.rolled = true; App.audit(a.module, `Rolled back: ${a.action}`, "—", "Human", 0, { human: true }); m.remove(); App.toast("Action rolled back and logged"); App.route(); };
      };
      $("#bExp").onclick = () => { const q = v => `"${String(v ?? "").replace(/"/g, '""')}"`; App.download("unistack-audit-log.csv", ["Time,Actor,Area,Action,Model,Confidence,Cost AUD,Rolled back", ...App.S.audit.map(a => [a.time, a.agent, a.module, a.action, a.model, a.conf, a.cost || 0, a.rolled ? "yes" : ""].map(q).join(","))].join("\n")); };
    }
  };
})();
