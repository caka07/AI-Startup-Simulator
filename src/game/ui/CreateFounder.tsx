import { BookOpen, Flame, Orbit, Rocket, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import {
  ATTRIBUTE_IDS,
  ATTRIBUTE_LABELS,
  attributePresets,
  backgroundProfiles,
  findBackgroundProfile,
  findTrackProfile,
  trackProfiles,
} from "../data/founderProfiles";
import { achievements } from "../data/achievements";
import { actions } from "../data/actions";
import { endings } from "../data/endings";
import { founderActions } from "../data/founderActions";
import { investors } from "../data/investors";
import { employeeOperations } from "../engine/employeeOperations";
import { deriveFounderAttributes } from "../engine/founderStart";
import type {
  AttributePresetId,
  BackgroundId,
  Condition,
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

const START_ATTRIBUTE_TOTAL = 30;
const GOD_MODE_ATTRIBUTES = Object.fromEntries(ATTRIBUTE_IDS.map((id) => [id, 10])) as FounderAttributes;

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
  const abs = Math.abs(effect.delta);
  const value = abs >= 10_000 ? `${arrow}${Math.round(abs / 10_000)} 万` : `${arrow}${effect.delta}`;
  return `${METRIC_LABELS[effect.metric]} ${value}`;
}

function riskLabel(risk: string): string {
  if (risk === "low") return "低风险";
  if (risk === "medium") return "中风险";
  if (risk === "high") return "高风险";
  return "极端风险";
}

function termLabel(termStyle: string): string {
  if (termStyle === "friendly") return "友好条款";
  if (termStyle === "normal") return "常规条款";
  if (termStyle === "pressure") return "压力条款";
  return "掠夺条款";
}

function conditionText(condition: Condition): string {
  const opText: Record<Condition["op"], string> = {
    ">=": "大于等于",
    ">": "高于",
    "<=": "小于等于",
    "<": "低于",
    "===": "等于",
  };
  const value =
    Math.abs(condition.value) >= 100_000_000
      ? `${Number.isInteger(condition.value / 100_000_000) ? condition.value / 100_000_000 : (condition.value / 100_000_000).toFixed(1)} 亿`
      : Math.abs(condition.value) >= 10_000
        ? `${Math.round(condition.value / 10_000)} 万`
        : String(condition.value);
  return `${METRIC_LABELS[condition.metric]}${opText[condition.op]} ${value}`;
}

function readableConditionText(text: string): string {
  return text
    .replace(/>=/g, "大于等于")
    .replace(/<=/g, "小于等于")
    .replace(/>/g, "高于")
    .replace(/</g, "低于");
}

export function CreateFounder({ onStart }: CreateFounderProps) {
  const defaultBackground = backgroundProfiles[0];
  const defaultTrack = trackProfiles.find((track) => track.id === "ai-agent") ?? trackProfiles[0];
  const [founderName, setFounderName] = useState("nobody");
  const [companyName, setCompanyName] = useState("nobody");
  const [backgroundId, setBackgroundId] = useState<BackgroundId>(defaultBackground.id);
  const [trackId, setTrackId] = useState<TrackId>(defaultTrack.id);
  const [presetId, setPresetId] = useState<AttributePresetId>("operator");
  const [customAttributes, setCustomAttributes] = useState<FounderAttributes | null>(null);
  const [godMode, setGodMode] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [revealedWikiAchievements, setRevealedWikiAchievements] = useState<string[]>([]);
  const godModeTimer = useRef<number | null>(null);

  const selectedBackground = useMemo(() => findBackgroundProfile(backgroundId) ?? defaultBackground, [backgroundId]);
  const selectedTrack = useMemo(() => findTrackProfile(trackId) ?? defaultTrack, [trackId]);
  const derivedAttributes = useMemo(
    () =>
      deriveFounderAttributes({
        seed: 20260702,
        founderName,
        backgroundId,
        trackId,
        presetId,
      }),
    [backgroundId, founderName, presetId, trackId],
  );
  const attributes = customAttributes ?? derivedAttributes;
  const total = attributeTotal(attributes);
  const canStart =
    founderName.trim().length > 0 &&
    companyName.trim().length > 0 &&
    (godMode || total <= START_ATTRIBUTE_TOTAL);

  useEffect(
    () => () => {
      if (godModeTimer.current !== null) window.clearTimeout(godModeTimer.current);
    },
    [],
  );

  function clearGodModeTimer() {
    if (godModeTimer.current !== null) {
      window.clearTimeout(godModeTimer.current);
      godModeTimer.current = null;
    }
  }

  function armGodModeTimer() {
    if (godMode || godModeTimer.current !== null) return;
    godModeTimer.current = window.setTimeout(() => {
      setGodMode(true);
      setCustomAttributes(GOD_MODE_ATTRIBUTES);
      godModeTimer.current = null;
    }, 10_000);
  }

  function selectBackground(id: BackgroundId) {
    const profile = findBackgroundProfile(id);
    if (!profile) return;
    setBackgroundId(id);
    setCustomAttributes(godMode ? GOD_MODE_ATTRIBUTES : null);
  }

  function selectPreset(id: AttributePresetId) {
    const preset = attributePresets.find((item) => item.id === id);
    if (!preset) return;
    setPresetId(id);
    setCustomAttributes(godMode ? GOD_MODE_ATTRIBUTES : null);
  }

  function updateAttribute(id: FounderAttributeId, value: number) {
    setCustomAttributes((current) => ({ ...(current ?? derivedAttributes), [id]: value }));
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canStart) return;
    onStart({
      seed: 20260702,
      founderName: founderName.trim(),
      companyName: companyName.trim(),
      backgroundId,
      trackId,
      presetId,
      ...(customAttributes ? { attributes: customAttributes } : {}),
    });
  }

  function revealWikiAchievement(id: string) {
    setRevealedWikiAchievements((current) => (current.includes(id) ? current : [...current, id]));
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
          <span className={total <= START_ATTRIBUTE_TOTAL || godMode ? "status-pill success" : "status-pill warning"}>
            属性总和 {total}
          </span>
        </div>

        <section className="launch-console" aria-label="启动控制台">
          <div className="launch-copy">
            <p className="eyebrow">MISSION CONTROL / AI STARTUP</p>
            <h2>上市不是结局，现金流才是氧气</h2>
            <p>
              你有 15 年时间，把 nobody 从一张冷启动表格推到全球榜单。融资、模型、客户、员工和健康会互相拉扯；每一个漂亮数字都会找另一个指标收税。
            </p>
            <div className="launch-command-row">
              <button className="secondary-button launch-archive-button" onClick={() => setArchiveOpen(true)} type="button">
                <BookOpen aria-hidden="true" size={16} />
                打开任务档案
              </button>
              <span className="console-status">系统待命 / 可开局属性 {START_ATTRIBUTE_TOTAL}</span>
            </div>
          </div>

          <div className="mission-display" aria-label="任务状态">
            <div className="radar-screen" aria-hidden="true">
              <span className="radar-ring outer" />
              <span className="radar-ring middle" />
              <span className="radar-ring inner" />
              <span className="radar-sweep" />
              <span className="radar-axis horizontal" />
              <span className="radar-axis vertical" />
              <span className="radar-vector vector-a" />
              <span className="radar-vector vector-b" />
            </div>
            <div className="mission-stats">
              <div>
                <span>MISSION CLOCK</span>
                <strong>15 年</strong>
              </div>
              <div>
                <span>FIRST BURN</span>
                <strong>12 个月</strong>
              </div>
              <div>
                <span>DEFAULT LOAD</span>
                <strong>{total}/30</strong>
              </div>
            </div>
            <div className="quarter-sequence" aria-label="季度节奏">
              {["Q1 立项", "Q2 融资", "Q3 交付", "Q4 复盘"].map((label) => (
                <span key={label}>{label}</span>
              ))}
            </div>
          </div>
        </section>

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

        <div className="form-grid founder-field-grid">
          <label className="field founder-name-field">
            <span>创始人姓名</span>
            <input
              aria-label="创始人姓名"
              value={founderName}
              onChange={(event) => setFounderName(event.target.value)}
            />
          </label>
          <label className="field founder-name-field">
            <span>公司名称</span>
            <input
              aria-label="公司名称"
              value={companyName}
              onChange={(event) => setCompanyName(event.target.value)}
            />
          </label>
        </div>

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
                onClick={() => {
                  setTrackId(track.id);
                  setCustomAttributes(godMode ? GOD_MODE_ATTRIBUTES : null);
                }}
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
                max={10}
                min={1}
                onChange={(event) => updateAttribute(id, Number(event.target.value))}
                type="range"
                value={attributes[id]}
              />
            </label>
          ))}
        </div>

        <div
          className="start-button-zone"
          data-testid="start-button-zone"
          onBlur={clearGodModeTimer}
          onFocus={armGodModeTimer}
          onMouseEnter={armGodModeTimer}
          onMouseLeave={clearGodModeTimer}
        >
          <button className="primary-button" disabled={!canStart} type="submit">
            <Rocket aria-hidden="true" size={18} />
            开始创业
          </button>
        </div>
        {godMode ? null : (
          <p className="start-rule-hint">
            属性总和小于等于 {START_ATTRIBUTE_TOTAL} 可开局。点数越少越难；属性会影响行动效率、融资评分和创始人动作成长。
          </p>
        )}

        {archiveOpen ? (
          <div className="modal-backdrop">
            <section aria-label="任务档案" className="achievement-modal archive-modal wiki-modal" role="dialog">
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">Mission Archive</p>
                  <h2>
                    <BookOpen aria-hidden="true" size={20} />
                    AI 创业任务档案
                  </h2>
                </div>
                <button aria-label="关闭任务档案" className="secondary-button icon-button" onClick={() => setArchiveOpen(false)} type="button">
                  <X aria-hidden="true" size={16} />
                </button>
              </div>

              <div className="wiki-grid">
                <article>
                  <strong>开局属性</strong>
                  <p>属性总和小于等于 30 即可开局。技术影响训练模型、论文和算力动作；销售影响冲销售和 PMF；融资直接进入融资评分；管理影响招聘、留人和团队动作；伦理会压住灰色玩法的代价；体力影响高消耗动作；声量影响 PR 与市场热度；运气会让部分高风险动作更容易翻盘。</p>
                </article>
                <article>
                  <strong>季度循环</strong>
                  <p>每季度选择 2 个公司动作，可以用现金购买额外动作；每名员工可选一次季度操作；创始人季度动作在公司动作后结算。</p>
                </article>
                <article>
                  <strong>创始人季度动作</strong>
                  <p>深度工作换产品和技术债，饭局换融资叙事，客户拜访换 PMF；强制休假、心理咨询、授权代理 CEO 和住院体检能恢复创始人健康，但会牺牲现金、热度、董事会压力或增长。</p>
                </article>
                <article>
                  <strong>融资与投资人</strong>
                  <p>融资评分由融资属性、声誉、市场热度、PMF、Runway 和合规风险决定。领投人会改变条款：友好投资人稀释低，救火资本会明显提高董事会压力。</p>
                </article>
                <article>
                  <strong>排行榜与巨头关系</strong>
                  <p>排行榜按综合、模型能力、商业化、全球化四条线计算。DeepDuck、OpenMind、CloudSoft、BytePlanet 等公司的事件选择会改变关系值，并影响它们后续榜单分数。合作不一定安全，硬刚也不一定愚蠢。</p>
                </article>
                <article>
                  <strong>员工与健康</strong>
                  <p>员工季度操作不是必选；加薪和期权能稳住关键人，PUA 和裁员会换短期指标但留下风险。创始人健康低时行动效率下降，强制休假、心理咨询、授权代理 CEO 和住院体检是主要回血手段。</p>
                </article>
                <article>
                  <strong>结局与成就</strong>
                  <p>现金断裂、创始人健康崩盘、监管爆雷和董事会逼宫会直接落幕。港股 IPO、现金流冠军、纸面富豪这类阶段结局会进入已达成结局，但不会阻止继续游戏。隐藏成就默认藏条件，任务档案里可以手动窥探。</p>
                </article>
                <article className="wiki-route">
                  <strong>美股 IPO 可行路线</strong>
                  <p>2026 Q1 起：研发产品 + 冲销售；2026 Q2 融资选 Kevin Founder + 招聘；2026 Q3 训练模型 + 研发产品；2026 Q4 治理合规 + 冲销售。之后以四季度为一组循环：第一季度研发产品加冲销售，第二季度训练模型加治理合规，第三季度融资或招聘加全球扩张，第四季度冲销售加安全审计。创始人健康低于 55 时强制休假，低于 40 时住院体检；Runway 低于 6 个月时优先融资或削减成本；合规风险高于 50 时暂停灰色玩法。目标是在 2032 前把 ARR 推到 1.5 亿以上、毛利率 50 以上、估值 20 亿以上、全球化准备 75 以上、合规风险压到 35 以下。</p>
                </article>
                <article className="wiki-route">
                  <strong>公司动作详解</strong>
                  <div className="wiki-list compact">
                    {actions.map((action) => (
                      <p key={action.id}>
                        <b>{action.name}</b>
                        <span>{riskLabel(action.risk)} / 创始人健康 -{action.healthCost}</span>
                        <small>{action.description} 主要影响：{action.visibleSummary.join("、")}。</small>
                      </p>
                    ))}
                  </div>
                </article>
                <article className="wiki-route">
                  <strong>创始人动作与员工操作</strong>
                  <div className="wiki-columns">
                    <div className="wiki-list compact">
                      {founderActions.map((action) => (
                        <p key={action.id}>
                          <b>{action.name}</b>
                          <small>
                            {action.effects.map(metricEffectText).join(" / ")}；长期成长：
                            {Object.keys(action.attributeEffects)
                              .map((id) => ATTRIBUTE_LABELS[id as FounderAttributeId])
                              .join("、") || "无"}
                            。
                          </small>
                        </p>
                      ))}
                    </div>
                    <div className="wiki-list compact">
                      {employeeOperations.map((operation) => (
                        <p key={operation.id}>
                          <b>{operation.name}</b>
                          <span>{riskLabel(operation.risk)}</span>
                          <small>{operation.description}</small>
                        </p>
                      ))}
                    </div>
                  </div>
                </article>
                <article className="wiki-route">
                  <strong>投资人和融资窗口</strong>
                  <p>融资不是固定按钮：Runway 低、合规风险高会压估值；PMF、声誉、市场热度和融资属性会提高评分。选择领投人会直接改变条款，友好条款稀释较少，掠夺条款会用更高董事会压力换现金。</p>
                  <div className="wiki-list compact wiki-investors">
                    {investors.map((investor) => (
                      <p key={investor.id}>
                        <b>{investor.name}</b>
                        <span>{termLabel(investor.termStyle)} / {investor.type}</span>
                        <small>喜欢：{investor.likes.join("、")}；讨厌：{investor.hates.join("、")}。</small>
                      </p>
                    ))}
                  </div>
                </article>
                <article className="wiki-route">
                  <strong>成就清单</strong>
                  <div className="wiki-list compact wiki-achievements">
                    {achievements.map((achievement) => (
                      (() => {
                        const revealed = revealedWikiAchievements.includes(achievement.id);
                        const hideCondition = achievement.hiddenCondition && !revealed;
                        const revealedCondition = achievement.hiddenCondition
                          ? achievement.trigger.map(conditionText).join("，")
                          : readableConditionText(achievement.conditionText);
                        return (
                          <p key={achievement.id}>
                            <b>{achievement.name}</b>
                            <span>{achievement.tier}</span>
                            <small>{achievement.description}</small>
                            <small>解锁条件：{hideCondition ? "？？？" : revealedCondition}。</small>
                            {achievement.hiddenCondition ? (
                              <button
                                className="secondary-button wiki-reveal-button"
                                onClick={() => revealWikiAchievement(achievement.id)}
                                type="button"
                              >
                                {revealed ? "已窥探" : "窥探条件"}
                              </button>
                            ) : null}
                          </p>
                        );
                      })()
                    ))}
                  </div>
                </article>
                <article className="wiki-route">
                  <strong>结局条件</strong>
                  <div className="wiki-list compact">
                    {endings.map((ending) => (
                      <p key={ending.id}>
                        <b>{ending.name}</b>
                        <span>{ending.terminal ? "终止结局" : "阶段结局"} / 优先级 {ending.priority}</span>
                        <small>{ending.description}</small>
                        <small>触发条件：{ending.trigger.map(conditionText).join("，")}。</small>
                      </p>
                    ))}
                  </div>
                </article>
              </div>
            </section>
          </div>
        ) : null}
      </form>
    </main>
  );
}
