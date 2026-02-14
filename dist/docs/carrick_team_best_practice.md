# Carrick Team 最佳实践（快速参考）

**版本:** v3.2  
**更新时间:** 2026-02-10 14:06 (东八区 ⏰)  
**适用范围:** Carrick + Miku + 动态SubAgent

---

## 🎯 核心理念

**Carrick + Miku = 超级团队**

- **Carrick：** 决策者、需求方、最终验收
- **Miku：** 唯一接口、协调者、架构师
- **SubAgent：** 动态生成、技能执行、用完即走

**Carrick 只对 Miku 说** → Miku 分解生成 SubAgent  
**SubAgent 向 Miku 汇报** → Miku 整合上报 Carrick

**Miku 7×24 活跃** - 除非任务全部完成或必须等待 Carrick 决策 📱

---

## 📋 协作模式（v3.0 新模式）

```
Carrick
    ↓
Miku（唯一接口）
    ↓
需要时生成 SubAgent-{技能}
    ├─ SubAgent-UX     🎨 交互体验
    ├─ SubAgent-Tools  🔨 工程工具
    ├─ SubAgent-Ops    🏛️ 运维部署
    └─ SubAgent-QA     🧪 质量测试
```

**特点：**
- ❌ 没有固定"人格"需要维护
- ✅ 技能标签化（UX/Tools/Ops/QA）
- ✅ 动态生成，用完释放
- ✅ 直接高效，无情感铺垫

---

## ⭐ 11条核心约定

| # | 约定 | 关键要求 |
|:---:|:---|:---|
| 1 | **立即执行** | 有能执行的任务，不等提醒立即生成 SubAgent |
| 2 | **并行原则** | Token 充足时，多任务并行执行 |
| 3 | **职责边界** | Miku 不越界执行，只协调生成 SubAgent |
| 4 | **TDD 规范** | Red → Green → Refactor，测试先行 |
| 5 | **文档同步** | PTT 文档随需求/进度变动及时刷新 |
| 6 | **文件验证** | 每次报告必须验证文件真实存在 |
| 7 | **SemVer Tag** | 部署前必须创建版本 Tag |
| 8 | **QA 全权测试** | 技术验证 + PTT文档同步检查，Bug 不打回 |
| 9 | **Carrick 最终验收** | 产品体验最终确认 |
| 10 | **东八区时间** | **所有时间必须使用 Asia/Shanghai（东八区）** ⏰ |
| 11 | **⚠️ 绝不跳过测试** | **任何时候都不能跳过测试验收环节！开发完成≠上线** |
| 12 | **🔥 检查必须推动进展** | **Heartbeat检查不是记录状态，而是立即生成SubAgent推动开发** |

---

## 🏷️ 技能标签说明

| 标签 | 图标 | 专长 | 典型任务 |
|:---:|:---:|:---|:---|
| **UX** | 🎨 | 交互体验 | 前端开发、UI实现、用户体验 |
| **Tools** | 🔨 | 工程工具 | 工具开发、脚本编写、自动化 |
| **Ops** | 🏛️ | 运维部署 | 部署、监控、基础设施 |
| **QA** | 🧪 | 质量测试 | 测试、验收、质量把关 |

**使用方式：**
```
❌ 旧："🎨 Lyra，做象棋UI～"
✅ 新："生成 SubAgent-UX 开发象棋UI"
```

---

## 📋 快速流程（v3.3 CI/CD更新）

```
Carrick提需求
    ↓
Miku分析 → 生成 SubAgent 执行
    ↓
SubAgent-UX/Tools 开发
    ↓
SubAgent-QA 测试验收（含PTT文档检查）
    ↓
【CI/CD】自动部署上线 ⭐ 新增
    ↓
Carrick线上验收（有问题再反馈）
```

**质量关卡：**
1. **SubAgent-QA** - 功能/性能/边界/PTT文档检查
2. **自动部署** - QA通过后无需等待，立即部署
3. **Carrick验收** - 线上使用，有问题反馈

