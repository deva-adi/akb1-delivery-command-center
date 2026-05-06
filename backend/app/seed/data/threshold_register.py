"""60-metric threshold_calibration_register seed payload.

Transcribed verbatim from Data Model PRD rev 4 section 5.2. Every numeric
value, direction enum, owning role, and rationale string is byte-locked.
Changes post v1.0.0 require a D-decision per Design Foundations R4.2.

Convention used to map the section 5.2 prose ("above 28.0 / 25.0 to 27.99 /
below 25.0") into the three threshold columns:

  HigherIsBetter
    green_threshold  = the value defining the green and amber boundary
                       (value at or above this is green)
    amber_threshold  = the value defining the amber and red boundary
                       (value at or above this is amber)
    red_threshold    = same as amber_threshold (red is value below)

  LowerIsBetter
    green_threshold  = the value defining the green and amber boundary
                       (value below this is green)
    amber_threshold  = the value defining the amber and red boundary
                       (value below this is amber)
    red_threshold    = same as amber_threshold (red is value at or above)

  RangeIsBetter
    range_lower      = lower edge of the green band
    range_upper      = upper edge of the green band
    green_threshold  = midpoint of the green band (ideal value)
    amber_threshold  = lower outer amber boundary (red below this)
    red_threshold    = upper outer amber boundary (red above this)
"""

from __future__ import annotations


