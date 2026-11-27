/* Pain point 4: invoice, refund and transaction reconciliation. */
(() => {
  const { $, $$, esc } = App, D = App.D;
  let busy = false;
  const S = () => App.S;
  const fee = t => App.money(t.fee);
  const txChip = s => ({ pending: App.chip("Uninvoiced", "s-mute"), scan: App.chip("Matching…", "s-info"), invoice: App.chip("Invoiced", "s-ok"), exception: App.chip("Exception", "s-bad") }[s]);
  const rfChip = s => ({ waiting: App.chip("Awaiting airline", "s-mute"), credit: App.chip("Credit received", "s-info"), overdue: App.chip("Overdue", "s-bad"), matched: App.chip("Matched, released", "s-ok"), chased: App.chip("Chased today", "s-warn"), ontrack: App.chip("On track", "s-ok") }[s]);
  const invNo = t => "INV-" + (26110 + D.uninvoiced.indexOf(t));

  function exceptions() {
    const out = [];
    D.uninvoiced.filter(t => S().tx[t.id] === "exception").forEach(t => out.push({ type: "Uninvoiced transaction", ref: t.id, client: App.client(t.client), amount: t.amount, owner: t.owner, action: t.action, detail: t.note, age: 30 - parseInt(t.date) + 3 }));
    D.refunds.filter(r => ["overdue", "chased"].includes(S().rf[r.id])).forEach(r => out.push({ type: "Refund overdue", ref: `${r.id} · ${r.ticket}`, client: App.client(r.client), amount: r.amount, owner: "CTM finance", action: S().rf[r.id] === "chased" ? "Chased airline today; follow up in 5 days" : "Chase airline", detail: `${r.airline}, filed ${r.filed}`, age: r.age }));
    if (App.S.pays["PX-305"].stage >= 2) out.push({ type: "Duplicate card charge", ref: "PX-305 · RB-20871", client: App.client("halcyon"), amount: 480, owner: "CTM finance", action: "Await hotel reversal; chase in 5 days", detail: "Riverside Hotel Brisbane charged VCC twice", age: 5 });
    return out;
  }

  const TABS = [["uninvoiced", "Uninvoiced transactions"], ["refunds", "Refunds"], ["report", "Exception report"]];

  function uninvoicedHTML() {
    const ran = S().reconRun, inv = D.uninvoiced.filter(t => S().tx[t.id] === "invoice"), ex = D.uninvoiced.filter(t => S().tx[t.id] === "exception");
    return `<div class="tiles"><div class="tile"><span class="lbl">November transactions checked</span><b>${ran ? 47 : 0}</b><div class="d">${ran ? "37 already matched earlier" : "Run the agent to check"}</div></div><div class="tile"><span class="lbl">Invoiced now</span><b>${inv.length}</b><div class="d">${ran ? App.money(inv.reduce((a, t) => a + t.amount + t.fee, 0)) : ""}</div></div><div class="tile"><span class="lbl">Exceptions for people</span><b>${ex.length}</b></div><div class="tile hl"><span class="lbl">Uninvoiced value</span><b id="uval">${App.money(D.uninvoiced.filter(t => S().tx[t.id] !== "invoice").reduce((a, t) => a + t.amount, 0))}</b></div></div>
    <div class="card"><div class="ct">Uninvoiced transactions <small>Mid-office · matched against bookings, supplier data and client contract fees</small></div>
      <div class="row" style="margin-bottom:12px"><span class="lbl" style="flex:1">${ran ? "Clean matches were invoiced automatically. Exceptions are routed to the right owner." : "10 November transactions have no invoice. Halcyon's accounts team has asked about three of them."}</span>
        <button class="btn pri lg" id="bRecon" ${ran ? "disabled" : ""}>${App.icon("spark")}${ran ? "Reconciliation complete" : "Run reconciliation agent"}</button></div>
      <div class="tscroll"><table><thead><tr><th>Transaction</th><th>Date</th><th>Traveller</th><th>Client</th><th>Item</th><th class="n">Amount</th><th class="n">Contract fee</th><th>Status</th><th>Agent note</th></tr></thead>
      <tbody>${D.uninvoiced.map(t => `<tr data-id="${t.id}"><td class="mono">${t.id}</td><td>${t.date}</td><td>${esc(t.traveller)}</td><td>${esc(App.client(t.client))}</td><td>${esc(t.item)}</td><td class="n">${App.money(t.amount)}</td><td class="n">${fee(t)}</td><td class="stc">${txChip(S().tx[t.id])}</td><td class="note lbl">${S().tx[t.id] === "invoice" ? esc(t.note) + " · " + invNo(t) : S().tx[t.id] === "exception" ? `<b style="color:var(--red)">${esc(t.note)}</b><br>${esc(t.action)}` : ""}</td></tr>`).join("")}</tbody></table></div>
      ${ran ? `<div class="row" style="margin-top:14px"><button class="btn" id="bSendInv">${App.icon("send")}Send corrected invoice to Halcyon AP</button><a class="btn" href="#/recon/report">Open exception report →</a></div>` : ""}</div>`;
  }

  function refundsHTML() {
    const ran = S().chased;
    const p = D.refunds.find(r => r.id === "RF-501");
    return `<div class="tiles"><div class="tile"><span class="lbl">Open refunds</span><b>${D.refunds.filter(r => !["matched"].includes(S().rf[r.id])).length}</b></div><div class="tile"><span class="lbl">Past 42-day target</span><b>${D.refunds.filter(r => r.age > r.sla).length}</b></div><div class="tile"><span class="lbl">Credits matched now</span><b>${D.refunds.filter(r => S().rf[r.id] === "matched").length}</b></div><div class="tile hl"><span class="lbl">Refund value outstanding</span><b>${App.money(D.refunds.filter(r => S().rf[r.id] !== "matched").reduce((a, r) => a + r.amount, 0))}</b></div></div>
    <div class="ld" style="grid-template-columns:minmax(0,2fr) minmax(300px,.9fr)"><div class="card"><div class="ct">Airline refunds <small>BSP refund applications and credits</small></div>
      <div class="row" style="margin-bottom:12px"><span class="lbl" style="flex:1">The agent matches airline credits to tickets, releases them to clients, and chases anything past the 42-day target.</span><button class="btn pri lg" id="bRef" ${ran ? "disabled" : ""}>${App.icon("spark")}${ran ? "Refunds processed" : "Run refund agent"}</button></div>
      <div class="tscroll"><table><thead><tr><th>Refund</th><th>Traveller</th><th>Airline</th><th>Ticket</th><th class="n">Amount</th><th>Filed</th><th>Age vs 42-day target</th><th>Status</th></tr></thead>
      <tbody>${D.refunds.map(r => `<tr data-id="${r.id}"><td class="mono">${r.id}</td><td style="min-width:140px">${esc(r.traveller)}<div class="lbl">${esc(App.client(r.client))}</div></td><td>${esc(r.airline)}</td><td class="mono">${r.ticket}</td><td class="n">${App.money(r.amount)}</td><td style="white-space:nowrap">${r.filed}</td>
        <td><div style="display:flex;align-items:center;gap:8px"><div style="flex:1;height:6px;border-radius:9px;background:var(--soft);min-width:80px"><div style="height:100%;border-radius:9px;width:${Math.min(100, r.age / 56 * 100)}%;background:${r.age > r.sla ? "var(--red)" : "var(--blue)"}"></div></div><span class="lbl" style="white-space:nowrap">${r.age} d</span></div></td><td class="stc">${rfChip(S().rf[r.id])}</td></tr>`).join("")}</tbody></table></div></div>
      <div class="card"><div class="ct">${ran ? "Chaser sent to Malaysia Airlines" : "Traveller asking: Priya Raman"}</div>${ran ? `<div class="msg">Subject: Refund overdue, ticket ${p.ticket}\n\nDear Refunds team,\n\nThe refund application for ticket ${p.ticket} (${App.money(p.amount)}) was submitted on ${p.filed} and is now ${p.age} days old. Please confirm the processing status and expected credit date.\n\nKind regards,\nCTM Finance</div>
        <div class="callout cb-ok" style="margin-top:12px"><span class="ok">✓</span><div><b>Priya updated.</b> Reply drafted in the inbox with the filed date, amount and chase.</div></div>` :
        `<div class="msg">"Following up on the refund for my cancelled October trip to London (ticket ${p.ticket}). It has been more than six weeks."</div><div class="callout cb-info" style="margin-top:12px"><span class="ok idle">i</span><div>Run the refund agent to chase overdue refunds and update the traveller.</div></div>`}</div></div>`;
  }

  function reportHTML() {
    const ex = exceptions(), total = ex.reduce((a, e) => a + e.amount, 0);
    const oldest = ex.reduce((a, e) => Math.max(a, e.age), 0);
    return `<div class="card"><div class="row" style="justify-content:space-between;align-items:flex-start"><div><div class="lbl">Exception report · generated ${App.now().slice(0, 5)} AEDT, Thu 3 Dec</div>
      <h2 style="font-size:26px;margin:6px 0">${ex.length ? `${ex.length} exceptions worth ${App.money(total)} need an owner's action` : "No open exceptions yet"}</h2>
      <div class="muted">${ex.length ? `Oldest item is ${oldest} days. Clean matches were invoiced automatically and are not listed.` : "Run the reconciliation and refund agents to build the report."}</div></div>
      <div class="row"><button class="btn" id="bCsv" ${ex.length ? "" : "disabled"}>${App.icon("down")}Export CSV</button><button class="btn" id="bCopyR" ${ex.length ? "" : "disabled"}>${App.icon("copy")}Copy summary</button></div></div></div>
      ${ex.length ? `<div class="card"><div class="tscroll"><table><thead><tr><th>Type</th><th>Reference</th><th>Client</th><th class="n">Amount</th><th>Detail</th><th>Owner</th><th>Recommended action</th><th class="n">Age</th></tr></thead><tbody>
      ${ex.map(e => `<tr><td>${App.chip(e.type, e.type.startsWith("Refund") ? "s-warn" : "s-bad")}</td><td class="mono">${esc(e.ref)}</td><td>${esc(e.client)}</td><td class="n">${App.money(e.amount)}</td><td class="lbl">${esc(e.detail)}</td><td>${esc(e.owner)}</td><td>${esc(e.action)}</td><td class="n">${e.age} d</td></tr>`).join("")}</tbody></table></div></div>` : ""}`;
  }

  App.views.recon = {
    title: "Invoices and refunds", crumb: "Uninvoiced transactions, refund enquiries and exception reporting",
    render(tab = "uninvoiced") {
      if (!TABS.some(t => t[0] === tab)) tab = "uninvoiced";
      return `<div class="tabs">${TABS.map(t => `<a class="tab ${t[0] === tab ? "on" : ""}" href="#/recon/${t[0]}">${t[1]}${t[0] === "report" ? ` <span class="n">${exceptions().length}</span>` : ""}</a>`).join("")}</div>
      <div id="rv" style="display:grid;gap:18px">${{ uninvoiced: uninvoicedHTML, refunds: refundsHTML, report: reportHTML }[tab]()}</div>`;
    },
    mount(tab = "uninvoiced") {
      const b = $("#bRecon");
      if (b) b.onclick = async () => {
        if (busy) return; busy = true; b.disabled = true;
        App.audit("recon", "Pulled 47 November transactions from mid-office", "Mid-office API");
        for (const t of D.uninvoiced) {
          const tr = $(`tr[data-id="${t.id}"]`); tr.querySelector(".stc").innerHTML = txChip("scan"); tr.classList.add("sel");
          await App.sleep(380);
          S().tx[t.id] = t.outcome; tr.classList.remove("sel");
          tr.querySelector(".stc").innerHTML = txChip(t.outcome);
          tr.querySelector(".note").innerHTML = t.outcome === "invoice" ? esc(t.note) + " · " + invNo(t) : `<b style="color:var(--red)">${esc(t.note)}</b><br>${esc(t.action)}`;
          App.audit("recon", t.outcome === "invoice" ? `Matched and invoiced ${t.id} (${invNo(t)})` : `Exception on ${t.id}: ${t.note}`, "Matching model", t.outcome === "invoice" ? "99%" : "97%", 0.002, t.outcome === "invoice" ? { reversible: true } : {});
        }
        S().reconRun = true; busy = false; App.badges();
        App.toast("Reconciliation done: 7 invoiced, 3 exceptions routed"); App.route();
      };
      const si = $("#bSendInv"); if (si) si.onclick = () => { App.audit("recon", "Sent corrected November invoice to Halcyon AP", "—", "Human", 0, { human: true }); App.done(40); App.toast("Corrected invoice sent to Halcyon Resources"); si.disabled = true; };
      const rb = $("#bRef");
      if (rb) rb.onclick = async () => {
        if (busy) return; busy = true; rb.disabled = true;
        for (const r of D.refunds) {
          const tr = $(`tr[data-id="${r.id}"]`); tr.classList.add("sel"); await App.sleep(420);
          const cur = S().rf[r.id], next = cur === "credit" ? "matched" : cur === "overdue" ? "chased" : "ontrack";
          S().rf[r.id] = next; tr.classList.remove("sel"); tr.querySelector(".stc").innerHTML = rfChip(next);
          App.audit("recon", next === "matched" ? `Matched airline credit to ${r.ticket}, released to ${App.client(r.client)}` : next === "chased" ? `Chased ${r.airline} for overdue refund ${r.ticket}` : `Refund ${r.ticket} on track`, next === "chased" ? "Reasoning LLM" : "Matching model", "98%", 0.002);
        }
        const pe = S().emails.find(e => e.id === "E-2006"); if (pe && !pe.intent) pe.intent = App.classify(pe);
        S().chased = true; busy = false; App.badges(); App.done(30);
        App.toast("Refunds processed: 2 matched, 2 chased, 2 on track"); App.route();
      };
      const csv = $("#bCsv");
      if (csv) csv.onclick = () => { const ex = exceptions(); const q = v => `"${String(v).replace(/"/g, '""')}"`; App.download("ctm-exception-report.csv", ["Type,Reference,Client,Amount AUD,Detail,Owner,Recommended action,Age days", ...ex.map(e => [e.type, e.ref, e.client, e.amount, e.detail, e.owner, e.action, e.age].map(q).join(","))].join("\n")); App.audit("recon", "Exported exception report", "—"); };
      const cr = $("#bCopyR");
      if (cr) cr.onclick = () => { const ex = exceptions(); App.copy(`CTM exception report, Thu 3 Dec\n${ex.map(e => `- ${e.type} ${e.ref} (${e.client}, ${App.money(e.amount)}): ${e.action} [${e.owner}]`).join("\n")}`); };
    }
  };
})();