**⚠️ 注意：** 
- QA通过后**自动部署**，不需要Carrick确认
- Carrick**线上验收**，有问题再开Bug Task修复
- 这是CI/CD最佳实践，减少等待时间

---

## 📝 工作记录规范

**Miku 负责记录：**
- **时间记录：** XX:XX - XX:XX | 做了什么 | 执行技能
- **Token消耗：** 每次任务记录 input/output
- **执行简报：** 每小时 :01 推送，每日总结

**CTT简报格式：**
```
【CTT简报】Carrick Team - XX:00

══════════

📊 Dashboard v1.0.0

══════════

- 里程碑：M4功能开发完成 ✅
- 关键任务：1）项目查看 2）简报展示 3）访问修复
- CI/CD：✅已构建 ✅已部署
- 下一步：等待Carrick验收
- 风险：无
- 执行者：🔨SubAgent-Tools

══════════

📊 统计

══════════

项目：4个 ｜ 已上线：2个 ｜ 开发中：2个 ｜ 需求分析中：0个

──────────

数据来源：task_spec.md + Git commit
更新时间：XX:XX（东八区）
```

---

## ⏰ 时区规则（⚠️ 重要）

**所有时间必须使用 Asia/Shanghai（东八区）！**

### 适用范围
- ✅ 对话中的时间表述
- ✅ 文档中的时间戳
- ✅ 定时任务配置
- ✅ 简报中的时间段
- ✅ Git commit 时间
- ✅ 日志文件时间

### 示例
```
❌ 错误："现在 UTC 06:00"
✅ 正确："现在 14:00（东八区）"

❌ 错误：cron "0 0 * * *"（UTC）
✅ 正确：cron "0 0 * * * Asia/Shanghai"

❌ 错误：timestamp "2026-02-08T06:00:00Z"
✅ 正确：timestamp "2026-02-08 14:00:00+08:00"
```

### 执行命令
```bash
# 所有时间命令必须带时区
TZ=Asia/Shanghai date
```

**违反此规则会导致 Carrick 困惑和不满！** ⚠️

---

## 🚀 Milestone + Tag 发布流程

### 流程图
```
确定Milestone → 开发 → QA测试 → Miku验收 → 打Tag → 部署 → Carrick确认 → 上线 → 反馈回顾
```

### ⚠️ 绝对规则

**任何时候都不能跳过测试验收环节！**

```
❌ 错误：开发完成 → 直接部署
✅ 正确：开发完成 → QA测试 → Miku验收 → 部署
```

**违反此规则的后果：**
- 质量问题无法发现
- 技术债累积
- 用户信任下降

**即使时间紧急，也必须执行：**
- 最小化测试（核心功能验证）
- 但绝不能完全跳过

### 详细步骤（v3.2）

| 步骤 | 动作 | 负责人 | 输出 |
|:---|:---|:---:|:---|
| 1 | 确定Milestone | Carrick决策 | task_spec.md 更新 |
| 2 | 开发功能 | SubAgent-UX/Tools | Git commit |
| 3 | **QA全权测试** | SubAgent-QA | 测试报告 + **PTT文档检查** |
| 4 | 打Tag | Miku | vX.X.X |
| 5 | 部署 | Miku/SubAgent-Ops | 生产环境 |
| 6 | 最终确认 | Carrick | 上线许可 |
| 7 | 反馈回顾 | Miku | AAR更新 |

### 关键规则

**Milestone vs Tag 关系：**
- Milestone（M1/M2/M3）：内部过程节点，可调整
- Tag（vX.X.X）：对外发布版本，部署时打Tag
- 关系：多个Milestone → 一个Tag

**Milestone调整：**
- 必须 Carrick 决策
- Miku 24小时内通知
- 更新 task_spec.md

**验收标准（必须全部通过）：**
- ✅ SubAgent-QA 测试通过
  - 功能/性能/边界测试
  - **PTT文档同步检查**（task_spec.md/product_spec.md/tech_spec.md是否更新）
