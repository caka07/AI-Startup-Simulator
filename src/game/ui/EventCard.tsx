import { AlertTriangle } from "lucide-react";
import {
  choiceLabel as localizedChoiceLabel,
  eventContext as localizedEventContext,
  eventTitle as localizedEventTitle,
} from "../data/eventText";
import type { GameEvent, GameEventChoice, MetricEffect, MetricId } from "../types";

interface EventCardProps {
  event: GameEvent;
  onChoose: (choiceId: string) => void;
}

const CATEGORY_LABELS: Record<GameEvent["category"], string> = {
  funding: "融资",
  employee: "员工",
  giant: "巨头",
  customer: "客户",
  regulation: "监管",
  tech: "技术",
  pr: "公关",
  global: "全球化",
  health: "健康",
};

const METRIC_LABELS: Record<MetricId, string> = {
  cash: "现金",
  runway: "现金跑道",
  arr: "年度经常性收入",
  mrr: "月度经常性收入",
  pmf: "产品市场匹配",
  modelPower: "模型能力",
  productQuality: "产品质量",
  computeSupply: "算力供给",
  computeCost: "算力成本",
  grossMargin: "毛利率",
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

const CATEGORY_CONTEXTS: Record<GameEvent["category"], string> = {
  funding: "投资人把你叫进会议室，夸了愿景，也顺手掏出了计算器。",
  employee: "团队内部开始出现裂纹，薪酬、期权和信仰都被放到桌面上重新估价。",
  giant: "科技巨头的一个动作改变了市场风向，你的小公司必须马上决定站位。",
  customer: "客户那边突然把你的路线图、现金流和团队耐心一起塞进会议室。",
  regulation: "监管和审计开始靠近，拖延会便宜一时，但账会记到以后。",
  tech: "技术路线被现实拦了一下，模型、算力和产品体验要重新排优先级。",
  pr: "外部声量突然变大，热度可以换增长，也可能把缺陷照得更亮。",
  global: "海外机会递到面前，语言、合规、渠道和现金流会一起要预算。",
  health: "创始人身体和精神状态开始报错，公司最大的单点风险坐在你的椅子上。",
};

const EVENT_TITLES: Record<string, string> = {
  "investor-moat-question": "投资人追问护城河",
  "impossible-enterprise-contract": "不可能的企业合同",
  "deepduck-open-source-shock": "DeepDuck 发布廉价模型",
  "core-researcher-triple-offer": "核心研究员收到三倍 Offer",
  "board-suggests-professional-ceo": "董事会建议职业 CEO",
  "green-furnace-waitlist": "Green Furnace 开放 GPU 等待名单",
  "byteplanet-traffic-trial": "BytePlanet 提供流量试用",
  "cloudsoft-pluginization": "CloudSoft 想要插件",
  "moralmachine-safety-review": "MoralMachine 要求安全审查",
  "sales-promised-private-deployment": "销售承诺私有化部署",
  "cfo-finds-recognition-risk": "CFO 发现收入确认风险",
  "overseas-bd-asks-for-budget": "海外 BD 申请预算",
  "eu-customer-asks-data-lineage": "欧盟客户要求数据血缘",
  "middle-east-poc-marathon": "中东 POC 马拉松",
  "us-investor-asks-global-story": "美国投资人追问全球故事",
  "employee-options-underwater": "员工期权已经水下",
  "founder-health-warning": "创始人健康警报",
  "demo-crashes-at-conference": "大会 Demo 崩了",
  "viral-pr-with-no-retention": "公关爆了但留存没了",
  "customer-prepayment-offer": "客户提出预付款",
  "gpu-invoice-sticker-shock": "GPU 账单吓人",
  "regulator-visits-office": "监管到访办公室",
  "procurement-demands-local-deployment": "采购要求本地化部署",
  "model-benchmark-leak": "模型 Benchmark 泄露",
  "openmind-price-cut": "OpenMind 下调 API 价格",
  "campus-recruiting-backfires": "校招反噬",
  "finance-flags-burn-multiple": "财务警告烧钱倍数",
  "big-bank-security-review": "大银行安全审查",
  "founder-podcast-goes-viral": "创始人播客出圈",
  "dataset-consent-complaint": "数据集授权投诉",
  "cloud-credit-expiration": "云券即将过期",
  "local-government-demo-day": "地方政府 Demo Day",
  "enterprise-churn-scare": "大客户续费警报",
  "competitor-poaches-sales-lead": "竞品挖走销售负责人",
  "pricing-page-ridiculed": "定价页被群嘲",
  "ai-agent-runs-amok": "AI Agent 在试点中失控",
  "board-demands-ai-native-margin": "董事会要求 AI 原生毛利",
  "sea-reseller-wants-exclusivity": "东南亚代理要求独家",
  "policy-team-wants-red-team": "政策团队要求红队测试",
  "customer-asks-source-code-escrow": "客户要求源代码托管",
};

const CHOICE_LABELS: Record<string, string> = {
  "show-enterprise-workflows": "展示企业工作流粘性",
  "promise-frontier-model": "承诺追平前沿模型",
  "accept-custom-work": "接下定制范围",
  "hold-product-line": "守住产品边界",
  "wrap-with-workflow": "用工作流价值包住它",
  "start-benchmark-war": "开启 Benchmark 战争",
  "refresh-options": "刷新期权",
  "let-them-go": "放人离开",
  "hire-coo": "聘请重量级 COO",
  "fight-the-board": "硬刚董事会",
  "prepay-capacity": "预付算力",
  "optimize-inference": "先优化推理",
  "take-traffic": "接下流量",
  "stay-independent": "保持独立",
  "build-plugin": "开发插件",
  "push-direct-sales": "推进直销",
  cooperate: "公开配合",
  "dismiss-review": "斥为作秀",
  "staff-war-room": "组建交付战情室",
  "renegotiate-cloud": "改谈云端方案",
  "clean-books": "清理账目",
  "defer-problem": "拖延问题",
  "fund-roadshow": "资助路演",
  "stay-remote": "保持远程推进",
  "build-lineage": "建设血缘控制",
  "skip-eu": "暂时跳过欧盟",
  "send-founders": "创始人亲自出差",
  "qualify-harder": "更严格筛选机会",
  "pitch-global": "讲全球扩张故事",
  "defend-china-depth": "强调中国市场深度",
  "reprice-options": "重定价期权",
  "sell-mission": "更用力贩卖使命",
  "delegate-week": "委托一周",
  "push-through": "硬扛过去",
  "own-the-failure": "承认失败",
  "blame-wifi": "甩锅场馆 Wi-Fi",
  "slow-growth-fix-core": "放慢增长修核心体验",
  "feed-the-hype": "继续喂热度",
  "take-prepay": "收下预付款",
  "keep-standard-contract": "坚持标准合同",
  "negotiate-credits": "谈云积分",
  "cut-context-window": "砍上下文窗口",
  "open-records": "开放记录",
  "delay-response": "拖延回应",
  "launch-local-stack": "启动本地化栈",
  "offer-premium-cloud": "提供高级云方案",
  "publish-methodology": "公开方法论",
  "deny-everything": "全部否认",
  "match-pricing": "跟进降价",
  "sell-data-residency": "销售数据驻留价值",
  "mentor-juniors": "认真带教新人",
  "pause-campus": "暂停校招",
  "freeze-hiring": "冻结招聘",
  "raise-bridge": "融一笔过桥",
  "pass-audit": "投入审计控制",
  "walk-away": "放弃这单",
  "convert-inbound": "转化涌入线索",
  "lean-into-persona": "强化创始人人设",
  "remove-dataset": "移除数据集",
  "argue-fair-use": "主张合理使用",
  "train-now": "立刻训练",
  "save-team-focus": "保住团队专注",
  "attend-demo-day": "参加 Demo Day",
  "skip-ceremony": "跳过仪式",
  "embed-success-team": "嵌入客户成功团队",
  "replace-bad-fit": "替换不匹配客户",
  "counter-offer": "反向加价挽留",
  "promote-from-within": "内部提拔",
  "simplify-pricing": "简化定价",
  "defend-complexity": "为复杂度辩护",
  "add-guardrails": "补上护栏",
  "call-it-beta": "宣布这只是 Beta",
  "raise-prices": "涨价",
  "optimize-stack": "优化技术栈",
  "grant-exclusivity": "授予独家",
  "build-channel": "建设更宽渠道",
  "run-red-team": "执行红队测试",
  "ship-before-review": "先发版再评审",
  "agree-escrow": "同意源码托管",
  "offer-sla": "提供更强 SLA",
};

function eventTitle(event: GameEvent): string {
  return localizedEventTitle(event);
}

function choiceLabel(choice: GameEventChoice): string {
  return localizedChoiceLabel(choice);
}

function formatEffect(effect: MetricEffect): string {
  return `${METRIC_LABELS[effect.metric]}${effect.delta >= 0 ? "↑" : "↓"}`;
}

export function EventCard({ event, onChoose }: EventCardProps) {
  return (
    <section className="panel event-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">突发事件 / {CATEGORY_LABELS[event.category]}</p>
          <h2>
            <AlertTriangle aria-hidden="true" size={20} />
            {eventTitle(event)}
          </h2>
        </div>
      </div>

      <p className="event-context">{localizedEventContext(event)}</p>

      <div className="choice-list">
        {event.choices.map((choice) => (
          <button className="choice-button" key={choice.id} onClick={() => onChoose(choice.id)} type="button">
            <strong>{choiceLabel(choice)}</strong>
            <span>趋势：</span>
            <ul className="effect-list">
              {choice.effects.map((effect) => (
                <li key={`${choice.id}-${effect.metric}-${effect.delta}`}>{formatEffect(effect)}</li>
              ))}
            </ul>
          </button>
        ))}
      </div>
    </section>
  );
}
