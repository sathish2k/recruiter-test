// Bun (1.3.x) doesn't implement node:v8 `startupSnapshot.isBuildingSnapshot`,
// which bson calls at module-init — crashing any mongoose import. Stub it to
// false so bson/mongoose load. Wired as a Bun preload (bunfig.toml).
try {
  const v8 = (
    process as unknown as {
      getBuiltinModule?: (name: string) => unknown;
    }
  ).getBuiltinModule?.("v8") as
    | { startupSnapshot?: { isBuildingSnapshot?: () => boolean } }
    | undefined;
  const snapshot = v8?.startupSnapshot;
  if (snapshot) {
    try {
      snapshot.isBuildingSnapshot = () => false;
    } catch {
      Object.defineProperty(snapshot, "isBuildingSnapshot", {
        value: () => false,
        configurable: true,
        writable: true,
      });
    }
  }
} catch {
  // Non-Bun runtimes / no v8 module — nothing to patch.
}
