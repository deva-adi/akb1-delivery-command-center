# 06_Accessibility.md
### Accessibility | AKB1 Delivery Command Center v1 | Revision 1 | Created: 2026-04-24

> WCAG 2.1 AA test plan. Owner: Frontend subagent. Shipped as part of every PR.

---

## 1. Target standard

WCAG 2.1 Level AA across all 15 tabs plus 4 cross-cutting surfaces. Level AAA aspirational where cheap.

## 2. Automated scan

- `axe-playwright` runs on every E2E spec after page render
- `pa11y-ci` runs nightly on all tab URLs

Zero critical violations is the launch gate. Serious violations require PR justification and a time-boxed remediation ticket.

## 3. Manual checks per tab

Each tab passes a 12-point manual check before sign-off:

1. Keyboard-only navigation from header to last interactive element
2. Focus visible on every focusable element
3. Skip-to-main-content link works
4. Screen reader announces filter changes
5. Tables have proper row and column headers
6. Charts have data table alternative
7. Colour contrast at or above 4.5:1 for text, 3:1 for large text and UI
8. Status indicators use text plus colour (not colour alone)
9. Error messages announced via aria-live
10. Modal traps focus correctly
11. Dropdowns announce expanded and collapsed state
12. No heading level skipped

## 4. Rev 3 specific checks

- Decision Queue rows: past-SLA chip must have text (not red-colour-only)
- Scope Debt Register: origin chips (Undelivered Promise, Workaround, Rework Tax) must have text
- Bench Tax Allocation: named people linked to detail drawer keyboard-accessible
- AI Defect Attribution: rate cells use text plus colour
- Rationalisation Queue: stage chips have text
- QBR Tracker: attestation status has text plus icon
- PERT Input Matrix: confidence band cells readable to screen reader
- Team Sustainability Matrix: state chips HEALTHY, WATCH, AT RISK

## 5. Palette Option D contrast audit

Base `#242D3D` with foreground `#F1F5F9` equals 13.2:1 ratio. Accent `#F5B800` on base equals 8.1:1. All combinations passing. Documented in Design Foundations revision 3.

## 6. Internationalisation

RTL not supported at v1. Language locked to English at v1. Date formats use `en-IN` locale with `DD Mmm YYYY` render.

## 7. Tooling

```
frontend/tests/a11y/
  axe.config.ts          # tag rules, WCAG 2.1 AA disallow list
  pa11y.config.json      # per-URL overrides
  manual-checklist.md    # 12-point list
```

## 8. CI integration

axe runs inline inside each Playwright spec. A single critical violation fails the spec. pa11y-ci nightly produces a dashboard HTML report.

---

*Owner: Frontend subagent. Signoff: Claude.*
