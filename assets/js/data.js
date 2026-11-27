/* Seeded demo data. All travellers, clients, bookings, amounts and timings are fictional. */
window.DATA = (() => {
  const clients = {
    halcyon: { name: "Halcyon Resources", code: "HALCYON", fee: { domestic: 28, intl: 55, change: 0, hotel: 12 }, tier: "Strategic" },
    brightline: { name: "Brightline Engineering", code: "BRIGHTLINE", fee: { domestic: 24, intl: 49, change: 18, hotel: 10 }, tier: "Corporate" },
    northgate: { name: "Northgate Health", code: "NORTHGATE", fee: { domestic: 22, intl: 45, change: 15, hotel: 10 }, tier: "Government health" }
  };

  /* ---------- 1 + 3: inbox ---------- */
  const emails = [
    { id: "E-2001", from: "Sarah Chen", addr: "sarah.chen@halcyon.example", client: "halcyon", time: "06:58",
      subj: "URGENT: Qantas moved my flight, meeting in Singapore 9am tomorrow",
      body: "Hi team,\n\nI just got a text from Qantas saying QF 81 today is cancelled and they've put me on tomorrow's flight. I have a board meeting in Singapore at 9am tomorrow that I can't miss.\n\nCan you get me there tonight? Happy to fly any time today. Booking ref 7KQ2LM.\n\nThanks, Sarah", link: "#/changes/CS-1042" },
    { id: "E-2002", from: "Harbourview Hotel Singapore", addr: "reservations@harbourview.example", time: "06:41",
      subj: "Payment declined: virtual card for reservation HV-55821",
      body: "Dear CTM team,\n\nThe virtual card provided for reservation HV-55821 (guest Sarah Chen, arrival 3 Dec) was declined at pre-authorisation. Please provide a valid form of payment before check-in today.\n\nRegards, Front Office", link: "#/payments/PX-301" },
    { id: "E-2003", from: "Amadeus queue 8", addr: "queue8@amadeus.example", time: "06:30",
      subj: "Schedule change: PNR 7KQ2LM, QF 81 03DEC cancelled",
      body: "SC notification. PNR 7KQ2LM. Segment 2 QF 81 03DEC SYDSIN status UN. Replacement segment QF 81 04DEC SYDSIN TK1.", link: "#/changes/CS-1042", dupOf: "E-2001" },
    { id: "E-2004", from: "James O'Neill", addr: "j.oneill@brightline.example", client: "brightline", time: "06:22",
      subj: "Can I move my Auckland return to Friday?",
      body: "Hi CTM,\n\nMeetings in Auckland wrapped up early. Could I fly back to Melbourne on Friday afternoon instead of Sunday? Booking ref 5TR8WE.\n\nCheers, James", link: "#/changes/CS-1043" },
    { id: "E-2005", from: "Mark Feldman", addr: "m.feldman@brightline.example", client: "brightline", time: "06:15",
      subj: "Automatic reply: Trip approval",
      body: "I am out of the office until Monday 7 December with limited access to email. For urgent matters please contact the travel desk." },
    { id: "E-2006", from: "Priya Raman", addr: "priya.raman@northgate.example", client: "northgate", time: "05:54",
      subj: "Refund status for my cancelled London trip",
      body: "Hello,\n\nFollowing up on the refund for my cancelled October trip to London (ticket 618-2290045517). It has been more than six weeks. Can you tell me when it will be credited?\n\nThank you, Priya", link: "#/recon/refunds" },
    { id: "E-2007", from: "Airline partner news", addr: "news@airline-partner.example", time: "05:30",
      subj: "December fares and lounge updates",
      body: "This month: new lounge openings and partner offers. Unsubscribe at any time." },
    { id: "E-2008", from: "Accounts payable", addr: "ap@halcyon.example", client: "halcyon", time: "05:12",
      subj: "November transactions missing from invoice",
      body: "Hi,\n\nThree trips from November do not appear on this month's statement (travellers Chen, Okafor and Lindqvist). Can you check and reissue the invoice?\n\nHalcyon Accounts Payable", link: "#/recon/uninvoiced" },
    { id: "E-2009", from: "Daniel Ruiz", addr: "d.ruiz@brightline.example", client: "brightline", time: "04:47",
      subj: "Baggage allowance on my Singapore flight?",
      body: "Quick one: am I allowed two checked bags on my economy fare to Singapore next week? Flying SQ.\n\nDaniel", link: "#/assist" },
    { id: "E-2010", from: "Harbourview Hotel Singapore", addr: "reservations@harbourview.example", time: "04:20",
      subj: "Booking confirmed: HV-55907",
      body: "We are pleased to confirm your reservation HV-55907 for arrival 8 December. This is an automated confirmation." },
    { id: "E-2011", from: "Emma Walsh", addr: "emma.walsh@northgate.example", client: "northgate", time: "03:58",
      subj: "Do I need a visa for Japan in January?",
      body: "Hi,\n\nI'm travelling to Tokyo for a two-week conference next month on my Australian passport. Do I need a visa?\n\nThanks, Emma", link: "#/assist" },
    { id: "E-2012", from: "Events team", addr: "events@travel-trends.example", time: "02:30",
      subj: "Webinar invitation: travel trends 2027",
      body: "Join us for our quarterly travel trends webinar. Register now to save your seat." },
    { id: "E-2013", from: "Lena Okafor", addr: "l.okafor@halcyon.example", client: "halcyon", time: "07:05",
      subj: "Melbourne flight cancelled due to weather, three of us stuck",
      body: "Hi team,\n\nVirgin Australia just cancelled VA 812 Melbourne to Sydney because of storms. Three of us from Halcyon are on booking 9PL4XD and need to be in Sydney tonight for an 8am site visit.\n\nPlease help ASAP.\nLena", link: "#/changes/CS-1048" },
    { id: "E-2014", from: "Brightline travel arranger", addr: "travel@brightline.example", client: "brightline", time: "07:11",
      subj: "Ticketing failed for Tom Becker, card declined?",
      body: "Hi CTM,\n\nWe got a notice that Tom Becker's Perth ticket couldn't be issued because the card was declined. His fare expires at 12:00 today. Can you sort it?\n\nThanks", link: "#/payments/PX-304" }
  ];

  /* ---------- 1: changes, exchanges, disruption ---------- */
  const cases = [
    { id: "CS-1042", type: "Involuntary schedule change", kind: "chg", priority: "Urgent", email: "E-2001",
      traveller: "Sarah Chen", role: "Finance Director", client: "halcyon", pnr: "7KQ2LM", profile: "Executive, business class eligible · Qantas Platinum",
      summary: "QF 81 cancelled; airline re-protection lands 8 hours after a 09:00 meeting in Singapore.",
      understand: [["Intent", "Involuntary schedule change", "97%"], ["Traveller", "Sarah Chen, Halcyon Resources", ""], ["Hard constraint", "In Singapore before 09:00, Fri 4 Dec", "From email"]],
      pnrLines: [["h", "RP/SYDCT2100/SYDCT2100        AA/SU  02DEC26/2214Z   7KQ2LM"], ["", "  1.CHEN/SARAH MS"], ["x", "  2  QF  81 J 03DEC 4 SYDSIN UN1  1145 1700  *SC CANCELLED"], ["k", "  3  QF  81 J 04DEC 5 SYDSIN TK1  1145 1700  *RE-PROTECTED"], ["", "  4 AP SYD CTM SERVICING - A"], ["", "  5 FA PAX 081-2457739102/ETQF/AUD4280.00/02DEC26"], ["", "  6 RM *POLICY HALCYON-EXEC *CC HALCYON FIN"]],
      conflict: "Re-protected flight lands 17:00 on 4 Dec, 8 hours after the 09:00 meeting.",
      rules: [["ok", "Change initiated by airline: involuntary", "Waiver applies"], ["ok", "Voluntary change fee A$450 not charged under waiver", "A$0"], ["ok", "Endorsable to oneworld partners on the same day", "QF, BA"]],
      policy: [["ok", "Preferred carrier", "Qantas"], ["ok", "Business class on flights over 6 hours (SYD–SIN 8h 15m)", "Allowed"], ["warn", "Extra cost over A$500 needs manager approval", "Rule"]],
      timeline: { meeting: 33, rows: [{ n: "QF 81 today", d: 8.75, a: 17, c: "#8A90B0", x: 1 }, { n: "Re-protected", d: 32.75, a: 41, c: "#E5484D" }] },
      options: [
        { k: "A", fl: "QF 1", cr: "Qantas · Business", dep: "16:20", arr: "21:35", from: "SYD", to: "SIN", day: "Thu 3 Dec", cost: "A$0", costOk: true, basis: "Same ticket, waiver", pol: "Compliant", polOk: true, extra: "Seat 3A window", why: "Preferred carrier, no extra cost, keeps Platinum earn. Lands 11h 25m before the meeting.", best: true, tl: { d: 13.33, a: 21.58 } },
        { k: "B", fl: "BA 16", cr: "British Airways · Business", dep: "17:15", arr: "22:30", from: "SYD", to: "SIN", day: "Thu 3 Dec", cost: "A$0", costOk: true, basis: "Endorsed under waiver", pol: "Compliant", polOk: true, extra: "Aisle only", why: "oneworld partner, endorsable at no cost. Later arrival and not the preferred carrier.", tl: { d: 14.25, a: 22.5 } },
        { k: "C", fl: "SQ 222", cr: "Singapore Airlines · Business", dep: "15:50", arr: "21:05", from: "SYD", to: "SIN", day: "Thu 3 Dec", cost: "+A$1,180", costOk: false, basis: "New ticket", pol: "Needs approval", polOk: false, extra: "Seat 11A window", why: "Earliest arrival, but a new ticket over the A$500 limit needs manager approval.", tl: { d: 12.83, a: 21.08 } }],
      tasks: [["Cancel QF 81 · 03 Dec", "Segment 2 removed, re-protected QF 81 04 Dec released", "XE2,3"], ["Book QF 1 · Business · 03 Dec", "SYD 16:20 → SIN 21:35, confirmed HK1", "SS1J1 · QF1 03DEC SYDSIN"], ["Reissue ticket under waiver", "081-2457739102 → 081-2457739288 · A$0 collected", "FXQ/WVR-QFSC · TTP/RT"], ["Assign seat 3A", "Window, forward cabin, per profile", "ST/3A/P1"], ["Update booking record", "Remarks added, schedule change queue cleared", "RM*SC RESOLVED CS-1042 · QE8"], ["Flag change for invoicing", "Mid-office updated, A$0 change, no service fee per contract", "MID-OFFICE · INV-FLAG"]],
      reply: { to: "Sarah Chen", subj: "You're on QF 1 to Singapore tonight", body: ["Hi Sarah,", "Qantas cancelled QF 81 this morning, so we've moved you to tonight's flight. You'll land well before your 9am meeting.", "Your new e-ticket is 081-2457739288 and the Harbourview has been told about the later arrival.", "Kind regards,\nOlivia, CTM"], facts: [["Flight", "QF 1"], ["Sydney", "16:20"], ["Singapore", "21:35"], ["Cabin", "Business"], ["Seat", "3A window"], ["Cost to Halcyon", "A$0"]] },
      handled: "3m 38s", manual: 25 },
    { id: "CS-1043", type: "Voluntary exchange", kind: "chg", priority: "Normal", email: "E-2004",
      traveller: "James O'Neill", role: "Project Engineer", client: "brightline", pnr: "5TR8WE", profile: "Corporate traveller, economy · Velocity Gold",
      summary: "Traveller asks to bring his Auckland–Melbourne return forward from Sunday to Friday afternoon.",
      understand: [["Intent", "Voluntary date change (exchange)", "95%"], ["Traveller", "James O'Neill, Brightline Engineering", ""], ["Request", "AKL → MEL on Fri 4 Dec, afternoon", "From email"]],
      pnrLines: [["h", "RP/MELCT2210/MELCT2210        AA/SU  20NOV26/0412Z   5TR8WE"], ["", "  1.ONEILL/JAMES MR"], ["", "  2  QF 151 Y 30NOV 1 MELAKL HK1  0900 1405"], ["k", "  3  QF 158 Y 06DEC 7 AKLMEL HK1  1530 1730"], ["", "  4 FA PAX 081-2457001234/ETQF/AUD912.00/20NOV26"], ["", "  5 RM *POLICY BRIGHTLINE-STD *CC BRIGHTLINE LODGE"]],
      conflict: null,
      rules: [["ok", "Fare family Flex: date changes permitted", "Allowed"], ["ok", "Change fee for Flex fares", "A$0"], ["warn", "Fare difference payable if a higher fare applies", "Collect"]],
      policy: [["ok", "Economy class on trans-Tasman flights", "Compliant"], ["ok", "Change cost under A$250 needs no approval", "Auto"], ["ok", "Preferred carrier Qantas, then Air New Zealand", "Qantas"]],
      timeline: null,
      options: [
        { k: "A", fl: "QF 154", cr: "Qantas · Economy", dep: "15:40", arr: "17:45", from: "AKL", to: "MEL", day: "Fri 4 Dec", cost: "+A$86", costOk: true, basis: "Fare difference, Flex", pol: "Compliant", polOk: true, extra: "Seat 22A window", why: "Preferred carrier, same ticket, cheapest Friday afternoon option.", best: true },
        { k: "B", fl: "NZ 123", cr: "Air New Zealand · Economy", dep: "13:30", arr: "15:35", from: "AKL", to: "MEL", day: "Fri 4 Dec", cost: "+A$214", costOk: true, basis: "New ticket, refund old", pol: "Compliant", polOk: true, extra: "Seat 18C aisle", why: "Earlier, but a new ticket costs more and loses Qantas earn." },
        { k: "C", fl: "QF 158", cr: "Qantas · Economy", dep: "15:30", arr: "17:30", from: "AKL", to: "MEL", day: "Sat 5 Dec", cost: "A$0", costOk: true, basis: "Same fare class available", pol: "Compliant", polOk: true, extra: "Seat 30F window", why: "No cost, but Saturday, not the Friday the traveller asked for." }],
      tasks: [["Cancel QF 158 · 06 Dec", "Original return segment released", "XE3"], ["Book QF 154 · 04 Dec", "AKL 15:40 → MEL 17:45, confirmed HK1", "SS1Y1 · QF154 04DEC AKLMEL"], ["Reissue with fare difference", "081-2457001234 → 081-2457001302 · A$86 collected on lodge card", "FXQ · TTP/RT · ADC AUD86"], ["Assign seat 22A", "Window per profile", "ST/22A/P1"], ["Apply change fee per contract", "Brightline change service fee A$18 added", "MID-OFFICE · FEE CHG18"]],
      reply: { to: "James O'Neill", subj: "Your new Friday flight home", body: ["Hi James,", "Done. You're now flying home on Friday afternoon. The fare difference was A$86, charged to the Brightline lodge card per policy.", "Your new e-ticket is 081-2457001302.", "Safe travels,\nOlivia, CTM"], facts: [["Flight", "QF 154"], ["Auckland", "15:40 Fri"], ["Melbourne", "17:45"], ["Cabin", "Economy"], ["Seat", "22A window"], ["Cost", "A$86 + A$18 fee"]] },
      handled: "2m 51s", manual: 18 },
    { id: "CS-1048", type: "Disruption rebooking (3 travellers)", kind: "chg", priority: "Urgent", email: "E-2013",
      traveller: "Lena Okafor + 2", role: "Site Operations Lead", client: "halcyon", pnr: "9PL4XD", profile: "Group of 3 on one booking · keep together",
      summary: "VA 812 MEL–SYD cancelled for weather; three travellers must reach Sydney tonight for an 08:00 site visit.",
      understand: [["Intent", "Disruption (IROPS), airline cancellation", "98%"], ["Travellers", "Lena Okafor, Anders Lindqvist, Mei Tan", "3 on PNR"], ["Hard constraint", "In Sydney tonight, keep the group together", "From email"]],
      pnrLines: [["h", "RP/MELCT2100/MELCT2100        AA/SU  28NOV26/0130Z   9PL4XD"], ["", "  1.OKAFOR/LENA MS  2.LINDQVIST/ANDERS MR  3.TAN/MEI MS"], ["x", "  4  VA 812 Y 03DEC 4 MELSYD UN3  1730 1855  *IROPS WEATHER"], ["", "  5 FA PAX 795-2213400871..73/ETVA/AUD1,047.00"], ["", "  6 RM *POLICY HALCYON-STD *GROUP KEEP TOGETHER"]],
      conflict: "No automatic re-protection offered yet. Last suitable departures tonight are filling fast.",
      rules: [["ok", "Airline-declared weather disruption: free rebooking", "Waiver applies"], ["ok", "Rebooking permitted on VA same day, or other carriers via involuntary reroute", "VA, QF"], ["ok", "No change fees for affected passengers", "A$0"]],
      policy: [["ok", "Economy on domestic flights", "Compliant"], ["ok", "Duty of care: notify traveller tracking for disrupted travellers", "Required"], ["warn", "Overnight hotel needs approval if no flight tonight", "Rule"]],
      timeline: null,
      options: [
        { k: "A", fl: "VA 832", cr: "Virgin Australia · Economy", dep: "19:30", arr: "20:55", from: "MEL", to: "SYD", day: "Thu 3 Dec", cost: "A$0", costOk: true, basis: "Same carrier, weather waiver", pol: "Compliant", polOk: true, extra: "3 seats together, row 14", why: "Same airline, no reissue to another carrier, all three seated together.", best: true },
        { k: "B", fl: "QF 470", cr: "Qantas · Economy", dep: "19:00", arr: "20:25", from: "MEL", to: "SYD", day: "Thu 3 Dec", cost: "A$0", costOk: true, basis: "Involuntary reroute", pol: "Compliant", polOk: true, extra: "2 together, 1 separate", why: "Earlier, but the group would be split and reroute takes longer to confirm." },
        { k: "C", fl: "VA 806", cr: "Virgin Australia · Economy", dep: "06:00", arr: "07:25", from: "MEL", to: "SYD", day: "Fri 4 Dec", cost: "+A$540", costOk: false, basis: "Hotel tonight", pol: "Needs approval", polOk: false, extra: "Hotel near MEL airport", why: "Arrives too close to the 08:00 site visit and needs a hotel." }],
      tasks: [["Rebook 3 travellers on VA 832", "MEL 19:30 → SYD 20:55, confirmed HK3, row 14 together", "SS3Y1 · VA832 03DEC MELSYD"], ["Revalidate 3 tickets under weather waiver", "No fare difference, A$0 collected", "TTP/RT · WVR-VAWX"], ["Update duty-of-care tracking", "Traveller tracking updated, Halcyon safety contact notified", "DOC · TRACK UPDATE"], ["Send notifications to all 3 travellers", "SMS and email with new flight details", "NOTIFY · SMS · EMAIL"], ["Update booking record", "Remarks added, disruption queue cleared", "RM*IROPS RESOLVED CS-1048"]],
      reply: { to: "Lena Okafor, Anders Lindqvist, Mei Tan", subj: "You're all on VA 832 to Sydney tonight", body: ["Hi Lena, Anders and Mei,", "VA 812 was cancelled due to the storms. We've moved all three of you to VA 832 tonight, seated together in row 14, at no cost.", "Your Halcyon safety contact has been updated. Reply here if anything changes.", "Kind regards,\nOlivia, CTM"], facts: [["Flight", "VA 832"], ["Melbourne", "19:30"], ["Sydney", "20:55"], ["Seats", "14A, 14B, 14C"], ["Cost", "A$0"], ["Travellers", "3"]] },
      handled: "2m 12s", manual: 35 },
    { id: "CS-1049", type: "Cancellation to travel credit", kind: "chg", priority: "Normal", email: null,
      traveller: "Hannah Kirk", role: "Policy Advisor", client: "northgate", pnr: "6HB2QA", profile: "Government health traveller · economy",
      summary: "Conference cancelled; traveller asks to cancel her Brisbane trip. Non-refundable fare.",
      understand: [["Intent", "Cancellation request", "96%"], ["Traveller", "Hannah Kirk, Northgate Health", ""], ["Reason", "Conference cancelled by organiser", "From email"]],
      pnrLines: [["h", "RP/CBRCT2100/CBRCT2100        AA/SU  12NOV26/2301Z   6HB2QA"], ["", "  1.KIRK/HANNAH MS"], ["", "  2  QF 580 Y 09DEC 3 CBRBNE HK1  0715 0910"], ["", "  3  QF 583 Y 11DEC 5 BNECBR HK1  1810 2010"], ["", "  4 FA PAX 081-2457112901/ETQF/AUD486.00/12NOV26"]],
      conflict: null,
      rules: [["warn", "Saver fare: non-refundable", "No cash refund"], ["ok", "Value kept as travel credit if cancelled before departure", "A$486 credit"], ["ok", "Credit valid 12 months from issue, same traveller", "Until Nov 2027"]],
      policy: [["ok", "Northgate policy: unused tickets kept as credits and reused first", "Required"], ["ok", "Cancellation fee per contract", "A$15"]],
      timeline: null,
      options: [
        { k: "A", fl: "Cancel to credit", cr: "Keep A$486 as Qantas travel credit", dep: "", arr: "", from: "", to: "", day: "", cost: "A$486 credit", costOk: true, basis: "Unused ticket tracked", pol: "Compliant", polOk: true, extra: "Credit auto-applied on next booking", why: "Keeps the full ticket value for Northgate. Tracked in the unused ticket register.", best: true },
        { k: "B", fl: "Hold booking", cr: "Leave booking open for 48 hours", dep: "", arr: "", from: "", to: "", day: "", cost: "A$0", costOk: true, basis: "Risk of no-show", pol: "Review", polOk: false, extra: "", why: "Useful only if the conference may be rescheduled. Risk of losing value if forgotten." }],
      tasks: [["Cancel segments 2 and 3", "Booking cancelled before departure", "XE2,3"], ["Convert ticket to travel credit", "A$486 credit recorded against Hannah Kirk", "TRDC · CREDIT 081-2457112901"], ["Add to unused ticket register", "Expires Nov 2027; auto-apply on next Northgate booking", "UTR · ADD"], ["Apply cancellation fee", "A$15 per Northgate contract", "MID-OFFICE · FEE CXL15"]],
      reply: { to: "Hannah Kirk", subj: "Your Brisbane trip is cancelled, value kept as credit", body: ["Hi Hannah,", "Your Brisbane trip is cancelled. The fare was non-refundable, so we've kept the full A$486 as a travel credit in your name. We'll apply it automatically to your next booking.", "Kind regards,\nOlivia, CTM"], facts: [["Credit", "A$486"], ["Valid until", "Nov 2027"], ["Ticket", "081-2457112901"], ["Fee", "A$15"]] },
      handled: "1m 40s", manual: 15 }
  ];

  /* ---------- 2: payments and VCC ---------- */
  const payments = [
    { id: "PX-301", type: "VCC declined at pre-authorisation", sev: "High", due: "Check-in today 15:00", supplier: "Harbourview Hotel Singapore", ref: "HV-55821", traveller: "Sarah Chen", client: "halcyon", amount: "A$1,340",
      checks: [["VCC status", "Active", "ok"], ["VCC limit", "A$1,140 (room only)", "bad"], ["Hotel pre-authorisation", "A$1,340 incl. A$200 incidentals", "bad"], ["Card expiry", "31 Dec 2026", "ok"], ["Merchant category", "Lodging, allowed", "ok"], ["Client rule", "Halcyon allows incidentals up to A$250 on VCC", "ok"]],
      cause: "The virtual card was issued for the room rate only. The hotel pre-authorises incidentals as well, so the A$1,340 hold exceeded the A$1,140 limit.",
      fix: "Raise the VCC limit to A$1,390 (room plus A$250 incidentals, within Halcyon's rule) and resend the card to the hotel through the secure link.",
      alts: ["Ask the hotel to pre-authorise the room only", "Switch to Halcyon's lodge card"],
      tasks: [["Raise VCC limit to A$1,390", "Card ending 4417, within Halcyon incidentals rule", "VCC · LIMIT UPDATE"], ["Send card to hotel via secure link", "Link expires in 24 hours", "VCC · SECURE SEND"], ["Request pre-authorisation retry", "Hotel confirms hold of A$1,340", "SUPPLIER · RETRY"], ["Note arrival change on reservation", "Late arrival 22:30 after flight change CS-1042", "RES · REMARK"]],
      msg: { to: "Harbourview Hotel Singapore", subj: "Updated virtual card for HV-55821 (Sarah Chen)", body: "Dear Front Office,\n\nThe virtual card for reservation HV-55821 has been updated to cover the room and incidentals up to A$1,390. You'll receive the card details through our secure link. Please retry the pre-authorisation.\n\nPlease also note Ms Chen will now arrive around 22:30 tonight.\n\nKind regards,\nCTM Servicing" } },
    { id: "PX-302", type: "Missing payment details", sev: "High", due: "Hotel guarantee deadline 18:00 today", supplier: "Quayside Hotel Auckland", ref: "QA-77310", traveller: "Daniel Ruiz", client: "brightline", amount: "NZ$612",
      checks: [["Form of payment on booking", "None", "bad"], ["Client billing profile", "Brightline: hotels on lodge card", "ok"], ["Lodge card token", "Valid until 08/2028", "ok"], ["Rate and dates", "2 nights, NZ$306/night", "ok"], ["Hotel cap", "Under Brightline Auckland cap NZ$340", "ok"]],
      cause: "The hotel was booked through an online channel that did not attach a form of payment, so the guarantee will lapse at 18:00.",
      fix: "Attach Brightline's lodge card token as the guarantee, per the client billing profile, and confirm the guarantee with the hotel.",
      alts: ["Ask the traveller for a personal card", "Request a VCC for this stay"],
      tasks: [["Attach lodge card guarantee", "Brightline lodge card token ending 9902", "FOP · LODGE TOKEN"], ["Confirm guarantee with hotel", "Guarantee recorded on QA-77310", "SUPPLIER · CONFIRM"], ["Update booking record", "Form of payment remark added", "RM*FOP LODGE"]],
      msg: { to: "Quayside Hotel Auckland", subj: "Guarantee for QA-77310 (Daniel Ruiz)", body: "Dear Reservations,\n\nPlease find the guarantee for reservation QA-77310 attached via our secure payment link (Brightline Engineering lodge card). Kindly confirm the booking is guaranteed for late arrival.\n\nKind regards,\nCTM Servicing" } },
    { id: "PX-303", type: "Hotel payment confirmation pending", sev: "Normal", due: "Checked out 48 hours ago", supplier: "Marlow Suites London", ref: "MS-44019", traveller: "Priya Raman", client: "northgate", amount: "£612.40",
      checks: [["Checkout", "1 Dec 2026", "ok"], ["Charge on VCC", "Not yet posted", "warn"], ["Folio received", "Yes, £612.40", "ok"], ["Folio vs booking", "3 nights £204.13, matches", "ok"], ["Hotel reply to chaser", "\"Charged £612.40 on 2 Dec\"", "ok"]],
      cause: "The hotel had not confirmed the charge. The agent chased the hotel, read its reply, and matched the amount to the folio and booking.",
      fix: "Mark the payment confirmed, match the folio to the booking, and release the case to reconciliation.",
      alts: ["Wait for the card statement"],
      tasks: [["Record payment confirmation", "£612.40 charged 2 Dec, matches folio", "PAY · CONFIRM"], ["Attach folio to booking", "Folio stored against MS-44019", "DOC · ATTACH"], ["Send to reconciliation", "Ready for invoice matching", "RECON · RELEASE"]],
      msg: { to: "Marlow Suites London", subj: "Thank you, payment for MS-44019 confirmed", body: "Dear Accounts,\n\nThank you for confirming the charge of £612.40 for reservation MS-44019. We've matched it to the folio and closed our query.\n\nKind regards,\nCTM Servicing" } },
    { id: "PX-304", type: "Card declined at ticketing", sev: "Urgent", due: "Fare expires 12:00 today", supplier: "Qantas (ticketing)", ref: "PNR 8WQ3RN", traveller: "Tom Becker", client: "brightline", amount: "A$742",
      checks: [["Primary card", "Brightline corporate card ending 3381", "bad"], ["Decline reason", "Expired 11/26", "bad"], ["Backup card on billing profile", "Card ending 7710, valid 05/2028", "ok"], ["Client rule", "Backup card allowed with consultant approval", "warn"], ["Fare time limit", "12:00 today", "warn"]],
      cause: "The corporate card on file expired at the end of November. The fare is held until 12:00 today.",
      fix: "Issue the ticket on Brightline's backup card (with your approval), then ask the travel arranger to update the expired card.",
      alts: ["Ask the arranger for a new card before 12:00", "Rebook at a later fare"],
      tasks: [["Issue ticket on backup card", "081-2457220144 issued, A$742 on card ending 7710", "FP CCVI · TTP"], ["Flag expired card on profile", "Card ending 3381 marked expired", "PROFILE · CARD FLAG"], ["Notify travel arranger", "Request for updated card details", "NOTIFY · ARRANGER"]],
      msg: { to: "Brightline travel arranger", subj: "Tom Becker's Perth ticket is issued", body: "Hi,\n\nTom Becker's Perth ticket is now issued (081-2457220144). The corporate card ending 3381 expired at the end of November, so we used your backup card ending 7710 as your billing profile allows.\n\nPlease send us updated card details when you can.\n\nKind regards,\nCTM Servicing" } },
    { id: "PX-305", type: "Duplicate VCC charge", sev: "Normal", due: "Dispute window 60 days", supplier: "Riverside Hotel Brisbane", ref: "RB-20871", traveller: "Anders Lindqvist", client: "halcyon", amount: "A$480 × 2",
      checks: [["VCC transactions", "2 charges of A$480 on 28 Nov", "bad"], ["Folio total", "A$480", "ok"], ["Nights stayed", "2 × A$240", "ok"], ["Same merchant, same amount, same day", "Yes", "bad"]],
      cause: "The hotel charged the virtual card twice for the same stay. The folio shows one charge of A$480.",
      fix: "Ask the hotel to reverse the duplicate A$480 and log an exception so reconciliation tracks the credit.",
      alts: ["Raise a card dispute with the issuer"],
      tasks: [["Send reversal request to hotel", "Folio and both transactions attached", "SUPPLIER · REVERSAL"], ["Log reconciliation exception", "A$480 expected credit, owner: finance", "RECON · EXCEPTION"], ["Set follow-up", "Chase in 5 business days if not reversed", "TASK · FOLLOW-UP"]],
      msg: { to: "Riverside Hotel Brisbane", subj: "Duplicate charge on RB-20871", body: "Dear Accounts,\n\nReservation RB-20871 (Anders Lindqvist) was charged twice on 28 Nov, A$480 each time. The folio shows a single stay of A$480. Please reverse the duplicate charge and confirm.\n\nKind regards,\nCTM Servicing" } }
  ];

  /* ---------- 4: reconciliation ---------- */
  const uninvoiced = [
    { id: "TX-8801", date: "04 Nov", traveller: "Sarah Chen", client: "halcyon", item: "SYD–PER return, QF", amount: 1284, fee: 28, outcome: "invoice", note: "Matched to booking and contract fee" },
    { id: "TX-8802", date: "06 Nov", traveller: "Lena Okafor", client: "halcyon", item: "Hotel, Perth, 3 nights", amount: 654, fee: 12, outcome: "invoice", note: "Matched; hotel fee per contract" },
    { id: "TX-8803", date: "11 Nov", traveller: "Anders Lindqvist", client: "halcyon", item: "MEL–SIN return, SQ", amount: 2190, fee: 55, outcome: "exception", note: "Missing cost centre on booking", owner: "Client AP", action: "Ask Halcyon AP for cost centre" },
    { id: "TX-8804", date: "12 Nov", traveller: "James O'Neill", client: "brightline", item: "MEL–AKL return, QF", amount: 912, fee: 49, outcome: "invoice", note: "Matched to booking and contract fee" },
    { id: "TX-8805", date: "14 Nov", traveller: "Tom Becker", client: "brightline", item: "Car hire, Perth", amount: 318, fee: 0, outcome: "invoice", note: "Matched; no fee for car hire" },
    { id: "TX-8806", date: "18 Nov", traveller: "Priya Raman", client: "northgate", item: "Change fee, SYD–LHR", amount: 250, fee: 15, outcome: "exception", note: "Service fee charged A$25, contract says A$15", owner: "CTM billing", action: "Correct fee to A$15 before invoicing" },
    { id: "TX-8807", date: "19 Nov", traveller: "Emma Walsh", client: "northgate", item: "CBR–MEL return, VA", amount: 438, fee: 22, outcome: "invoice", note: "Matched to booking and contract fee" },
    { id: "TX-8808", date: "21 Nov", traveller: "Hannah Kirk", client: "northgate", item: "CBR–BNE return, QF", amount: 486, fee: 22, outcome: "invoice", note: "Matched to booking and contract fee" },
    { id: "TX-8809", date: "24 Nov", traveller: "Daniel Ruiz", client: "brightline", item: "Hotel, Auckland, 2 nights", amount: 560, fee: 10, outcome: "exception", note: "No supplier confirmation found", owner: "CTM servicing", action: "Chase hotel for confirmation" },
    { id: "TX-8810", date: "26 Nov", traveller: "Mei Tan", client: "halcyon", item: "SYD–BNE one way, VA", amount: 214, fee: 28, outcome: "invoice", note: "Matched to booking and contract fee" }
  ];
  const refunds = [
    { id: "RF-501", traveller: "Priya Raman", client: "northgate", ticket: "618-2290045517", airline: "Malaysia Airlines", amount: 1846, filed: "14 Oct", age: 50, status: "overdue", sla: 42 },
    { id: "RF-502", traveller: "Sarah Chen", client: "halcyon", ticket: "081-2457601233", airline: "Qantas", amount: 640, filed: "02 Nov", age: 31, status: "credit", sla: 42 },
    { id: "RF-503", traveller: "Lena Okafor", client: "halcyon", ticket: "795-2213309911", airline: "Virgin Australia", amount: 318, filed: "09 Nov", age: 24, status: "waiting", sla: 42 },
    { id: "RF-504", traveller: "Tom Becker", client: "brightline", ticket: "081-2457208800", airline: "Qantas", amount: 1120, filed: "16 Oct", age: 48, status: "overdue", sla: 42 },
    { id: "RF-505", traveller: "Emma Walsh", client: "northgate", ticket: "618-2290112045", airline: "Malaysia Airlines", amount: 905, filed: "20 Nov", age: 13, status: "waiting", sla: 42 },
    { id: "RF-506", traveller: "Anders Lindqvist", client: "halcyon", ticket: "618-2290098871", airline: "Malaysia Airlines", amount: 1312, filed: "28 Oct", age: 36, status: "credit", sla: 42 }
  ];

  /* ---------- 5: knowledge base (sample content for the demo) ---------- */
  const kb = [
    { id: "KB-01", title: "Halcyon Resources travel policy: cabin class", src: "Client policy · Halcyon", tags: "halcyon cabin class business premium economy flight hours long haul short haul policy book allowed",
      answer: "Halcyon travellers may book business class on flights over 6 hours, premium economy on flights of 4 to 6 hours, and economy below 4 hours.", points: ["Executives may book business class on any international flight.", "Any extra cost over A$500 on a change needs manager approval.", "Preferred carrier: Qantas, then oneworld partners."] },
    { id: "KB-02", title: "Brightline Engineering travel policy", src: "Client policy · Brightline", tags: "brightline cabin class economy premium policy hotel cap lodge card change approval",
      answer: "Brightline travellers fly economy on flights under 8 hours. Changes under A$250 need no approval, and hotels go on the Brightline lodge card.", points: ["Premium economy allowed on flights over 8 hours.", "Hotel caps: Auckland NZ$340, Perth A$290, Sydney A$330 per night.", "Backup card may be used with consultant approval if the primary card fails."] },
    { id: "KB-03", title: "Northgate Health travel policy", src: "Client policy · Northgate", tags: "northgate health government policy economy unused ticket credit cancellation fee",
      answer: "Northgate travellers fly economy on domestic and short international trips. Unused tickets must be kept as credits and reused before buying new fares.", points: ["Cancellation service fee: A$15.", "Credits are applied automatically on the traveller's next booking."] },
    { id: "KB-04", title: "Involuntary schedule change: waiver handling", src: "CTM SOP · Servicing", tags: "schedule change waiver involuntary airline cancelled moved reissue endorse fee qantas oneworld same day",
      answer: "When the airline changes or cancels a flight, treat it as involuntary: apply the airline's waiver, reissue without a change fee, and endorse to partners where the waiver allows.", points: ["Check the waiver code on the schedule change message before reissuing.", "Same-day moves to oneworld partners are usually permitted under Qantas waivers.", "Always confirm the traveller's hard constraints, such as meetings, before choosing an option."] },
    { id: "KB-05", title: "Voluntary changes and fare families", src: "Sample fare rules", tags: "voluntary change exchange date change fee fare difference flex saver sale fare rules",
      answer: "Flex fares allow date changes with no change fee; only any fare difference is collected. Saver fares carry a change fee plus fare difference, and sale fares are usually not changeable.", points: ["Collect the fare difference on the client's form of payment.", "Add the client's contracted change service fee in mid-office."] },
    { id: "KB-06", title: "Checked baggage: SQ economy (sample rule)", src: "Sample supplier rules · Singapore Airlines", tags: "baggage bags checked allowance kg economy sq singapore airlines luggage two bags",
      answer: "On the sample Singapore Airlines rule loaded for this demo, Economy Lite includes 25 kg, Economy Standard 30 kg and Economy Flexi 35 kg of checked baggage, by weight rather than by piece.", points: ["Two bags are fine as long as the total stays within the weight allowance.", "Always confirm against the fare rule on the booking before advising the traveller."] },
    { id: "KB-07", title: "Name corrections", src: "CTM SOP · Ticketing", tags: "name correction spelling change name ticket typo passenger name",
      answer: "Minor spelling corrections (typically up to three characters) can usually be made under the airline's name correction rules. A change to a different person is not allowed; cancel and rebook instead.", points: ["Check the airline's rule before editing the name field.", "Reissue the ticket after the correction so the name matches the passport."] },
    { id: "KB-08", title: "Japan entry for Australian passport holders", src: "Travel advisory summary", tags: "visa japan tokyo australian passport entry conference business short stay",
      answer: "Australian passport holders can generally visit Japan without a visa for short stays of up to 90 days for tourism or business meetings, including conferences.", points: ["Confirm current rules in Timatic or official government sources before advising.", "Paid work in Japan needs a visa."] },
    { id: "KB-09", title: "Virtual card (VCC) exceptions", src: "CTM SOP · Payments", tags: "vcc virtual card declined pre authorisation hotel limit incidentals payment card decline",
      answer: "Most hotel VCC declines happen because the card covers the room only while the hotel pre-authorises incidentals. Check the client's incidentals rule, raise the limit within it, and resend the card securely.", points: ["Never send card numbers by plain email; use the secure link.", "If the client does not allow incidentals, ask the hotel to pre-authorise the room only."] },
    { id: "KB-10", title: "Airline refunds: timelines and chasing", src: "CTM SOP · Finance", tags: "refund status when credited weeks airline bsp chase overdue refund enquiry",
      answer: "Airline refunds through BSP typically take 4 to 8 weeks. Our internal target is 42 days; after that the agent chases the airline and updates the traveller.", points: ["Once the airline credit arrives, match it to the ticket and release to the client.", "Tell travellers the expected date, not just the status."] },
    { id: "KB-11", title: "Disruption and duty of care", src: "CTM SOP · Disruption", tags: "disruption weather cancelled irops duty of care group keep together stuck stranded traveller tracking",
      answer: "In a disruption, rebook affected travellers on the earliest suitable option under the airline's waiver, keep groups together where possible, and update traveller tracking so the client's safety contact is informed.", points: ["Hotels for stranded travellers follow the client's approval rule.", "Notify every traveller on the booking, not just the one who emailed."] },
    { id: "KB-12", title: "Unused tickets and travel credits", src: "CTM SOP · Servicing", tags: "unused ticket credit cancel non refundable value expire reuse",
      answer: "When a non-refundable ticket is cancelled before departure, keep its value as a travel credit, record it in the unused ticket register, and apply it to the traveller's next booking before it expires.", points: ["Most credits are valid 12 months from the original issue date.", "Credits are usually for the same traveller only."] }
  ];
  const suggested = [
    "Can Daniel take two checked bags on his SQ economy fare?",
    "Does an Australian need a visa for a two-week conference in Japan?",
    "Can a Halcyon traveller book business class to Singapore?",
    "How do I handle a Qantas schedule change waiver?",
    "When will Priya's airline refund be credited?",
    "How do I fix a misspelt name on a ticket?"
  ];

  /* ---------- seeded audit history (before this session) ---------- */
  const auditSeed = [
    ["06:12:40", "triage", "Triage agent", "Classified 41 overnight emails", "Intent classifier", "98%", 0.019],
    ["06:31:05", "changes", "Servicing agent", "Auto-processed schedule change, PNR 4XC9TT", "Reasoning LLM", "96%", 0.031],
    ["06:44:18", "payments", "Payments agent", "Resent VCC to Pier One Sydney after limit check", "Rules engine", "100%", 0.002],
    ["06:52:51", "recon", "Reconciliation agent", "Matched 118 airline credits to tickets", "Matching model", "99%", 0.044],
    ["07:02:13", "assist", "Assist agent", "Answered fare rule question for consultant", "Reasoning LLM", "94%", 0.006]
  ];

  const agents = [
    { id: "triage", name: "Triage agent", ver: "v2.1", does: "Reads, classifies, filters, merges and ranks inbound email", models: "Intent classifier + reasoning LLM", autonomy: "Acts on non-actionable mail; routes the rest", acc: "98.1%" },
    { id: "changes", name: "Servicing agent", ver: "v2.3", does: "Changes, exchanges, disruption and cancellations", models: "Reasoning LLM, fare rules RAG, policy RAG", autonomy: "Consultant approves every ticket change", acc: "94.6%" },
    { id: "payments", name: "Payments agent", ver: "v1.4", does: "VCC and card exceptions, guarantees, payment confirmations", models: "Rules engine + reasoning LLM", autonomy: "Consultant approves card actions", acc: "97.2%" },
    { id: "recon", name: "Reconciliation agent", ver: "v1.8", does: "Uninvoiced transactions, refunds and exception reporting", models: "Matching model + contract rules", autonomy: "Invoices clean matches; exceptions to people", acc: "99.0%" },
    { id: "assist", name: "Assist agent", ver: "v2.0", does: "Answers policy, fare rule, baggage and process questions", models: "Retrieval over approved knowledge + LLM", autonomy: "Advises only; cites sources", acc: "95.4%" }
  ];

  return { clients, emails, cases, payments, uninvoiced, refunds, kb, suggested, auditSeed, agents };
})();