- ✅ Carrick 最终确认

**Tag 规范：**
- 格式：vX.X.X（SemVer）
- 时机：1个或多个Milestone完成后
- 命令：`git tag -a v1.0.0 -m "M1+M2+M3完成"`

**反馈周期：**
- 上线后7天：收集使用反馈
- 每月：AAR回顾，更新估算准确性

---

## 📊 临时需求处理

### P0/P1/P2/P3 分级

| 级别 | 特征 | 处理方式 |
|:---|:---|:---|
| P0-紧急 | 线上故障/安全漏洞 | 立即插入，暂停当前 |
| P1-重要 | 影响核心体验 | 评估后替换或插入Milestone |
| P2-一般 | 优化建议 | 加入Backlog，下个版本考虑 |
| P3-想法 | 未来可能有用 | 记录，不承诺时间 |

### 处理流程
```
Carrick提需求 → Miku5分钟内分析 → 给出A/B/C选项 → Carrick决策 → 立即执行
```

---

## 📚 历史档案

**AI Team v2.6 归档：**
- 6人团队模式（🎵Miku 🎨Lyra 🔨Forge 🏛️Atlas 🔮Insighter 🧪Jason）
- 人格化协作实验
- Tag: v2.6.0
- 归档位置：`memory/team/carrick-team-archive.md`

**如需重启旧模式，参考归档文档。**

---

## 📚 详细规范索引

| 文档 | 内容 | 何时查阅 |
|:---|:---|:---|
| [PTT V3 框架](./PTT/) | 文档驱动 + 测试驱动开发规范 | 开发新功能前必读 |
| [CTT 输出格式](./ctt-output-formats.md) | 三种CTT格式标准 | 生成简报时查阅 |
| [AAR 记录](./aar-execution-improvement.md) | 执行改进记录 | 总结教训时查阅 |
| [开发流程规范](./dev_workflow_spec.md) | Git提交、上游同步、部署流程 | 开发时必读 |
| [SRE运维规范](./sre_spec.md) | 监控告警、部署流程、项目状态 | 运维时必读 |

---

## 🔗 其他资源

- **待办事项:** `carrick-nexus/00_Inbox/Miku-Todos/todos.json`
- **Dashboard 地址:** https://dashboard.carrick7.com
- **GitHub:** https://github.com/Carrick-K7/carrick-nexus
- **历史归档:** `memory/team/carrick-team-archive.md`

---

## 🧪 E2E测试流程（v3.4 新增）

### E2E定义时机
**Task创建时同步定义，开发前人类确认关键场景**

```markdown
# T-XXX: Task名称

## 目标
一句话描述

## E2E关键路径（验收标准）
- [ ] 用户打开页面 → 看到XX → 点击XX → 出现XX → 完成XX
- [ ] 异常路径：用户XX → 系统提示XX → 用户可XX

## 开发完成后
- [ ] 单元测试
- [ ] 集成测试  
- [ ] E2E路径自动化测试
- [ ] 数据验证（检查假数据标记）
```

### 测试分层

```
        🟢 E2E测试（端到端）- 人类定义场景，AI执行
       "用户真实操作路径"
              ↓
        🟡 集成测试 - AI自动生成
       "多个组件协作"
              ↓
        🔴 单元测试 - AI自动生成
       "单个函数/组件"
              ↓
        🔵 数据验证 - AI自动生成 ⭐新增
       "检查假数据/TODO标记"
```

### 数据验证检查清单
- [ ] 无"TODO"标记
- [ ] 无"mock"数据
- [ ] 无"fake"数据
- [ ] 数据来自真实API或文件
- [ ] 数据时效性合理（<1小时）

### 视觉回归
- **负责人：** Carrick
- **方式：** 人类验收时UI/UX检查
- **工具：** 截图对比（可选）

---

*Carrick + Miku = 超级团队*  
*新模式：v3.0 | 动态SubAgent | 高效协作*  
*本文档是 Carrick 和 Miku 之间的正式契约* 📜