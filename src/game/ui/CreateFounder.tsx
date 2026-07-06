import { Flame, Orbit, Rocket } from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import {
  ATTRIBUTE_IDS,
  ATTRIBUTE_LABELS,
  attributePresets,
  backgroundProfiles,
  findBackgroundProfile,
  findTrackProfile,
  trackProfiles,
} from "../data/founderProfiles";
import type {
  AttributePresetId,
  BackgroundId,
  FounderAttributeId,
  FounderAttributes,
  MetricEffect,
  MetricId,
  NewGameInput,
  TrackId,
} from "../types";

interface CreateFounderProps {
  onStart: (input: NewGameInput) => void;
}

function attributeTotal(attributes: FounderAttributes): number {
  return ATTRIBUTE_IDS.reduce((total, id) => total + attributes[id], 0);
}

const presetAttributes: Record<AttributePresetId, FounderAttributes> = {
  operator: { tech: 3, sales: 3, fundraising: 4, management: 3, ethics: 3, stamina: 3, hype: 3, luck: 2 },
  researcher: { tech: 5, sales: 2, fundraising: 2, management: 2, ethics: 4, stamina: 3, hype: 2, luck: 4 },
  rainmaker: { tech: 2, sales: 4, fundraising: 5, management: 3, ethics: 2, stamina: 3, hype: 4, luck: 1 },
  global: { tech: 4, sales: 3, fundraising: 3, management: 2, ethics: 4, stamina: 4, hype: 2, luck: 2 },
};

function isAttributePresetId(id: string): id is AttributePresetId {
  return id in presetAttributes;
}

const METRIC_LABELS: Record<MetricId, string> = {
  cash: "现金",
  runway: "Runway",
  arr: "ARR",
  mrr: "MRR",
  pmf: "PMF",
  modelPower: "模型能力",
  productQuality: "产品质量",
  computeSupply: "算力供给",
  computeCost: "算力成本",
  grossMargin: "Gross Margin",
  techDebt: "技术债",
  reputation: "声誉",
  morale: "士气",
  complianceRisk: "合规风险",
  globalReadiness: "全球化准备",
  boardPressure: "董事会压力",
  founderHealth: "创始人健康",
  founderEquity: "创始人股权",
  valuation: "估值",
  marketHeat: "市场热度",
};

function metricEffectText(effect: MetricEffect): string {
  const arrow = effect.delta >= 0 ? "+" : "";
  const value = Math.abs(effect.delta) >= 10_000 ? `${Math.round(effect.delta / 10_000)} 万` : `${arrow}${effect.delta}`;
  return `${METRIC_LABELS[effect.metric]} ${value}`;
}

