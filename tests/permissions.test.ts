import { describe, it, expect } from "vitest";
import { hasMinRole, checkPermission, PERMISSIONS } from "@/lib/auth/permissions";
import type { Role } from "@/lib/auth/permissions";

describe("Permission System", () => {
  describe("hasMinRole", () => {
    it("owner has all roles", () => {
      expect(hasMinRole("owner", "owner")).toBe(true);
      expect(hasMinRole("owner", "admin")).toBe(true);
      expect(hasMinRole("owner", "member")).toBe(true);
      expect(hasMinRole("owner", "viewer")).toBe(true);
    });

    it("admin has admin, member, viewer but not owner", () => {
      expect(hasMinRole("admin", "owner")).toBe(false);
      expect(hasMinRole("admin", "admin")).toBe(true);
      expect(hasMinRole("admin", "member")).toBe(true);
      expect(hasMinRole("admin", "viewer")).toBe(true);
    });

    it("member has member and viewer but not admin or owner", () => {
      expect(hasMinRole("member", "owner")).toBe(false);
      expect(hasMinRole("member", "admin")).toBe(false);
      expect(hasMinRole("member", "member")).toBe(true);
      expect(hasMinRole("member", "viewer")).toBe(true);
    });

    it("viewer only has viewer", () => {
      expect(hasMinRole("viewer", "owner")).toBe(false);
      expect(hasMinRole("viewer", "admin")).toBe(false);
      expect(hasMinRole("viewer", "member")).toBe(false);
      expect(hasMinRole("viewer", "viewer")).toBe(true);
    });
  });

  describe("checkPermission", () => {
    it("owner can do everything", () => {
      for (const key of Object.keys(PERMISSIONS) as (keyof typeof PERMISSIONS)[]) {
        expect(checkPermission("owner", key)).toBe(true);
      }
    });

    it("viewer can only view dashboard", () => {
      expect(checkPermission("viewer", "viewDashboard")).toBe(true);
      expect(checkPermission("viewer", "manageSettings")).toBe(false);
      expect(checkPermission("viewer", "manageTeam")).toBe(false);
      expect(checkPermission("viewer", "createJob")).toBe(false);
      expect(checkPermission("viewer", "manageCandidates")).toBe(false);
    });

    it("member can create jobs and manage candidates but not settings", () => {
      expect(checkPermission("member", "createJob")).toBe(true);
      expect(checkPermission("member", "manageCandidates")).toBe(true);
      expect(checkPermission("member", "manageSettings")).toBe(false);
      expect(checkPermission("member", "manageTeam")).toBe(false);
      expect(checkPermission("member", "deleteJob")).toBe(false);
      expect(checkPermission("member", "bulkOperations")).toBe(false);
    });

    it("admin can manage settings and team but not everything", () => {
      expect(checkPermission("admin", "manageSettings")).toBe(true);
      expect(checkPermission("admin", "manageTeam")).toBe(true);
      expect(checkPermission("admin", "createJob")).toBe(true);
      expect(checkPermission("admin", "deleteJob")).toBe(true);
      expect(checkPermission("admin", "bulkOperations")).toBe(true);
    });
  });

  describe("PERMISSIONS matrix completeness", () => {
    const allRoles: Role[] = ["owner", "admin", "member", "viewer"];

    it("every permission has at least one role", () => {
      for (const [key, roles] of Object.entries(PERMISSIONS)) {
        expect(roles.length).toBeGreaterThan(0);
        for (const role of roles) {
          expect(allRoles).toContain(role);
        }
      }
    });

    it("viewDashboard is available to all roles", () => {
      expect(PERMISSIONS.viewDashboard).toEqual(["owner", "admin", "member", "viewer"]);
    });
  });
});
