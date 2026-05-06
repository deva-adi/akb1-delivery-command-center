/**
 * Unit tests for buildDiffLines in lib/audit-console.ts.
 *
 * Covers: null diff handling, added/removed/changed/unchanged classification,
 * and mixed diffs. These are the pure-logic tests for the side-by-side
 * split-diff view rendered inside AuditActivityStream.
 *
 * noUncheckedIndexedAccess is active: array[n] accesses carry !
 * where a preceding toHaveLength guard proves existence.
 */

import { describe, it, expect } from "vitest";
import { buildDiffLines, type AuditEntryDiff } from "@/lib/audit-console";

function makeDiff(overrides: Partial<AuditEntryDiff> = {}): AuditEntryDiff {
  return {
    added: {},
    removed: {},
    changed: {},
    ...overrides,
  };
}

describe("buildDiffLines", () => {
  describe("null diff handling (one or both sides null)", () => {
    it("returns empty arrays when both sides are null and diff is null", () => {
      const { beforeLines, afterLines } = buildDiffLines(null, null, null);
      expect(beforeLines).toHaveLength(0);
      expect(afterLines).toHaveLength(0);
    });

    it("returns before side as unchanged when diff is null and only before is non-null", () => {
      const { beforeLines, afterLines } = buildDiffLines(
        { approval_status: "Pending" },
        null,
        null,
      );
      expect(beforeLines).toHaveLength(1);
      expect(beforeLines[0]!.kind).toBe("unchanged");
      expect(beforeLines[0]!.key).toBe("approval_status");
      expect(afterLines).toHaveLength(0);
    });

    it("returns after side as unchanged when diff is null and only after is non-null", () => {
      const { beforeLines, afterLines } = buildDiffLines(
        null,
        { approval_status: "Approved" },
        null,
      );
      expect(afterLines).toHaveLength(1);
      expect(afterLines[0]!.kind).toBe("unchanged");
      expect(beforeLines).toHaveLength(0);
    });

    it("returns both sides as unchanged when diff is null and both are non-null", () => {
      const data = { foo: "bar" };
      const { beforeLines, afterLines } = buildDiffLines(data, data, null);
      expect(beforeLines[0]!.kind).toBe("unchanged");
      expect(afterLines[0]!.kind).toBe("unchanged");
    });
  });

  describe("removed keys", () => {
    it("marks a key as removed in before side", () => {
      const before = { display_label: "old" };
      const after = {};
      const diff = makeDiff({ removed: { display_label: "old" } });
      const { beforeLines, afterLines } = buildDiffLines(before, after, diff);
      expect(beforeLines).toHaveLength(1);
      expect(beforeLines[0]!.kind).toBe("removed");
      expect(beforeLines[0]!.key).toBe("display_label");
      expect(afterLines).toHaveLength(0);
    });
  });

  describe("added keys", () => {
    it("marks a key as added in after side", () => {
      const before = {};
      const after = { approved_by: "user-uuid" };
      const diff = makeDiff({ added: { approved_by: "user-uuid" } });
      const { beforeLines, afterLines } = buildDiffLines(before, after, diff);
      expect(afterLines).toHaveLength(1);
      expect(afterLines[0]!.kind).toBe("added");
      expect(afterLines[0]!.key).toBe("approved_by");
      expect(beforeLines).toHaveLength(0);
    });
  });

  describe("changed keys", () => {
    it("marks a key as changed-before in before side and changed-after in after side", () => {
      const before = { approval_status: "Pending" };
      const after = { approval_status: "Approved" };
      const diff = makeDiff({
        changed: {
          approval_status: { before: "Pending", after: "Approved" },
        },
      });
      const { beforeLines, afterLines } = buildDiffLines(before, after, diff);
      expect(beforeLines).toHaveLength(1);
      expect(beforeLines[0]!.kind).toBe("changed-before");
      expect(beforeLines[0]!.value).toBe("Pending");
      expect(afterLines).toHaveLength(1);
      expect(afterLines[0]!.kind).toBe("changed-after");
      expect(afterLines[0]!.value).toBe("Approved");
    });
  });

  describe("unchanged keys", () => {
    it("marks keys present in both with the same value as unchanged on both sides", () => {
      const data = { stable: "constant", nested: { x: 1 } };
      const diff = makeDiff();
      const { beforeLines, afterLines } = buildDiffLines(data, data, diff);
      expect(beforeLines).toHaveLength(2);
      expect(afterLines).toHaveLength(2);
      expect(beforeLines.every((l) => l.kind === "unchanged")).toBe(true);
      expect(afterLines.every((l) => l.kind === "unchanged")).toBe(true);
    });
  });

  describe("mixed diff", () => {
    it("correctly classifies removed, changed, unchanged, and added in one snapshot pair", () => {
      const before = {
        removed_key: "gone",
        changed_key: "old_value",
        stable_key: "constant",
      };
      const after = {
        added_key: "new",
        changed_key: "new_value",
        stable_key: "constant",
      };
      const diff = makeDiff({
        added:   { added_key: "new" },
        removed: { removed_key: "gone" },
        changed: { changed_key: { before: "old_value", after: "new_value" } },
      });

      const { beforeLines, afterLines } = buildDiffLines(before, after, diff);

      const beforeKinds = beforeLines.map((l) => l.kind);
      const afterKinds = afterLines.map((l) => l.kind);

      expect(beforeKinds).toContain("removed");
      expect(beforeKinds).toContain("changed-before");
      expect(beforeKinds).toContain("unchanged");

      expect(afterKinds).toContain("added");
      expect(afterKinds).toContain("changed-after");
      expect(afterKinds).toContain("unchanged");
    });
  });

  describe("value forwarding", () => {
    it("carries the original value for unchanged lines", () => {
      const before = { tier: 3 };
      const after = { tier: 3 };
      const diff = makeDiff();
      const { beforeLines } = buildDiffLines(before, after, diff);
      expect(beforeLines[0]!.value).toBe(3);
    });

    it("carries the before value from diff.changed for changed-before lines", () => {
      const before = { active: true };
      const after = { active: false };
      const diff = makeDiff({
        changed: { active: { before: true, after: false } },
      });
      const { beforeLines } = buildDiffLines(before, after, diff);
      expect(beforeLines[0]!.value).toBe(true);
    });

    it("carries the after value from diff.changed for changed-after lines", () => {
      const before = { active: true };
      const after = { active: false };
      const diff = makeDiff({
        changed: { active: { before: true, after: false } },
      });
      const { afterLines } = buildDiffLines(before, after, diff);
      expect(afterLines[0]!.value).toBe(false);
    });
  });
});
