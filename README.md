# CTM Application

AIonOS × CTM servicing agent demo: one Qantas schedule change followed from the inbox to a reissued ticket, with a consultant approving the change and a UniStack audit trail at the end.

## Run it

The demo is one static page plus narration clips. Open it through a local web server so the audio loads:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

It also works as-is on GitHub Pages (Settings → Pages → deploy from `main`, root folder).

## Controls

- **Start narrated demo**: plays hands-free with voice and captions, about 3¾ minutes.
- **Explore at my own pace**: no voice; step through it yourself.
- `←` / `→` step, `space` play or pause, `M` voice on or off, `C` captions on or off. The stage names in the top bar jump to a stage.

## Scenes

1. **Triage**: 12 overnight emails classified by intent; 4 filtered, 1 duplicate merged, 7 cases ranked by urgency.
2. **Case**: traveller email, Amadeus booking record, trip timeline showing the missed meeting, fare rules and travel policy checks.
3. **Decide**: three ranked rebooking options; the consultant approves with one click.
4. **Execute**: rebooking and reissue steps, and a drafted reply to the traveller (email and WhatsApp).
5. **Audit**: UniStack run trace with timestamps, models, confidence and cost, plus the AI passport and roll back.
6. **Impact**: handling time before and after, AIonOS proof points, and the proof-of-concept offer.

## Files

- `index.html`: the demo (HTML, CSS and JavaScript in one file).
- `audio/s0.mp3` to `audio/s14.mp3`: narration, one clip per step.
- `narration-script.json`: the narration text for each step.

All traveller, client, booking and timing details are fictional and for illustration only.
