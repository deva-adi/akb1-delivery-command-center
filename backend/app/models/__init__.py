"""ORM models.

Importing this package registers every model on Base.metadata so Alembic
can see the full schema. Add new model modules here as they land.
"""

from app.models.audit_trail_entries import AuditTrailEntry
from app.models.escalation_tier_config import EscalationTierConfig
from app.models.people import Person
from app.models.person_programme_assignment import PersonProgrammeAssignment
from app.models.programme_health_snapshot import ProgrammeHealthSnapshot
from app.models.programme_milestone import ProgrammeMilestone
from app.models.programme_raid import ProgrammeRaid
from app.models.programmes import Programme
from app.models.threshold_calibration_register import ThresholdCalibrationRegister

__all__ = [
    "AuditTrailEntry",
    "EscalationTierConfig",
    "Person",
    "PersonProgrammeAssignment",
    "ProgrammeHealthSnapshot",
    "ProgrammeMilestone",
    "ProgrammeRaid",
    "Programme",
    "ThresholdCalibrationRegister",
]
