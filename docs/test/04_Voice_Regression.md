# 04_Voice_Regression.md
### Voice Regression | AKB1 Delivery Command Center v1 | Revision 2 | Updated: 2026-04-25

> Revision 2 grows golden snapshots from 45 to 54 covering 3 new tabs at 3 states each (Green, Amber, Red). Locked Hub phrases grow from 5 to 7. Adds wireframe scope per D-031 lesson learned. Revision 1 content preserved below.
>
> Revision 1: Hub voice golden snapshots per tab per state. Owner: Voice QA subagent. Ensures the product language reads like Adi's LinkedIn Hub.

---

## 1. Why voice has its own test layer

The Hub is the product's differentiator. If a Claude-authored intelligence rule or a copy update drifts into generic PPM language, the LinkedIn launch loses credibility. Voice regression catches this drift deterministically.

## 2. Locked Hub phrases

Five phrases are locked in Design Foundations revision 3 and must appear verbatim in the listed surfaces. Deviation fails the test.

| Phrase | Surface |
|--------|---------|
| `Governance is a revenue lever, not overhead` | README first line, About page first paragraph |
| `Green on metrics, red on reality` | Executive amber-state intelligence layer text |
| `Amber equals steering. Red means we failed to decide in amber.` | Intelligence layer tooltip on any amber card |
| `Ten seconds. What is your current margin and what is driving the variance?` | Finance Lead onboarding first screen |
| `Delivery excellence is the retention argument` | Client Health Radar tab subtitle |

## 3. Golden snapshot files

```
tests/voice/golden/
  executive_green.md
  executive_amber.md
  executive_red.md
  delivery_health_green.md
  ... 15 tabs x 3 states = 45 golden files
```

Each golden file contains the full intelligence-layer text (What, Why, Act blocks) produced by the rules engine for a fixed input scenario. Tests run the rules engine against the fixed scenarios and diff output to the golden.

## 4. Scenario fixtures

For every tab, three scenarios are seeded into a fixture:
- Green scenario: all KPIs at target
- Amber scenario: one KPI below target, two at target
- Red scenario: two KPIs below target, one at breach threshold

## 5. Voice rules checked

Beyond the locked phrases, voice QA asserts the following stylistic rules:

