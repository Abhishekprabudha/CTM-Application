/* Command centre: the consultant's morning view across all five pain points. */
(() => {
  const { $, esc } = App, D = App.D;
  const PP = [
    { v: "inbox", ic: "inbox", col: "var(--blue)", bg: "var(--tint)", t: "Email and enquiry triage", d: "Intent, filtering, priority and drafted replies", auto: 92, q: c => c.inbox, unit: "to triage" },
    { v: "changes", ic: "chg", col: "var(--blue)", bg: "var(--tint)", t: "Changes and disruption", d: "Exchanges, reissues, schedule changes, rerouting", auto: 64, q: c => c.changes, unit: "open cases" },
    { v: "payments", ic: "pay", col: "var(--amber)", bg: "var(--ambert)", t: "Payments and VCC", d: "Card declines, VCC failures, guarantees", auto: 78, q: c => c.payments, unit: "exceptions" },
    { v: "recon", ic: "fin", col: "var(--violet)", bg: "var(--violett)", t: "Invoices and refunds", d: "Uninvoiced items, refunds, exception reports", auto: 86, q: c => c.recon, unit: "to review" },
    { v: "assist", ic: "kb", col: "var(--teal)", bg: "var(--tealt)", t: "Consultant assist", d: "Policy, fare rules, baggage and processes", auto: 100, q: () => D.kb.length, unit: "approved sources" }
  ];

  function needs() {
    const S = App.S, out = [];
    D.cases.forEach(c => { const s = S.cases[c.id].stage; if (s < 3) out.push({ p: c.priority, t: `${c.type}: ${c.traveller}`, sub: s === 1 ? "Options ready, awaiting your approval" : s === 2 ? "Reply drafted, ready to send" : c.summary, h: `#/changes/${c.id}`, k: "c-chg", l: "Change" }); });
    D.payments.forEach(p => { const s = S.pays[p.id].stage; if (s < 3) out.push({ p: p.sev, t: `${p.type}: ${p.supplier}`, sub: s === 1 ? "Fix recommended, awaiting your approval" : s === 2 ? "Message drafted" : p.due, h: `#/payments/${p.id}`, k: "c-pay", l: "Payment" }); });
    const o = { Urgent: 0, High: 1, Normal: 2, Low: 3 };
    return out.sort((a, b) => o[a.p] - o[b.p]).slice(0, 7);
  }

  App.views.home = {
    title: "Command centre", crumb: "CTM ANZ servicing · Thursday 3 December",
    render() {
      const S = App.S, c = App.counts(), n = needs();
      const handled = 186 + S.handled, hours = (14.2 + S.minutesSaved / 60).toFixed(1);
      const feed = [...S.audit].reverse().slice(0, 9);
      return `<section class="hero"><div style="position:relative;z-index:1"><h2>Good morning, Olivia.</h2><p>Your agents worked through the overnight queue. ${n.length ? `${n.length} items need a human decision, starting with ${esc(n[0].t)}.` : "Everything that needed a decision is resolved."}</p>
        <div class="row" style="margin-top:16px"><a class="btn pri lg" href="#/inbox" style="background:#fff;color:var(--navy);border-color:#fff">${App.icon("spark")}Start with the inbox</a><a class="btn lg ghost" href="walkthrough/" style="color:#fff;border-color:rgba(255,255,255,.35)">${App.icon("play")}Narrated walkthrough</a></div></div>
        <div class="hk"><div><span>Handled by agents today</span><b>${handled}</b></div><div><span>Consultant time saved</span><b>${hours} h</b></div><div><span>Avg handling, agent cases</span><b>2m 41s</b></div></div></section>
      <div class="pp">${PP.map(p => `<a class="ppc" href="#/${p.v}"><div class="ic" style="background:${p.bg};color:${p.col}">${App.icon(p.ic)}</div><h3>${p.t}</h3><div class="lbl">${p.d}</div>
        <div class="q"><b>${p.q(c)}</b><span class="lbl">${p.unit}</span></div><div><div class="row" style="justify-content:space-between"><span class="lbl">Agent automation</span><span class="lbl"><b style="color:var(--ink)">${p.auto}%</b></span></div><div class="bar"><i style="width:${p.auto}%;background:${p.col}"></i></div></div></a>`).join("")}</div>
      <div class="grid2"><div class="card"><div class="ct">Needs your decision <small>Ranked by urgency</small></div>
        ${n.length ? `<div class="list">${n.map(x => `<a class="li" href="${x.h}" style="grid-template-columns:auto minmax(0,1fr) auto">${App.chip(x.l, x.k)}<div><div class="t1"><b>${esc(x.t)}</b></div><div class="t2">${esc(x.sub)}</div></div>${App.chip(x.p, "p-" + x.p)}</a>`).join("")}</div>` : `<div class="empty">All clear. Every case is resolved.</div>`}</div>
      <div class="card"><div class="ct">Live agent activity <small><a href="#/audit">Open UniStack audit →</a></small></div><div class="feed">${feed.map(a => `<div class="fe"><time>${esc(a.time.slice(0, 5))}</time><span class="dot ${a.human ? "human" : ""}"></span><div><b>${esc(a.agent)}</b> · ${esc(a.action)}${a.conf && a.conf !== "—" && a.conf !== "Human" ? ` <span class="lbl">· ${esc(a.conf)}</span>` : ""}</div></div>`).join("")}</div></div></div>
      <div class="lbl">Automation rates and overnight volumes are illustrative for this demo. CTM-specific baselines are set in the proof of concept.</div>`;
    }
  };
})();
