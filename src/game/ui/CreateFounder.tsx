import { Rocket } from "lucide-react";
import { useState, type FormEvent } from "react";
import type { BackgroundId, FounderAttributeId, FounderAttributes, NewGameInput, TrackId } from "../types";

interface CreateFounderProps {
  onStart: (input: NewGameInput) => void;
}

const ATTRIBUTE_IDS: FounderAttributeId[] = [
  "tech",
  "sales",
  "fundraising",
  "management",
  "ethics",
  "stamina",
  "hype",
  "luck",
];

const ATTRIBUTE_LABELS: Record<FounderAttributeId, string> = {
  tech: "技术",
  sales: "销售",
  fundraising: "融资",
  management: "管理",
  ethics: "伦理",
  stamina: "体力",
  hype: "声量",
  luck: "运气",
};

const BACKGROUND_OPTIONS: Array<{ id: BackgroundId; label: string }> = [
  { id: "ex-bigtech-pm", label: "大厂产品经理" },
  { id: "former-llm-researcher", label: "前大模型研究员" },
  { id: "serial-founder", label: "连续创业者" },
  { id: "overseas-phd", label: "海外博士" },
  { id: "open-source-maintainer", label: "开源维护者" },
  { id: "failed-incubation-team", label: "失败孵化团队" },
  { id: "rich-kid-founder", label: "资源型创始人" },
  { id: "indie-hacker", label: "独立开发者" },
];

const TRACK_OPTIONS: Array<{ id: TrackId; label: string }> = [
  { id: "foundation-model", label: "基础模型" },
  { id: "ai-agent", label: "AI Agent" },
  { id: "ai-coding", label: "AI 编程" },
  { id: "enterprise-knowledge", label: "企业知识库" },
  { id: "ai-education", label: "AI 教育" },
  { id: "ai-companion", label: "AI 陪伴" },
  { id: "ai-hardware", label: "AI 硬件" },
  { id: "ai-security", label: "AI 安全" },
  { id: "medical-ai", label: "医疗 AI" },
  { id: "finance-ai", label: "金融 AI" },
  { id: "manufacturing-ai", label: "制造业 AI" },
  { id: "local-life-agent", label: "本地生活 Agent" },
];

const ATTRIBUTE_PRESETS: Array<{ id: string; label: string; attributes: FounderAttributes }> = [
  {
    id: "operator",
    label: "运营型",
    attributes: { tech: 3, sales: 3, fundraising: 4, management: 3, ethics: 3, stamina: 3, hype: 3, luck: 2 },
  },
  {
    id: "researcher",
    label: "技术型",
    attributes: { tech: 5, sales: 2, fundraising: 2, management: 2, ethics: 4, stamina: 3, hype: 2, luck: 4 },
  },
  {
    id: "rainmaker",
    label: "融资型",
    attributes: { tech: 2, sales: 4, fundraising: 5, management: 3, ethics: 2, stamina: 3, hype: 4, luck: 1 },
  },
];

const TARGET_ATTRIBUTE_TOTAL = 24;

function attributeTotal(attributes: FounderAttributes): number {
  return ATTRIBUTE_IDS.reduce((total, id) => total + attributes[id], 0);
}

export function CreateFounder({ onStart }: CreateFounderProps) {
  const [founderName, setFounderName] = useState("沈一");
  const [backgroundId, setBackgroundId] = useState<BackgroundId>("ex-bigtech-pm");
  const [trackId, setTrackId] = useState<TrackId>("ai-agent");
  const [presetId, setPresetId] = useState(ATTRIBUTE_PRESETS[0].id);
  const [attributes, setAttributes] = useState<FounderAttributes>(ATTRIBUTE_PRESETS[0].attributes);
  const total = attributeTotal(attributes);
  const canStart = founderName.trim().length > 0 && total === TARGET_ATTRIBUTE_TOTAL;

  function selectPreset(id: string) {
    const preset = ATTRIBUTE_PRESETS.find((item) => item.id === id);
    if (!preset) return;
    setPresetId(id);
    setAttributes(preset.attributes);
  }

  function updateAttribute(id: FounderAttributeId, value: number) {
    setPresetId("custom");
    setAttributes((current) => ({ ...current, [id]: value }));
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canStart) return;
    onStart({
      seed: 20260702,
      founderName: founderName.trim(),
      backgroundId,
      trackId,
      attributes,
    });
  }

  return (
    <main className="create-shell">
      <form className="create-panel" onSubmit={submit}>
        <div className="panel-heading">
          <div>
            <p className="eyebrow">AI 创业模拟器</p>
            <h1>创建创始人</h1>
          </div>
          <span className={total === TARGET_ATTRIBUTE_TOTAL ? "status-pill success" : "status-pill warning"}>
            属性点 {total}/{TARGET_ATTRIBUTE_TOTAL}
          </span>
        </div>

        <div className="form-grid">
          <label className="field">
            <span>创始人姓名</span>
            <input value={founderName} onChange={(event) => setFounderName(event.target.value)} />
          </label>
          <label className="field">
            <span>创业背景</span>
            <select value={backgroundId} onChange={(event) => setBackgroundId(event.target.value as BackgroundId)}>
              {BACKGROUND_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>创业赛道</span>
            <select value={trackId} onChange={(event) => setTrackId(event.target.value as TrackId)}>
              {TRACK_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <fieldset className="preset-fieldset">
          <legend>属性预设</legend>
          <div className="preset-grid">
            {ATTRIBUTE_PRESETS.map((preset) => (
              <button
                aria-pressed={presetId === preset.id}
                className={presetId === preset.id ? "preset-button selected" : "preset-button"}
                key={preset.id}
                onClick={() => selectPreset(preset.id)}
                type="button"
              >
                {preset.label}
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