1. No em dashes anywhere in output
2. No en dashes anywhere in output
3. No emojis anywhere in output
4. No marketing superlatives (best, amazing, revolutionary, game-changing)
5. No filler openers (In conclusion, To summarise, Essentially, Basically)
6. Every "What" block has a concrete number
7. Every "Why" block ranks at least two drivers with percentages
8. Every "Act" block has a named person and a date
9. Average sentence length under 22 words (Adi's voice bias)
10. Passive voice rate under 15 percent

## 6. Run cadence

Full voice suite on every PR that touches the `intelligence/` folder or any `.md` file in `docs/design/copy/`. Nightly full run.

## 7. Update protocol

Golden snapshot change requires:
1. PR commit note naming the change
2. Voice QA subagent review
3. Adi signoff (captured in the PR body)

No exceptions. Golden files are the voice contract.

## 8. LLM polish mode

When LLM polish is enabled for a deployment, the voice suite additionally runs a prompt injection defence test. Injection vectors listed in `07_Intelligence_Layer_Rules.md` section 5.

---

*Owner: Voice QA subagent. Signoff: Adi.*

---

## Revision 2 amendments (2026-04-25)

Revision 1 content above preserved. Revision 2 additions follow.

### R2.1 Snapshot count growth

| Tab | Snapshots at rev 1 | Snapshots at rev 2 | Delta |
|-----|--------------------|--------------------|-----|
| 12 existing tabs at 3 states | 36 | 36 (re-baselined for rev 4 actions) | 0 |
| Cross-cutting surfaces at 3 states (notifications, exports, history, search) | 9 | 9 | 0 |
| v1_16 Governance Operating Model | 0 | 3 | +3 |
| v1_17 Capability and Supply Chain | 0 | 3 | +3 |
| v1_18 AI Governance | 0 | 3 | +3 |
| **Total** | **45** | **54** | **+9** |

### R2.2 Locked Hub phrase assertions (rev 2)

Phrases assert byte-exact match in DOM render plus wireframe HTML files.

| Phrase | Source | Surface |
|--------|--------|----------|
| "Governance is a revenue lever, not overhead" | rev 1 | README, About |
| "Green on metrics, red on reality" | rev 1 | Executive amber |
| "Amber equals steering. Red means we failed to decide in amber." | rev 1 | Intelligence layer tooltip |
| "Ten seconds. What is your current margin and what is driving the variance?" | rev 1 | Finance Lead onboarding |
| "Delivery excellence is the retention argument" | rev 1 | Client Health subtitle |
| **"Governance that does not decide is theatre"** | **rev 2 NEW** | **v1_16 subtitle, Cadence Theatre Detection panel header** |
| **"The director sees across. The delivery manager walks each one"** | **rev 2 NEW** | **v1_01 PO and DD subtitle, Board Pack slide 2** |

Total: 7 locked phrases.

### R2.3 New action-line snapshots (rev 4 intelligence layer)

Every new action card from rev 4 PRDs locked into a snapshot:

```
governance_theatre_action.snap = "Move cadence from monthly to fortnightly."
governance_contract_stale_action.snap = "Re-validate escalation contract before next steerco."
governance_sponsor_mute_action.snap = "Book 1-on-1 with sponsor within 7 days."
capability_dm_action.snap = "Open formal succession programme with named ready successors."
capability_bench_action.snap = "Reskill or Rebadge bench aging above 45 days within 30 days."
capability_hiring_stalled_action.snap = "Escalate vendor panel expansion or review role requirements."
ai_governance_red_pending_action.snap = "Clear the N Pending Red-tier backlog; assign bias assessments within 7 days."
ai_governance_shadow_action.snap = "Move Shadow Survey from quarterly to monthly and publish results to steerco."
ai_governance_speed_gap_action.snap = "Individual productivity is up but throughput is flat."
delivery_evm_red_action.snap = "Open scope review within 48 hours per S01P6 threshold."
financials_leakage_action.snap = "Audit the dominant mechanism and scope recovery within 14 days."
commercial_concentration_action.snap = "Open diversification conversation with Portfolio Owner within 30 days."
commercial_qbr_theatre_action.snap = "Re-plan next QBR around 3 outcome decisions, not 42 slides."
change_impact_bypass_action.snap = "Audit change control discipline. Per S06P8 the 3x multiplier is real."
```

Total new action snapshots at rev 2: 14. These are tested with byte-exact match.

### R2.4 Em-dash gate extended to wireframes (D-031 lesson)

Per D-031 lesson learned, the voice regression scope extends to wireframe HTML files:

```
test_no_em_dash_in_wireframes:
  given: docs/wireframes/*.html
  when: grep for em dash character
  expect: zero matches except legitimate workspace path references

test_no_em_dash_in_prds:
  given: docs/prd/*.md
  when: grep
  expect: zero matches

test_no_em_dash_in_test_docs:
  given: docs/test/*.md
  when: grep
  expect: zero matches

test_no_em_dash_in_architecture:
  given: docs/architecture/*.md
  when: grep
  expect: zero matches except legitimate workspace path references
```

CI runs these checks on every PR. Failure blocks merge.

### R2.5 LLM polish guard

Per D-017 LLM injection policy:

```
test_voice_regression_in_rules_only_mode:
  given: APP_INTELLIGENCE_MODE='rules_only' (default)
  expect: all voice snapshots render byte-identical to locked golden files

test_voice_regression_in_llm_polish_mode:
  given: APP_INTELLIGENCE_MODE='llm_polish' (opt-in)
  expect: action verbs match Design Foundations section 12 taxonomy
  expect: locked Hub phrases preserved verbatim
  warn: snapshot tolerance allows minor word substitution outside locked phrase regions
```

### R2.6 Release gating (revision 2 additions)

Revision 2 ships when:
1. 54 golden snapshots locked
2. 7 Hub phrase assertions green
3. 14 new action-line snapshots locked
4. Em-dash gate extended to wireframes (zero violations across all 4 doc folders)
5. LLM polish mode preserves locked phrases under fuzzing

---

*Revision 2 owner: Claude. Signoff: Adi (pending). 54 golden snapshots, 7 locked phrases, em-dash gate extended.*
