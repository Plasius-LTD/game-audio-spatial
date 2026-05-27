export interface GameAudioPackageDescriptor {
  readonly packageName: string;
  readonly featureFlagId: string;
  readonly envPrefix: string;
  readonly summary: string;
}

export const GAME_AUDIO_SPATIAL_PACKAGE = "@plasius/game-audio-spatial";
export const GAME_AUDIO_SPATIAL_ENV_PREFIX = "GAME_AUDIO_SPATIAL";
export const GAME_AUDIO_SPATIAL_FEATURE_FLAG_ID = "game.audio.sfx-occlusion.enabled";

export interface AcousticMaterialProfile { readonly materialId: string; readonly transmission: number; readonly absorption: number; readonly lowPassHz: number; readonly hardClip?: boolean; }
export interface AcousticObstacleSample { readonly obstacleId: string; readonly material: AcousticMaterialProfile; readonly thicknessMeters: number; }
export interface AcousticOcclusionInput { readonly distanceMeters: number; readonly obstacles: readonly AcousticObstacleSample[]; }
export interface AcousticOcclusionEstimate { readonly gain: number; readonly lowPassHz: number; readonly hardClipped: boolean; readonly reasonCodes: readonly string[]; }

export const DEFAULT_ACOUSTIC_MATERIALS = Object.freeze({
  air: Object.freeze({ materialId: "air", transmission: 1, absorption: 0, lowPassHz: 20_000 }),
  foliage: Object.freeze({ materialId: "foliage", transmission: 0.7, absorption: 0.2, lowPassHz: 8_000 }),
  wood: Object.freeze({ materialId: "wood", transmission: 0.45, absorption: 0.35, lowPassHz: 4_500 }),
  stone: Object.freeze({ materialId: "stone", transmission: 0.22, absorption: 0.65, lowPassHz: 2_200 }),
  metal: Object.freeze({ materialId: "metal", transmission: 0.18, absorption: 0.45, lowPassHz: 2_800 }),
  glass: Object.freeze({ materialId: "glass", transmission: 0.38, absorption: 0.25, lowPassHz: 5_200 }),
  water: Object.freeze({ materialId: "water", transmission: 0.3, absorption: 0.7, lowPassHz: 1_800 }),
  terrain: Object.freeze({ materialId: "terrain", transmission: 0.12, absorption: 0.8, lowPassHz: 1_400 }),
  sealedBarrier: Object.freeze({ materialId: "sealed-barrier", transmission: 0, absorption: 1, lowPassHz: 400, hardClip: true }),
} satisfies Record<string, AcousticMaterialProfile>);

export const packageDescriptor: GameAudioPackageDescriptor = Object.freeze({
  packageName: GAME_AUDIO_SPATIAL_PACKAGE,
  featureFlagId: GAME_AUDIO_SPATIAL_FEATURE_FLAG_ID,
  envPrefix: GAME_AUDIO_SPATIAL_ENV_PREFIX,
  summary: "Spatial acoustic obstruction and occlusion contracts for Plasius game audio.",
});

export function estimateAcousticOcclusion(input: AcousticOcclusionInput): AcousticOcclusionEstimate {
  const reasonCodes: string[] = [];
  const distanceMeters = Math.max(0, finiteOr(input.distanceMeters, 0));
  let gain = 1 / (1 + distanceMeters * 0.08);
  let lowPassHz = 20_000;
  let hardClipped = false;
  if (distanceMeters > 0) reasonCodes.push("distance-attenuation");
  for (const obstacle of input.obstacles) {
    const thickness = Math.max(0, finiteOr(obstacle.thicknessMeters, 0));
    const transmission = clampUnit(obstacle.material.transmission);
    const absorption = clampUnit(obstacle.material.absorption);
    const materialLowPass = Math.max(20, finiteOr(obstacle.material.lowPassHz, 20_000));
    if (obstacle.material.hardClip || transmission <= 0) {
      hardClipped = true;
      gain = 0;
      lowPassHz = Math.min(lowPassHz, materialLowPass);
      reasonCodes.push("hard-clip:" + obstacle.material.materialId);
      continue;
    }
    const thicknessLoss = Math.min(0.95, thickness * (1 - transmission) * 0.3);
    const materialGain = Math.max(0, transmission * (1 - absorption * 0.35) - thicknessLoss);
    gain *= materialGain;
    lowPassHz = Math.min(lowPassHz, materialLowPass);
    reasonCodes.push("obstructed:" + obstacle.material.materialId);
  }
  return Object.freeze({ gain: clampUnit(gain), lowPassHz: Math.round(lowPassHz), hardClipped, reasonCodes: Object.freeze(reasonCodes) });
}
function clampUnit(value: number): number { return Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : 0; }
function finiteOr(value: number, fallback: number): number { return Number.isFinite(value) ? value : fallback; }
