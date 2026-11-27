/* Pain point 3: email and enquiry triage. Rule-based intent engine runs live in the browser. */
(() => {
  const { $, $$, esc } = App, D = App.D;
  const PRI = { Urgent: 0, High: 1, Normal: 2, Low: 3 };

  App.classify = e => {
    const raw = `${e.subj}\n${e.body}`, t = raw.toLowerCase();
    const has = re => re.test(t);
    let r;
    if (e.dupOf) r = { key: "dup", label: "Schedule change", cls: "chg", pri: "Normal", conf: 99, module: "changes", merged: true };
    else if (has(/automatic reply|out of (the )?office/)) r = { key: "auto", label: "Auto-reply", cls: "none", noAction: true, conf: 99 };
    else if (has(/unsubscribe|webinar|newsletter|lounge updates/)) r = { key: "news", label: "Newsletter", cls: "none", noAction: true, conf: 98 };
    else if (has(/booking confirmed|pleased to confirm|automated confirmation/)) r = { key: "conf", label: "Confirmation", cls: "none", noAction: true, conf: 97 };
    else if (has(/weather|storm|stranded|stuck|irops|diverted/) && has(/cancel|delay|stuck|divert/)) r = { key: "irops", label: "Disruption", cls: "chg", pri: "Urgent", conf: 98, module: "changes" };
    else if (has(/schedule change|moved my flight|put me on|re-?protect|retimed/)) r = { key: "sc", label: "Schedule change", cls: "chg", pri: has(/urgent|today|tonight|tomorrow|asap/) ? "Urgent" : "High", conf: 97, module: "changes" };
    else if (has(/declined|virtual card|\bvcc\b|guarantee|form of payment|payment|charged twice|duplicate charge/)) r = { key: "pay", label: "Payment exception", cls: "pay", pri: has(/expire|today|12:00|check-in/) ? (has(/ticket|fare/) ? "Urgent" : "High") : "Normal", conf: 96, module: "payments" };
    else if (has(/refund/)) r = { key: "refund", label: "Refund enquiry", cls: "fin", pri: "Normal", conf: 95, module: "recon" };
    else if (has(/invoice|statement|missing from|reconcil|billing/)) r = { key: "inv", label: "Reconciliation", cls: "fin", pri: "Normal", conf: 94, module: "recon" };
    else if (has(/please cancel|cancel my|cancel the|no longer travelling/)) r = { key: "cxl", label: "Cancellation", cls: "chg", pri: "Normal", conf: 95, module: "changes" };
    else if (has(/move my|instead of|fly back|bring forward|change my (flight|date)|different (day|date)|earlier flight|later flight/)) r = { key: "exch", label: "Exchange request", cls: "chg", pri: has(/today|tonight|urgent/) ? "High" : "Normal", conf: 95, module: "changes" };
    else if (has(/visa|baggage|bags|allowance|policy|can i book|allowed|passport|lounge access/)) r = { key: "kb", label: "Policy and knowledge", cls: "kb", pri: "Low", conf: 93, module: "assist" };
    else r = { key: "gen", label: "General enquiry", cls: "kb", pri: "Normal", conf: 71, module: null };
    const ent = [];
    const pnr = raw.match(/\b(?=[A-Z0-9]*\d)(?=[A-Z0-9]*[A-Z])[A-Z0-9]{6}\b/); if (pnr) ent.push(["Booking ref", pnr[0]]);
    const tk = raw.match(/\b\d{3}-\d{10}\b/); if (tk) ent.push(["Ticket", tk[0]]);
    const res = raw.match(/\b[A-Z]{2}-\d{5}\b/); if (res) ent.push(["Reservation", res[0]]);
    const fl = raw.match(/\b(QF|VA|SQ|NZ|BA|JQ|MH|EK)\s?\d{1,4}\b/); if (fl) ent.push(["Flight", fl[0]]);
    const when = raw.match(/\b(today|tonight|tomorrow|(mon|tues|wednes|thurs|fri|satur|sun)day|\d{1,2} (dec|december|jan|january))\b/i); if (when) ent.push(["When", when[0]]);
    const dest = raw.match(/\b(Singapore|Sydney|Melbourne|Auckland|Tokyo|Japan|London|Perth|Brisbane)\b/); if (dest) ent.push(["Place", dest[0]]);
    r.entities = ent;
    return r;
  };

  const first = n => n.split(/[\s,]+/)[0];
  App.draftFor = e => {
    const i = e.intent, f = first(e.from);
    switch (i && i.key) {
      case "sc": case "irops": return `Hi ${f},\n\nThanks for letting us know. We're on it: we've already found options that get you there in time and will confirm your new flight within the next few minutes.\n\nKind regards,\nOlivia, CTM`;
      case "exch": return `Hi ${f},\n\nNo problem. We've checked your fare rules and there are Friday afternoon options available. We'll confirm the change and any fare difference shortly.\n\nCheers,\nOlivia, CTM`;
      case "cxl": return `Hi ${f},\n\nWe'll cancel the booking and check your fare rules for any refund or travel credit. We'll confirm shortly.\n\nKind regards,\nOlivia, CTM`;
      case "pay": return `Dear ${e.from},\n\nThank you. We're updating the form of payment now and will confirm as soon as it's done.\n\nKind regards,\nCTM Servicing`;
      case "refund": {
        const tk = (e.intent.entities.find(x => x[0] === "Ticket") || [])[1];
        const rf = D.refunds.find(x => x.ticket === tk);
        if (rf) return `Hi ${f},\n\nThanks for following up. The refund of ${App.money(rf.amount)} for ticket ${rf.ticket} was filed with ${rf.airline} on ${rf.filed}. It is now ${rf.age} days old, past our 42-day target, so we've chased the airline today. We'll update you as soon as the credit arrives.\n\nKind regards,\nOlivia, CTM`;
        return `Hi ${f},\n\nThanks for following up. We're checking the refund status with the airline and will update you today.\n\nKind regards,\nOlivia, CTM`;
      }
      case "inv": return `Hi,\n\nThanks for flagging this. We've found the November transactions and are matching them to bookings now. We'll send a corrected invoice today and let you know if anything needs your input.\n\nKind regards,\nCTM Billing`;
      case "kb": { const a = App.answer ? App.answer(e.body) : null; return `Hi ${f},\n\n${a && a.hit ? a.hit.answer + "\n\n" + a.hit.points[0] : "Good question. We'll confirm the details and come back to you shortly."}\n\nKind regards,\nOlivia, CTM`; }
      default: return `Hi ${f},\n\nThanks for your email. A consultant will reply shortly.\n\nKind regards,\nCTM`;
    }
  };

  let sel = null, tab = "all", busy = false;
  const S = () => App.S;
  const ordered = () => {
    const es = [...S().emails];
    if (!S().triaged) return es;
    return es.sort((a, b) => {
      const g = e => e.status === "filtered" ? 3 : e.status === "merged" ? 2 : e.status === "replied" ? 1 : 0;
      return g(a) - g(b) || (PRI[a.intent?.pri] ?? 9) - (PRI[b.intent?.pri] ?? 9) || b.time.localeCompare(a.time);
    });
  };
  const visible = () => ordered().filter(e => tab === "all" || (tab === "act" ? e.status === "new" || e.status === "replied" : e.status === "filtered" || e.status === "merged"));

  const rowHTML = e => {
    const i = e.intent;
    const tags = i ? `${App.chip(i.label, "c-" + i.cls)}${i.noAction ? App.chip("No action", "s-mute") : i.merged ? App.chip("Merged", "s-mute") : App.chip(i.pri, "p-" + i.pri)}` : "";
    return `<div class="li ${e.id === sel ? "sel" : ""} ${e.status === "filtered" || e.status === "merged" ? "dim" : ""} ${i && i.pri === "Urgent" && e.status === "new" ? "urgent" : ""}" data-id="${e.id}">
      ${App.avatar(e.from)}<div><div class="t1"><b>${esc(e.from)}</b><time>${esc(e.time)}</time></div><div class="t2">${e.status === "replied" ? "✓ Replied · " : ""}${esc(e.subj)}</div></div><div class="tg">${tags}</div></div>`;
  };
  const stats = () => {
    const es = S().emails;
    return [["Received", es.length], ["Filtered, no action", es.filter(e => e.status === "filtered").length], ["Duplicates merged", es.filter(e => e.status === "merged").length], ["Cases routed", S().triaged ? es.filter(e => e.intent && !e.intent.noAction && !e.intent.merged).length : 0]];
  };

  const detail = e => {
    if (!e) return `<div class="card empty">Select an email to see the agent's analysis.</div>`;
    const i = e.intent;
    const route = { changes: "Changes and disruption", payments: "Payments and VCC", recon: "Invoices and refunds", assist: "Consultant assist" };
    return `<div class="card"><div class="row" style="justify-content:space-between">${App.avatar(e.from)}<div style="flex:1"><b>${esc(e.from)}</b><div class="lbl">${esc(e.addr || "")}${e.client ? " · " + esc(App.client(e.client)) : ""} · ${esc(e.time)}</div></div>${i ? App.chip(i.pri || "No action", i.pri ? "p-" + i.pri : "s-mute") : ""}</div>
      <h3 style="font-size:18px;margin:14px 0 8px">${esc(e.subj)}</h3><div class="msg">${esc(e.body)}</div></div>
      ${i ? `<div class="card reveal"><div class="ct"><span class="orb"></span>Agent analysis <small>Triage agent · ${i.conf}% confidence</small></div>
        <div class="row" style="margin-bottom:12px">${App.chip(i.label, "c-" + i.cls)}${i.noAction ? App.chip("Filed, no reply needed", "s-mute") : ""}${i.merged ? App.chip("Merged into " + esc(D.emails.find(x => x.id === e.dupOf)?.from || "case"), "s-mute") : ""}</div>
        ${i.entities.length ? `<dl class="kv">${i.entities.map(x => `<dt>${esc(x[0])}</dt><dd class="mono">${esc(x[1])}</dd>`).join("")}</dl>` : `<div class="lbl">No booking references found.</div>`}
        ${!i.noAction && i.module ? `<div class="row" style="margin-top:14px"><span class="lbl">Routed to</span><b>${route[i.module]}</b><span class="sp" style="flex:1"></span>${e.link ? `<a class="btn pri" href="${e.link}">Open in ${route[i.module]} →</a>` : ""}</div>` : ""}</div>
      ${!i.noAction && !i.merged ? `<div class="card reveal"><div class="ct">Drafted reply <small>${e.status === "replied" ? "Sent " + esc(e.sentAt || "") : "Edit before sending"}</small></div>
        <div class="field" style="margin:0"><textarea id="draft" ${e.status === "replied" ? "disabled" : ""}>${esc(e.draft || App.draftFor(e))}</textarea></div>
        <div class="row" style="margin-top:12px">${e.status === "replied" ? App.chip("Reply sent", "s-ok") : `<button class="btn pri" id="bSend">${App.icon("send")}Send reply</button><button class="btn" id="bRedraft">Redraft</button>`}</div></div>` : ""}` :
      `<div class="card"><div class="callout cb-info"><span class="ok idle">i</span><div><b>Not triaged yet.</b> Run triage to classify, filter, merge and prioritise the inbox.</div></div></div>`}`;
  };

  App.views.inbox = {
    title: "Email and enquiry triage", crumb: "Shared servicing inbox · servicing.anz@",
    render() {
      return `<div class="tiles" id="stats">${stats().map((s, i) => `<div class="tile ${i === 3 ? "hl" : ""}"><span class="lbl">${s[0]}</span><b>${s[1]}</b></div>`).join("")}</div>
      <div class="row" style="justify-content:space-between"><div class="tabs" id="tabs">${[["all", "All"], ["act", "Actionable"], ["no", "Filtered and merged"]].map(t => `<button class="tab ${tab === t[0] ? "on" : ""}" data-t="${t[0]}">${t[1]}</button>`).join("")}</div>
        <div class="row"><button class="btn" id="bNew">${App.icon("plus")}Test a new email</button><button class="btn pri lg" id="bTriage" ${S().triaged ? "disabled" : ""}>${App.icon("spark")}${S().triaged ? "Inbox triaged" : "Run triage agent"}</button></div></div>
      <div class="ld"><div class="card" style="padding:8px"><div class="list" id="list"></div></div><div style="display:grid;gap:18px" id="detail"></div></div>`;
    },
    mount() {
      const draw = () => {
        $("#list").innerHTML = visible().map(rowHTML).join("") || `<div class="empty">Nothing here.</div>`;
        $("#detail").innerHTML = detail(S().emails.find(e => e.id === sel));
        $("#stats").innerHTML = stats().map((s, i) => `<div class="tile ${i === 3 ? "hl" : ""}"><span class="lbl">${s[0]}</span><b>${s[1]}</b></div>`).join("");
        bindDetail();
      };
      const bindDetail = () => {
        const e = S().emails.find(x => x.id === sel);
        const send = $("#bSend"), re = $("#bRedraft");
        if (send) send.onclick = () => { e.draft = $("#draft").value; e.status = "replied"; e.sentAt = App.now().slice(0, 5); App.audit("triage", `Sent reply to ${e.from}`, "—", "Human", 0, { human: true }); App.done(6); App.toast(`Reply sent to ${e.from}`); draw(); App.badges(); };
        if (re) re.onclick = async () => { const t = $("#draft"); await App.type(t, App.draftFor(e)); App.audit("triage", `Redrafted reply to ${e.from}`, "Reasoning LLM", "92%", 0.003); };
      };
      $("#list").onclick = ev => { const r = ev.target.closest(".li"); if (!r) return; sel = r.dataset.id; draw(); };
      $("#tabs").onclick = ev => { const b = ev.target.closest(".tab"); if (!b) return; tab = b.dataset.t; $$(".tab", $("#tabs")).forEach(x => x.classList.toggle("on", x === b)); draw(); };
      $("#bTriage").onclick = async () => {
        if (busy || S().triaged) return; busy = true; $("#bTriage").disabled = true;
        const es = S().emails;
        for (const e of es) {
          const row = $(`.li[data-id="${e.id}"]`);
          row && row.classList.add("scan");
          await App.sleep(170);
          e.intent = App.classify(e);
          if (row) { row.outerHTML = rowHTML(e); }
        }
        App.audit("triage", `Read and classified ${es.length} emails`, "Intent classifier", "98%", 0.009);
        await App.sleep(500);
        es.forEach(e => { if (e.intent.noAction) e.status = "filtered"; if (e.intent.merged) e.status = "merged"; });
        App.audit("triage", `Filtered ${es.filter(e => e.status === "filtered").length} non-actionable emails`, "Rules engine", "100%", 0);
        App.audit("triage", "Merged Amadeus schedule change notice into Sarah Chen's case", "Rules engine", "100%", 0);
        S().triaged = true;
        App.audit("triage", "Ranked actionable cases by urgency", "Reasoning LLM", "96%", 0.004);
        sel = ordered()[0].id; busy = false;
        $("#bTriage").innerHTML = App.icon("spark") + "Inbox triaged";
        draw(); App.badges();
        App.toast(`Triage done: ${stats()[3][1]} cases routed, ${stats()[1][1]} filtered, 1 merged`);
      };
      $("#bNew").onclick = () => compose(draw);
      if (!sel && S().triaged) sel = ordered()[0].id;
      draw();
    }
  };

  const EX = {
    "Schedule change": { from: "Ravi Menon", subj: "Jetstar moved my flight to tomorrow morning", body: "Hi team, JQ 507 tonight from Sydney to Melbourne has been moved to tomorrow 6am. I have a client dinner tonight in Melbourne. Booking ref 3MN7KD. Can you help?" },
    "Cancellation": { from: "Grace Liu", subj: "Please cancel my Perth trip", body: "Hi, the workshop has been postponed. Please cancel my Perth trip next Tuesday, booking ref 8QW2ZP. Thanks, Grace" },
    "Card problem": { from: "Pier One Sydney", subj: "Card declined for reservation PS-30118", body: "The virtual card for reservation PS-30118 was declined. Please send a valid payment before check-in today." },
    "Visa question": { from: "Omar Haddad", subj: "Visa for Japan?", body: "Do I need a visa for a one-week business trip to Tokyo on my Australian passport?" }
  };
  function compose(draw) {
    const m = App.modal(`<h2 style="font-size:22px">Test a new email</h2><p class="muted" style="margin:6px 0 16px">Type or paste any email. The triage agent classifies it live, extracts references and drafts a reply.</p>
      <div class="row" style="margin-bottom:14px"><span class="lbl">Examples</span>${Object.keys(EX).map(k => `<button class="tab" data-ex="${esc(k)}">${esc(k)}</button>`).join("")}</div>
      <div class="field"><label for="cFrom">From</label><input id="cFrom" placeholder="Traveller or supplier name"></div>
      <div class="field"><label for="cSubj">Subject</label><input id="cSubj"></div>
      <div class="field"><label for="cBody">Message</label><textarea id="cBody"></textarea></div>
      <div id="cRun"></div>
      <div class="row" style="justify-content:flex-end;margin-top:8px"><button class="btn" data-close>Cancel</button><button class="btn pri" id="cGo">${App.icon("spark")}Run triage agent</button></div>`);
    m.querySelectorAll("[data-ex]").forEach(b => b.onclick = () => { const x = EX[b.dataset.ex]; $("#cFrom").value = x.from; $("#cSubj").value = x.subj; $("#cBody").value = x.body; });
    $("#cGo").onclick = async () => {
      const from = $("#cFrom").value.trim() || "Unknown sender", subj = $("#cSubj").value.trim(), body = $("#cBody").value.trim();
      if (!subj && !body) { App.toast("Add a subject or message first", "warn"); return; }
      $("#cGo").disabled = true;
      const e = { id: "E-" + (3000 + S().emails.length), from, addr: "", time: App.now().slice(0, 5), subj: subj || "(no subject)", body, status: "new" };
      e.intent = App.classify(e);
      await App.run($("#cRun"), [{ t: "Read message", sub: `${body.length} characters`, ms: 450 }, { t: "Classified intent", sub: `${e.intent.label} · ${e.intent.conf}%`, ms: 600, model: "Intent classifier", conf: e.intent.conf + "%", cost: 0.001 }, { t: "Extracted references", sub: e.intent.entities.map(x => x[1]).join(", ") || "None found", ms: 500, model: "Entity extractor", conf: "97%", cost: 0.001 }, { t: "Drafted a reply", sub: e.intent.noAction ? "Not needed" : "Ready for review", ms: 600, model: "Reasoning LLM", conf: "93%", cost: 0.003 }], "triage");
      if (e.intent.noAction) e.status = "filtered";
      S().emails.unshift(e); S().triaged = S().triaged || false;
      sel = e.id; m.remove(); draw(); App.badges();
      App.toast(`Classified as ${e.intent.label}`);
    };
  }
})();
