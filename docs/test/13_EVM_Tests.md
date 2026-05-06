# 13_EVM_Tests.md
### EVM Test Plan | AKB1 Delivery Command Center v1 | Revision 1 | Updated: 2026-04-25

> Test plan for Earned Value Management calculations introduced at rev 4. Covers UC-P. Anchors PRD 05 (Delivery Health) rev 4 R4.7 and PRD 09 (P and L Cockpit) rev 4 R4.6 release gating.

---

## 1. Scope

EVM formula correctness across `evm_snapshots` entity. CPI, SPI, TCPI, EAC, ETC, VAC are GENERATED ALWAYS AS STORED columns per Q6 ruling. Test plan validates every formula matches PMI EVM convention plus the v1.0.0 threshold band logic from `threshold_calibration_register`.

## 2. Test layers

| Layer | Coverage |
|-------|----------|
| Unit | Formula correctness for CPI, SPI, TCPI, EAC, ETC, VAC. State enum derivation. Database GENERATED column behaviour |
| Integration | EVM snapshot endpoint contract, cross-surface consistency between v1_02 and v1_06 |
| E2E | EVM Quartet card rendering with threshold colours |
| Voice | EVM-specific actions ("Open scope review within 48 hours") |

## 3. Unit tests: formula correctness

### 3.1 CPI calculation

```
test_cpi_basic:
  given: ev_usd=950000, ac_usd=1000000
  expect: cpi == 0.95

test_cpi_underrun:
  given: ev_usd=1100000, ac_usd=1000000
  expect: cpi == 1.10

test_cpi_zero_ac_returns_null:
  given: ev_usd=950000, ac_usd=0
  expect: cpi is null (not divide by zero)

test_cpi_precision:
  given: ev_usd=948500, ac_usd=1000000
  expect: cpi == 0.948 (3 decimal precision)
```

### 3.2 SPI calculation

```
test_spi_basic:
  given: ev_usd=950000, pv_usd=1000000
  expect: spi == 0.950

test_spi_ahead_of_schedule:
  given: ev_usd=1050000, pv_usd=1000000
  expect: spi == 1.050
```

### 3.3 TCPI calculation

```
test_tcpi_calculation:
  given: bac_usd=10000000, ev_usd=4500000, ac_usd=4750000
  expect: tcpi == (10000000-4500000) / (10000000-4750000) ~= 1.048

test_tcpi_at_completion_returns_null:
  given: bac_usd == ac_usd (100 percent of budget consumed)
  expect: tcpi is null
```

### 3.4 EAC calculation

```
test_eac_at_current_cpi:
  given: bac_usd=10000000, cpi=0.92
  expect: eac_usd == 10000000 / 0.92 ~= 10869565

test_eac_when_cpi_null:
  given: cpi is null
  expect: eac_usd is null
```

### 3.5 VAC and ETC

```
test_vac_calculation:
  given: bac_usd=10000000, eac_usd=10869565
  expect: vac_usd == 10000000 - 10869565 == -869565

test_etc_calculation:
  given: eac_usd=10869565, ac_usd=4750000
  expect: etc_usd == 10869565 - 4750000 == 6119565
```

### 3.6 State enum derivation

```
test_state_failing_when_cpi_below_0_85:
  given: cpi=0.83, spi=0.92
  expect: state == 'Failing'

test_state_failing_when_spi_below_0_85:
  given: cpi=0.95, spi=0.82
  expect: state == 'Failing'

test_state_slipping_in_amber_band:
  given: cpi=0.92, spi=0.93
  expect: state == 'Slipping'

test_state_watching_when_one_metric_amber:
  given: cpi=0.96, spi=0.93
  expect: state == 'Watching'

test_state_healthy_both_above_0_95:
  given: cpi=0.97, spi=0.96
  expect: state == 'Healthy'
```

## 4. Database GENERATED column tests

```
test_generated_column_stored_postgres_16:
  given: insert evm_snapshots row with bac, ac, ev, pv values
  expect:
    - cpi, spi, tcpi, eac, etc, vac populated by Postgres at insert time
    - GENERATED ALWAYS AS STORED (not virtual)
    - subsequent SELECT returns same values without recomputation

test_generated_column_recomputes_on_update:
  given: existing row, then UPDATE bac
  expect: tcpi, eac, vac updated automatically by Postgres trigger

test_generated_column_immutable_to_user_writes:
  given: attempt UPDATE evm_snapshots SET cpi=1.5
  expect: Postgres error "cannot insert into generated column"
```

## 5. Integration tests

### 5.1 Endpoint contract

```
test_evm_snapshot_endpoint:
  GET /api/v1/delivery-health/evm-snapshot?programme=PEGASUS
  expect schema: {
    bac_usd, ac_usd, ev_usd, pv_usd, cpi, spi, tcpi, eac_usd, etc_usd, vac_usd, state, as_of_date
  }

test_evm_portfolio_endpoint:
  GET /api/v1/delivery-health/evm-portfolio
  expect: portfolio aggregate of state distribution across 10 programmes
```

### 5.2 Cross-surface consistency

```
test_evm_values_match_between_v1_02_and_v1_06:
  given: Pegasus EVM snapshot for current month
  when: query v1_02 endpoint and v1_06 endpoint
  expect: cpi, spi, tcpi, eac values byte-identical
  rationale: same source row, two surfaces
```

## 6. E2E tests

```
test "EVM Quartet renders with threshold colours":
  login as PO
  visit /delivery-health
  assert CPI card amber when 0.92
  assert SPI card amber when 0.88
  assert TCPI card green when 1.04
  assert EAC card red when VAC negative

test "CPI red triggers action":
  given: programme with cpi=0.83
  visit /delivery-health
  assert action card "Open scope review within 48 hours" present
```

## 7. Voice regression

| Snapshot | Phrase |
|----------|--------|
| `evm_cpi_red_action.snap` | "Open scope review within 48 hours per S01P6 threshold." |
| `evm_correlation_action.snap` | "Margin variance has a measured delivery antecedent. Review with Delivery Director." |

## 8. Performance benchmarks

| Endpoint | Target |
|----------|--------|
| GET /delivery-health/evm-snapshot?programme={code} | p95 under 100 ms (single row) |
| GET /delivery-health/evm-portfolio | p95 under 200 ms (10 programmes) |
| GET /delivery-health/evm-trend?programme={code}&months=12 | p95 under 250 ms (12 rows) |

## 9. Acceptance gate

Test plan ships when:
1. 17 unit tests green covering all formulas
2. GENERATED STORED column behaviour verified on Postgres 16
3. State enum transitions match threshold register
4. Cross-surface values byte-identical between v1_02 and v1_06
5. Voice snapshots locked
6. Performance gates met
7. Hub anchor verified: CPI below 0.95 fires 48-hour scope review action per S01P6

---

*Revision 1 owner: Claude. Signoff: Adi (pending). Anchors EVM formula correctness across v1_02 and v1_06.*
