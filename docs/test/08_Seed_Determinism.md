# 08_Seed_Determinism.md
### Seed Determinism | AKB1 Delivery Command Center v1 | Revision 1 | Created: 2026-04-24

> Byte-identicality test for the demo data generator. Owner: Data modeller subagent.

---

## 1. Why this matters

Any contributor cloning the repo and running `make seed` must produce byte-identical demo data. Without this rule, wireframe numbers drift from seeded numbers, PRDs lose credibility, and screenshots in the LinkedIn launch stop matching the live demo. Determinism is a credibility gate.

## 2. Seed source

```python
RANDOM_STATE = numpy.random.RandomState(20260424)
```

20260424 is the project initiation date as an integer. Locked in Data Model PRD revision 3. Do not change without D-xxx decision log entry.

## 3. Entities generated

Ten programmes, 300 people, 25 vendors, 40 scope debt items, 30 decisions, 12 months financials, 14 ai tools, 72 RAID items, 100 change requests, 60 opportunities, 50 qbr records, 25 value realisation records, plus sustainability signals.

## 4. Test procedure

```python
def test_seed_byte_identical():
    # Run seed twice in two temp directories
    out1 = run_seed(temp_dir_1)
    out2 = run_seed(temp_dir_2)
    for entity in ENTITIES:
        with open(f"{temp_dir_1}/{entity}.jsonl") as f1, open(f"{temp_dir_2}/{entity}.jsonl") as f2:
            assert hashlib.sha256(f1.read().encode()).hexdigest() == hashlib.sha256(f2.read().encode()).hexdigest()
```

## 5. Expected hashes

Locked hashes captured in `backend/tests/fixtures/seed_hashes.json`. Any change to the seed generator requires updating these hashes, which requires a Data Model PRD revision bump and an Adi signoff.

## 6. Cross-platform determinism

Tested on Linux x86_64 and macOS arm64. Python 3.12. NumPy pinned to a specific minor version. NumPy minor version bump is a D-decision.

## 7. Known determinism traps

- dict insertion order varies by hash seed: use OrderedDict or sorted keys
- datetime.now() is forbidden in seed: use `SEED_EPOCH = datetime(2026, 4, 24, 0, 0, 0)` as base
- uuid4 generation is forbidden: use `uuid5(namespace, stable_name)`
- random.choice without seed is forbidden: always go through the shared RandomState
- Faker locales can drift across minor versions: pin Faker and its seed

## 8. CI integration

Seed determinism test runs on every PR that touches `backend/app/seed/` or `backend/data/fixtures/`. Failure blocks merge.

## 9. Tampering detection

If the seed output hash diverges from the locked hashes but no generator code has changed, alert for environment drift (e.g. NumPy upgrade, Python minor version change, Docker image rebuild).

---

*Owner: Data modeller subagent. Signoff: Claude.*