export function CreateFounder({ onStart }: CreateFounderProps) {
  const defaultBackground = backgroundProfiles[0];
  const defaultTrack = trackProfiles.find((track) => track.id === "ai-agent") ?? trackProfiles[0];
  const [founderName, setFounderName] = useState("沈一");
  const [backgroundId, setBackgroundId] = useState<BackgroundId>(defaultBackground.id);
  const [trackId, setTrackId] = useState<TrackId>(defaultTrack.id);
  const [presetId, setPresetId] = useState(`background-${defaultBackground.id}`);
  const [attributes, setAttributes] = useState<FounderAttributes>(defaultBackground.attributes);

  const selectedBackground = useMemo(() => findBackgroundProfile(backgroundId) ?? defaultBackground, [backgroundId]);
  const selectedTrack = useMemo(() => findTrackProfile(trackId) ?? defaultTrack, [trackId]);
  const total = attributeTotal(attributes);
  const canStart = founderName.trim().length > 0;

  function selectBackground(id: BackgroundId) {
    const profile = findBackgroundProfile(id);
    if (!profile) return;
    setBackgroundId(id);
    setPresetId(`background-${id}`);
    setAttributes(profile.attributes);
  }

  function selectPreset(id: string) {
    const preset = attributePresets.find((item) => item.id === id);
    if (!preset) return;
    setPresetId(id);
    setAttributes(presetAttributes[preset.id]);
  }

  function updateAttribute(id: FounderAttributeId, value: number) {
    setPresetId("custom");
    setAttributes((current) => ({ ...current, [id]: value }));
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canStart) return;
    const selectedPresetId = isAttributePresetId(presetId) ? presetId : undefined;
    onStart({
      seed: 20260702,
      founderName: founderName.trim(),
      backgroundId,
      trackId,
      ...(selectedPresetId ? { presetId: selectedPresetId } : {}),
      attributes,
    });
  }

  return (
    <main className="create-shell">
      <form className="create-panel briefing-panel" onSubmit={submit}>
        <div className="panel-heading hero-heading">
          <div>
            <p className="eyebrow">AI 创业模拟器</p>
            <h1>
              <Orbit aria-hidden="true" size={24} />
              创始人简报
            </h1>
          </div>
          <span className="status-pill neutral">
            属性总和 {total}
          </span>
        </div>

        <section className="briefing-copy" aria-label="玩法说明">
          <div>
            <h2>
              <Flame aria-hidden="true" size={20} />
              从一间会议室打到全球榜单
            </h2>
            <p>
              每个季度你要同时处理公司动作、创始人状态和员工去留。模型能力会让你冲上榜单，PMF 和 ARR 决定能不能活成上市公司，Runway 会提醒你梦想按月扣费。
            </p>
          </div>
          <div>
            <h2>胜利不是上市，是活着抵达那天</h2>
            <p>
              可以稳扎稳打，也可以学术造假、灰色数据、ARR 注水。捷径会让数字变漂亮，也会把监管、审计和董事会请进会议室。
            </p>
          </div>
        </section>

        <label className="field founder-name-field">
          <span>创始人姓名</span>
          <input
            aria-label="创始人姓名"
            value={founderName}
            onChange={(event) => setFounderName(event.target.value)}
          />
        </label>

        <section className="selection-section" aria-label="创业身份">
          <div className="section-title-row">
            <div>
              <p className="eyebrow">身份决定开局资源</p>
              <h2>选择创业身份</h2>
            </div>
            <span className="status-pill neutral">{selectedBackground.label}</span>
          </div>
          <div className="profile-grid">
            {backgroundProfiles.map((profile) => (
              <button
                aria-pressed={backgroundId === profile.id}
                className={backgroundId === profile.id ? "profile-card selected" : "profile-card"}
                key={profile.id}
                onClick={() => selectBackground(profile.id)}
                type="button"
              >
                <strong>{profile.label}</strong>
                <span>{profile.description}</span>
                <small>{profile.specialty}</small>
              </button>
            ))}
          </div>
        </section>

        <section className="selection-section" aria-label="创业赛道">
          <div className="section-title-row">
            <div>
              <p className="eyebrow">赛道决定第一场风暴</p>
              <h2>选择创业赛道</h2>
            </div>
            <span className="status-pill neutral">{selectedTrack.label}</span>
          </div>
          <div className="track-grid">
            {trackProfiles.map((track) => (
              <button
                aria-pressed={trackId === track.id}
                className={trackId === track.id ? "track-card selected" : "track-card"}
                key={track.id}
                onClick={() => setTrackId(track.id)}
                type="button"
              >
                <strong>{track.label}</strong>
                <span>{track.description}</span>
                <small>{track.focus}</small>
              </button>
            ))}
          </div>
        </section>

        <fieldset className="preset-fieldset">
          <legend>属性预设</legend>
          <div className="preset-grid">
            {attributePresets.map((preset) => (
              <button
                aria-pressed={presetId === preset.id}
                className={presetId === preset.id ? "preset-button selected" : "preset-button"}
                key={preset.id}
                onClick={() => selectPreset(preset.id)}
                type="button"
              >
                <strong>{preset.label}</strong>
                <span>{preset.description}</span>
                <small>{preset.metricEffects.map(metricEffectText).join(" / ")}</small>
              </button>
            ))}
          </div>
        </fieldset>

        <div className="attribute-grid">
          {ATTRIBUTE_IDS.map((id) => (
            <label className="attribute-control" key={id}>
              <span>
                {ATTRIBUTE_LABELS[id]}
                <strong>{attributes[id]}</strong>
              </span>
              <input
                aria-label={ATTRIBUTE_LABELS[id]}
                max={5}
                min={1}
                onChange={(event) => updateAttribute(id, Number(event.target.value))}
                type="range"
                value={attributes[id]}
              />
            </label>
          ))}
        </div>

        <button className="primary-button" disabled={!canStart} type="submit">
          <Rocket aria-hidden="true" size={18} />
          开始创业
        </button>
      </form>
    </main>
  );
}
