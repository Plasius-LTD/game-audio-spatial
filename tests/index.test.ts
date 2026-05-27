import { describe, expect, it } from "vitest";

import { DEFAULT_ACOUSTIC_MATERIALS, GAME_AUDIO_SPATIAL_ENV_PREFIX, GAME_AUDIO_SPATIAL_FEATURE_FLAG_ID, GAME_AUDIO_SPATIAL_PACKAGE, estimateAcousticOcclusion, packageDescriptor } from "../src/index.js";

describe("@plasius/game-audio-spatial", () => {
  it("exports package metadata", () => {
    expect(packageDescriptor.packageName).toBe(GAME_AUDIO_SPATIAL_PACKAGE);
    expect(packageDescriptor.featureFlagId).toBe(GAME_AUDIO_SPATIAL_FEATURE_FLAG_ID);
    expect(packageDescriptor.envPrefix).toBe(GAME_AUDIO_SPATIAL_ENV_PREFIX);
  });
  it("keeps open-air paths clear apart from distance attenuation", () => {
    const estimate = estimateAcousticOcclusion({ distanceMeters: 5, obstacles: [] });
    expect(estimate.gain).toBeGreaterThan(0.7);
    expect(estimate.lowPassHz).toBe(20_000);
    expect(estimate.hardClipped).toBe(false);
    expect(estimate.reasonCodes).toContain("distance-attenuation");
  });
  it("attenuates and filters through heavy material", () => {
    const estimate = estimateAcousticOcclusion({ distanceMeters: 3, obstacles: [{ obstacleId: "wall-1", material: DEFAULT_ACOUSTIC_MATERIALS.stone, thicknessMeters: 1.2 }] });
    expect(estimate.gain).toBeLessThan(0.3);
    expect(estimate.lowPassHz).toBe(2_200);
    expect(estimate.hardClipped).toBe(false);
    expect(estimate.reasonCodes).toContain("obstructed:stone");
  });
  it("hard clips sealed barriers", () => {
    const estimate = estimateAcousticOcclusion({ distanceMeters: 1, obstacles: [{ obstacleId: "sealed-1", material: DEFAULT_ACOUSTIC_MATERIALS.sealedBarrier, thicknessMeters: 0.5 }] });
    expect(estimate.gain).toBe(0);
    expect(estimate.hardClipped).toBe(true);
    expect(estimate.reasonCodes).toContain("hard-clip:sealed-barrier");
  });
});