# (metric_id, display_name, direction, green, amber, red, range_lower, range_upper, rationale, owning_role)
# Total: 8 + 10 + 10 + 8 + 6 + 8 + 6 + 4 = 60
THRESHOLD_REGISTER_SEED: list[tuple] = [
    # ------------------------------------------------------------------
    # 5.2.1 Executive and Portfolio cluster (8)
    # ------------------------------------------------------------------
    ("portfolio_margin_pct", "Portfolio Margin Percent", "HigherIsBetter",
     28.0, 25.0, 25.0, None, None,
     "Services industry target blended margin; below 25 triggers commercial review",
     "FinanceLead"),
    ("portfolio_drift_delta_points", "Portfolio Drift Delta Points", "LowerIsBetter",
     1.0, 3.0, 3.0, None, None,
     "Every-programme-green-portfolio-bleeding pattern flagged at 3.0 pp gap per S10 Portfolio Desk manifesto",
     "PortfolioOwner"),
    ("account_concentration_revenue_pct", "Account Concentration Revenue Percent", "LowerIsBetter",
     15.0, 25.0, 25.0, None, None,
     "Above 25 percent means one client drop exceeds recoverable window",
     "PortfolioOwner"),
    ("portfolio_forecast_p95_spread_pct", "Portfolio Forecast p95 Spread Percent", "LowerIsBetter",
     10.0, 20.0, 20.0, None, None,
     "Wider than 20 percent p95 spread indicates forecast is not actionable",
     "FinanceLead"),
    ("growth_expansion_multiple", "Growth Expansion Multiple", "HigherIsBetter",
     1.5, 1.1, 1.1, None, None,
     "Delivery-led growth multiple target from S05P3 retail pattern",
     "PortfolioOwner"),
    ("value_realisation_score", "Value Realisation Score", "HigherIsBetter",
     75, 50, 50, None, None,
     "Client-confirmed 100 outcomes weighted; below 50 means business case unfulfilled",
     "PortfolioOwner"),
    ("over_optimism_green_streak_weeks", "Over Optimism Green Streak Weeks", "LowerIsBetter",
     8, 12, 12, None, None,
     "Per S06P2 and S07A1 green-until-red pattern",
     "PortfolioOwner"),
    ("stakeholder_decision_maker_support_score", "Stakeholder Decision Maker Support Score", "HigherIsBetter",
     50, 0, 0, None, None,
     "Negative means opposing decision-maker; below zero blocks progress",
     "PortfolioOwner"),

    # ------------------------------------------------------------------
    # 5.2.2 Governance cluster (10)
    # ------------------------------------------------------------------
    ("decision_latency_days", "Decision Latency Days", "LowerIsBetter",
     2.0, 5.0, 5.0, None, None,
     "S04P2 decision velocity target; above 5 days indicates theatre",
     "PortfolioOwner"),
    ("decision_queue_open_count", "Decision Queue Open Count", "LowerIsBetter",
     5, 10, 10, None, None,
     "More than 10 open decisions per programme signals governance overload",
     "PortfolioOwner"),
    ("governance_cadence_attendance_pct", "Governance Cadence Attendance Percent", "HigherIsBetter",
     90, 70, 70, None, None,
     "S04P5 attendance threshold for working cadence",
     "PortfolioOwner"),
    ("cadence_theatre_count_per_programme", "Cadence Theatre Count Per Programme", "LowerIsBetter",
     1, 3, 3, None, None,
     "More than 2 cadences classified Theatre signals stack collapse",
     "PortfolioOwner"),
    ("raci_gap_pct", "RACI Gap Percent", "LowerIsBetter",
     5.0, 10.0, 10.0, None, None,
     "Gap above 10 percent means responsibility holes in working grid",
     "PortfolioOwner"),
    ("raci_overlap_pct", "RACI Overlap Percent", "LowerIsBetter",
     8.0, 15.0, 15.0, None, None,
     "Overlap above 15 percent means competing accountability",
     "PortfolioOwner"),
    ("escalation_contract_staleness_days", "Escalation Contract Staleness Days", "LowerIsBetter",
     90, 180, 180, None, None,
     "Contract older than 180 days without re-validation is unenforceable",
     "PortfolioOwner"),
    ("steerco_pre_read_issuance_pct", "Steerco Pre Read Issuance Percent", "HigherIsBetter",
     90, 70, 70, None, None,
     "Pre-read issuance below 70 percent means steerco becomes post-read",
     "PortfolioOwner"),
    ("weekly_commitment_delta_abs_pct", "Weekly Commitment Delta Abs Percent", "LowerIsBetter",
     10.0, 20.0, 20.0, None, None,
     "Commitment delta above 20 percent indicates planning dysfunction per S04P5",
     "ProgrammeManager"),
    ("sponsor_engagement_score", "Sponsor Engagement Score", "HigherIsBetter",
     70, 40, 40, None, None,
     "S04P2 sponsor-on-mute pattern triggers below 40",
     "PortfolioOwner"),

    # ------------------------------------------------------------------
    # 5.2.3 Delivery Health cluster (10)
    # ------------------------------------------------------------------
    ("cpi", "Cost Performance Index", "HigherIsBetter",
     0.95, 0.85, 0.85, None, None,
     "S08P6 EVM CPI below 0.95 triggers 48-hour scope review per S01P6",
     "FinanceLead"),
    ("spi", "Schedule Performance Index", "HigherIsBetter",
     0.95, 0.85, 0.85, None, None,
     "S08P6 EVM SPI below 0.85 triggers planning reset per S01P6",
     "ProgrammeManager"),
    ("tcpi", "To Complete Performance Index", "RangeIsBetter",
     1.0, 0.9, 1.1, 0.95, 1.05,
     "TCPI outside 0.95 to 1.05 signals EAC divergence",
     "FinanceLead"),
    ("estimation_variance_pct", "Estimation Variance Percent", "LowerIsBetter",
     10.0, 20.0, 20.0, None, None,
     "S04P1 silent baseline threshold for re-estimate",
     "ProgrammeManager"),
    ("over_optimism_variance_pct", "Over Optimism Variance Percent", "LowerIsBetter",
     5.0, 10.0, 10.0, None, None,
     "Prediction vs actual divergence above 10 percent is unreliable reporting",
     "ProgrammeManager"),
    ("transition_readiness_pct", "Transition Readiness Percent", "HigherIsBetter",
     85, 70, 70, None, None,
     "Below 70 percent readiness is a cutover risk per S06P7",
     "ProgrammeManager"),
    ("closeout_readiness_pct", "Closeout Readiness Percent", "HigherIsBetter",
     85, 60, 60, None, None,
     "S08P10 closeout discipline threshold",
     "ProgrammeManager"),
    ("scope_definition_score", "Scope Definition Score", "HigherIsBetter",
     75, 50, 50, None, None,
     "S06P1 kickoff-quality benchmark",
     "ProgrammeManager"),
    ("dora_lead_time_days", "DORA Lead Time Days", "LowerIsBetter",
     7.0, 30.0, 30.0, None, None,
     "DORA Accelerate High band upper bound",
     "ProgrammeManager"),
    ("dora_change_failure_rate_pct", "DORA Change Failure Rate Percent", "LowerIsBetter",
     15.0, 30.0, 30.0, None, None,
     "DORA Accelerate High band upper bound",
     "ProgrammeManager"),

    # ------------------------------------------------------------------
    # 5.2.4 Financials and PnL cluster (8)
    # ------------------------------------------------------------------
    ("programme_margin_pct", "Programme Margin Percent", "HigherIsBetter",
     28.0, 22.0, 22.0, None, None,
     "Programme-level floor; below 22 percent triggers recovery protocol",
     "FinanceLead"),
    ("dso_days", "Days Sales Outstanding", "LowerIsBetter",
     45, 60, 60, None, None,
     "Industry DSO convention; above 60 days is working-capital risk",
     "FinanceLead"),
    ("rate_card_drift_pct", "Rate Card Drift Percent", "RangeIsBetter",
     0.0, -5.0, 5.0, -2.0, 2.0,
     "S08P3 rate card arbitrage threshold",
     "FinanceLead"),
    ("utilization_max_gap_points", "Utilization Max Gap Points", "LowerIsBetter",
     3.0, 7.0, 7.0, None, None,
     "Multi-system gap above 7 points indicates data-integrity issue per S08P4",
     "FinanceLead"),
    ("revenue_leakage_usd_per_month", "Revenue Leakage USD Per Month", "LowerIsBetter",
     15000, 50000, 50000, None, None,
     "Five-mechanism cumulative floor per S08P7",
     "FinanceLead"),
    ("five_leak_anatomy_bps", "Five Leak Anatomy Basis Points", "LowerIsBetter",
     150, 400, 400, None, None,
     "S04P4 margin leak compression threshold; 810 bps is the extreme example",
     "FinanceLead"),
    ("cr_processing_ratio", "Change Request Processing Ratio", "LowerIsBetter",
     0.25, 0.50, 0.50, None, None,
     "S08P8 CR processing cost exceeds change value beyond 0.5",
     "ProgrammeManager"),
    ("urgent_bypass_rate_pct", "Urgent Bypass Rate Percent", "LowerIsBetter",
     10.0, 25.0, 25.0, None, None,
     "S06P8 3x multiplier applied; above 25 percent bypass indicates broken change control",
     "ProgrammeManager"),

    # ------------------------------------------------------------------
    # 5.2.5 Commercial cluster (6)
    # ------------------------------------------------------------------
    ("pipeline_coverage_ratio", "Pipeline Coverage Ratio", "HigherIsBetter",
     3.0, 2.0, 2.0, None, None,
     "Pipeline to quota coverage industry convention",
     "PortfolioOwner"),
    ("qbr_cadence_on_time_pct", "QBR Cadence On Time Percent", "HigherIsBetter",
     90, 75, 75, None, None,
     "QBR slippage threshold per S08P9",
     "PortfolioOwner"),
    ("qbr_quality_score", "QBR Quality Score", "HigherIsBetter",
     75, 50, 50, None, None,
     "Hub 17-minute QBR quality benchmark",
     "PortfolioOwner"),
    ("qbr_theatre_flag_count", "QBR Theatre Flag Count", "LowerIsBetter",
     1, 3, 3, None, None,
     "More than 2 theatre-flag QBRs per quarter is systemic",
     "PortfolioOwner"),
    ("renewal_probability_pct", "Renewal Probability Percent", "HigherIsBetter",
     80, 60, 60, None, None,
     "Renewal probability floor to avoid revenue cliff",
     "FinanceLead"),
    ("contract_renewal_window_days_to_close", "Contract Renewal Window Days to Close", "LowerIsBetter",
     30, 60, 60, None, None,
     "Artefact expiring in more than 60 days window is low-priority; inside 30 is act-now",
     "FinanceLead"),

    # ------------------------------------------------------------------
    # 5.2.6 People and Capability cluster (8)
    # ------------------------------------------------------------------
    ("utilization_pct", "Utilization Percent", "HigherIsBetter",
     80.0, 72.0, 72.0, None, None,
     "S01P6 utilization floor; below 72 compounds bench cost",
     "FinanceLead"),
    ("overtime_hours_pct", "Overtime Hours Percent", "LowerIsBetter",
     10.0, 20.0, 20.0, None, None,
     "Workforce sustainability threshold per rev 3",
     "PortfolioOwner"),
    ("bus_factor", "Bus Factor", "HigherIsBetter",
     4, 2, 2, None, None,
     "Bus factor 1 is a single point of failure",
     "PortfolioOwner"),
    ("team_health_index", "Team Health Index", "HigherIsBetter",
     70, 50, 50, None, None,
     "Composite of bus factor, overtime, sentiment",
     "PortfolioOwner"),
    ("attrition_rate_pct_ttm", "Attrition Rate Percent TTM", "LowerIsBetter",
     12.0, 18.0, 18.0, None, None,
     "Industry attrition floor for sustained delivery",
     "PortfolioOwner"),
    ("bench_aging_days", "Bench Aging Days", "LowerIsBetter",
     21, 45, 45, None, None,
     "Rev 4 bench aging bands per 4.38 entity design",
     "PortfolioOwner"),
    ("dm_succession_readiness_score", "DM Succession Readiness Score", "HigherIsBetter",
     60, 30, 30, None, None,
     "Below 30 means no ready successor per S10 Part 05",
     "PortfolioOwner"),
    ("hiring_funnel_time_to_fill_days", "Hiring Funnel Time to Fill Days", "LowerIsBetter",
     45, 90, 90, None, None,
     "90 days open role signals funnel break",
     "PortfolioOwner"),

    # ------------------------------------------------------------------
    # 5.2.7 Risk, SLA, and Client Health cluster (6)
    # ------------------------------------------------------------------
    ("raid_risk_count_high", "RAID Risk Count High", "LowerIsBetter",
     3, 6, 6, None, None,
     "High-severity risk count per programme; above 6 is overload",
     "ProgrammeManager"),
    ("escalation_timing_late_pct", "Escalation Timing Late Percent", "LowerIsBetter",
     15.0, 30.0, 30.0, None, None,
     "S06P6 escalate-early principle; late above 30 percent is culture issue",
     "PortfolioOwner"),
    ("sla_tier1_breach_count_mtd", "SLA Tier 1 Breach Count MTD", "LowerIsBetter",
     1, 2, 2, None, None,
     "S01P6 SLA Tier 1 breach triggers escalation",
     "ProgrammeManager"),
    ("incident_p1_mttr_hours", "Incident P1 MTTR Hours", "LowerIsBetter",
     4.0, 8.0, 8.0, None, None,
     "P1 incident recovery time industry convention",
     "ProgrammeManager"),
    ("client_health_composite", "Client Health Composite", "HigherIsBetter",
     70, 50, 50, None, None,
     "Rev 3 composite signal floor",
     "PortfolioOwner"),
    ("audit_trail_write_events_per_day", "Audit Trail Write Events Per Day", "RangeIsBetter",
     2525.0, 10.0, 20000.0, 50.0, 5000.0,
     "Range detects both silent governance (too low) and incident storm (too high)",
     "PortfolioOwner"),

    # ------------------------------------------------------------------
    # 5.2.8 AI and Innovation cluster (4)
    # ------------------------------------------------------------------
    ("ai_risk_red_count", "AI Risk Red Count", "LowerIsBetter",
     1, 4, 4, None, None,
     "Red-tier AI use cases without mitigations per S03",
     "PortfolioOwner"),
    ("ai_quality_gate_pass_rate_pct", "AI Quality Gate Pass Rate Percent", "HigherIsBetter",
     95.0, 85.0, 85.0, None, None,
     "S03 quality-gate rigor",
     "PortfolioOwner"),
    ("ai_shadow_discovery_count", "AI Shadow Discovery Count", "LowerIsBetter",
     3, 10, 10, None, None,
     "Shadow IT count from quarterly survey per S03 Part 1",
     "PortfolioOwner"),
    ("ai_delivery_speed_gap_points", "AI Delivery Speed Gap Points", "LowerIsBetter",
     10, 25, 25, None, None,
     "S02P4 productivity-vs-throughput gap threshold",
     "PortfolioOwner"),
]


assert len(THRESHOLD_REGISTER_SEED) == 60, (
    f"Threshold register seed must contain exactly 60 metrics per "
    f"Data Model PRD section 5.2; got {len(THRESHOLD_REGISTER_SEED)}"
)
