import type { Faction } from "../types";

export const factions = [
  {
    id: "deepduck",
    name: "DeepDuck",
    description: "狠辣的开源实验室，最擅长在你发布前五分钟放出更便宜的模型。",
    role: "开源对手",
    pressure: "把模型能力商品化，并嘲笑闭门 Demo。",
  },
  {
    id: "openmind",
    name: "OpenMind",
    description: "全球前沿模型品牌，董事会材料里总有人拿它做灰色小字对标。",
    role: "全球前沿实验室",
    pressure: "抬高客户预期，也让投资人追问护城河。",
  },
  {
    id: "moralmachine",
    name: "MoralMachine",
    description: "AI 安全游说机器，可以把一次火辣 Demo 变成一个月合规工作坊。",
    role: "AI 治理组织",
    pressure: "当声誉跑在控制流程前面时提高审查强度。",
  },
  {
    id: "green-furnace",
    name: "Green Furnace",
    description: "GPU 云厂商，排队名单比你的 Runway 还长。",
    role: "算力供应商",
    pressure: "用稀缺算力换现金、公关或痛苦锁定。",
  },
  {
    id: "cloudsoft",
    name: "CloudSoft",
    description: "企业平台巨头，嘴上说合作伙伴，手里抄产品路线图。",
    role: "云分发入口",
    pressure: "推动插件化和收入分成。",
  },
  {
    id: "byteplanet",
    name: "BytePlanet",
    description: "流量帝国，能送来百万用户，也能把数据尾气全留在自己手里。",
    role: "消费流量巨头",
    pressure: "带来增长尖峰，也带来战略依赖。",
  },
  {
    id: "tencentacle",
    name: "Tencentacle",
    description: "超级应用生态，渠道、游戏、支付都有，也记得每一次拒绝。",
    role: "生态老玩家",
    pressure: "把分发和合作条件绑在一起。",
  },
  {
    id: "alicloud-temple",
    name: "Alicloud Temple",
    description: "云端圣殿，每份祝福都以代金券和迁移工作量的形式到来。",
    role: "基础设施老玩家",
    pressure: "把云代金券变成架构重力。",
  },
  {
    id: "oasis-models",
    name: "Oasis Models",
    description: "主权 AI 联盟，售卖阿语优先模型和合规很重的部署方案。",
    role: "区域主权 AI 对手",
    pressure: "依靠本地化和耐心资本赢下政府背书的全球化订单。",
  },
] satisfies Faction[];
