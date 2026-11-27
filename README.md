# CTM Servicing Platform · powered by AIonOS

A clickable, end-to-end demo platform showing AIonOS agents working CTM's five servicing pain points, with a consultant approving every change and a UniStack audit trail across all of it.

All travellers, clients, bookings, amounts and timings are fictional. Automation rates and volumes are illustrative.

## Run it

No build step and no backend. Any of these work:

- **Double-click `index.html`.** It runs straight from the file, fully offline, with fonts bundled.
- **Local server:** `python3 -m http.server 8000`, then open http://localhost:8000
- **GitHub Pages:** Settings → Pages → deploy from `main`, root folder.

Top-right controls: **⏩ agent speed** (normal or fast), **↺ reset** (back to 07:38 with everything unworked).

## What's in it

| Area | Pain point | What you can do live |
|---|---|---|
| Command centre | All | Morning view: queues for each pain point, items needing a decision, live agent activity |
| Email and enquiry triage | Identifying intent, filtering non-actionable mail, prioritising urgent cases, drafting responses | Run triage over 14 emails (classify, filter 4, merge a duplicate, rank). Open any email for intent, extracted references, routing and a drafted reply. **Test a new email**: type anything and the intent engine classifies it in the browser |
| Changes and disruption | Exchanges, reissues, rerouting, cancellations, schedule changes, fare rules | 4 cases: involuntary schedule change, voluntary exchange, 3-traveller weather disruption, cancellation to credit. Agent reads the booking, fare rules and client policy, ranks options; you approve (or pick another option); it executes the reissue and drafts the email or WhatsApp reply |
| Payments and VCC | Card declines, VCC failures, missing payment details, hotel payment confirmations | 5 exceptions: VCC under-limit decline, missing guarantee, unconfirmed hotel charge, expired card at ticketing, duplicate VCC charge. Agent checks signals, finds the root cause, recommends a fix; you approve; it executes and drafts the supplier message |
| Invoices and refunds | Uninvoiced transactions, refund enquiries, exception reporting | Reconcile 10 uninvoiced transactions against bookings and contract fees (7 invoiced, 3 exceptions). Process refunds (match credits, chase overdue). Generated exception report with CSV export |
| Consultant assist | Faster answers on policy, fare rules, baggage, booking processes | Ask in plain English. Answers come only from 12 approved knowledge sources, with citations and confidence. Off-topic questions are declined, not guessed |
| UniStack audit | Governance | Every agent and human action with model, confidence and cost. Filter by area, roll back reversible actions, export the log, AI passports per agent |

The **narrated walkthrough** (the original film-style demo) is in [`walkthrough/`](walkthrough/) and linked from the sidebar.

## Suggested live demo path (12–15 minutes)

1. **Command centre:** set the scene: overnight work done, decisions waiting.
2. **Triage:** click *Run triage agent*. Open Sarah Chen's email, then *Test a new email* with one of CTM's own examples from the room.
3. **Changes:** open CS-1042, *Run servicing agent*, walk the fare rules and policy, *Approve and execute*, show the WhatsApp tab, *Send reply*. Optionally CS-1048 to show a group disruption.
4. **Payments:** PX-301 (the same traveller's hotel VCC decline): diagnose, approve, send.
5. **Invoices and refunds:** *Run reconciliation agent*, then the refunds tab and the exception report.
6. **Consultant assist:** ask two suggested questions, then one from the audience. Show that it declines when there is no approved source.
7. **UniStack audit:** every action from the session is there; roll one back.

Use **reset** before the meeting and **fast** speed if time is short.

## Structure

```
index.html              App shell
assets/css/app.css      Design system (AIonOS navy and blue, Outfit and Inter)
assets/fonts/           Bundled fonts (SIL Open Font Licence)
assets/js/data.js       All demo data: emails, cases, payments, transactions, refunds, knowledge base
assets/js/core.js       State, routing, audit log, agent step runner, shared UI
assets/js/home.js       Command centre
assets/js/inbox.js      Triage and the live intent engine
assets/js/changes.js    Changes, exchanges, disruption, cancellations
assets/js/payments.js   Payment and VCC exceptions
assets/js/recon.js      Uninvoiced transactions, refunds, exception report
assets/js/assist.js     Knowledge retrieval and chat
assets/js/audit.js      UniStack audit and AI passports
walkthrough/            Narrated walkthrough (audio + page)
```

To change the demo story, edit `assets/js/data.js`; the screens are generated from it.
