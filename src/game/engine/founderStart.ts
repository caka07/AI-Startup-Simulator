import {
  ATTRIBUTE_IDS,
  attributePresets,
  findBackgroundProfile,
  findTrackProfile,
  type AttributeEffect,
} from "../data/founderProfiles";
import type { AttributePresetId, FounderAttributes, MetricEffect, NewGameInput } from "../types";

function applyAttributeEffects(attributes: FounderAttributes, effects: AttributeEffect[]): FounderAttributes {
  return effects.reduce(
    (next, effect) => ({
      ...next,
      [effect.attribute]: Math.max(1, Math.min(10, next[effect.attribute] + effect.delta)),
    }),
    attributes,
  );
}

export function findAttributePreset(id: AttributePresetId) {
  return attributePresets.find((preset) => preset.id === id);
}

export function deriveFounderAttributes(input: NewGameInput): FounderAttributes {
  if (input.attributes) return input.attributes;
  const background = findBackgroundProfile(input.backgroundId);
  const track = findTrackProfile(input.trackId);
  const preset = findAttributePreset(input.presetId ?? "operator");
  const base = (background?.attributes ?? Object.fromEntries(ATTRIBUTE_IDS.map((id) => [id, 3]))) as FounderAttributes;
  return applyAttributeEffects(applyAttributeEffects(base, track?.attributeEffects ?? []), preset?.attributeEffects ?? []);
}

export function deriveFounderMetricEffects(input: NewGameInput): MetricEffect[] {
  const background = findBackgroundProfile(input.backgroundId);
  const track = findTrackProfile(input.trackId);
  const preset = findAttributePreset(input.presetId ?? "operator");
  return [...(background?.metricEffects ?? []), ...(track?.metricEffects ?? []), ...(preset?.metricEffects ?? [])];
}

export function attributeTotal(attributes: FounderAttributes): number {
  return Object.values(attributes).reduce((total, value) => total + value, 0);
}
