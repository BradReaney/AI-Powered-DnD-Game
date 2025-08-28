import { cn } from "../../lib/utils";

describe("Utility Functions", () => {
  describe("cn function", () => {
    it("should merge class names correctly", () => {
      const result = cn("base-class", "additional-class", "another-class");
      expect(result).toBe("base-class additional-class another-class");
    });

    it("should handle conditional classes", () => {
      const isActive = true;
      const result = cn(
        "base-class",
        isActive && "active-class",
        "always-present",
      );
      expect(result).toBe("base-class active-class always-present");
    });

    it("should handle falsy values", () => {
      const isActive = false;
      const result = cn(
        "base-class",
        isActive && "active-class",
        "always-present",
      );
      expect(result).toBe("base-class always-present");
    });

    it("should handle empty strings", () => {
      const result = cn("base-class", "", "valid-class");
      expect(result).toBe("base-class valid-class");
    });

    it("should handle undefined and null", () => {
      const result = cn("base-class", undefined, null, "valid-class");
      expect(result).toBe("base-class valid-class");
    });
  });
});
