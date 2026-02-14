# 项目版本号对比报告

## 📊 Dashboard

| 来源 | 版本号 | 说明 |
|:---|:---:|:---|
| package.json | 0.0.0 | 代码中的版本 |
| task_spec.md | ❌ 不存在 | 未创建该文件 |
| CTT简报 | **v2.1.2** | agent 自行推断 |

**状态**: ⚠️ 不一致（代码0.0.0 vs 简报v2.1.2）

---

## 🐴 Xiangqi

| 来源 | 版本号 | 说明 |
|:---|:---:|:---|
| package.json | 1.0.0 | 代码中的版本 |
| task_spec.md | **v1.0.0** | 明确的版本字段 |
| CTT简报 | **v1.0.0** | 从 task_spec 读取 |

**状态**: ✅ 一致

---

## 🔨 Toolbox

| 来源 | 版本号 | 说明 |
|:---|:---:|:---|
| package.json | 1.0.0 | 代码中的版本 |
| task_spec.md | ❌ 不存在 | 未创建该文件 |
| CTT简报 | **v1.0.0** | agent 推断（与package.json一致） |

**状态**: ⚠️ task_spec缺失，但版本号巧合一致

---

## 🥁 Drum

| 来源 | 版本号 | 说明 |
|:---|:---:|:---|
| package.json | 0.0.0 | 代码中的版本 |
| task_spec.md | ❌ 无版本字段 | 文件存在但无版本信息 |
| CTT简报 | **v0.2.0 / v0.x.x** | agent 推断（不稳定） |

**状态**: ⚠️ 版本号不稳定，每次简报可能不同

---

## 问题总结

1. **Dashboard**: 代码版本过低，agent自行推断v2.1.2
2. **Xiangqi**: ✅ 唯一完整规范的项目
3. **Toolbox**: 缺少task_spec，依赖package.json
4. **Drum**: 版本管理混乱，简报显示不稳定

## 建议

统一采用 **Xiangqi模式**：
1. 更新 package.json 版本号
2. 创建 task_spec.md，包含 `当前版本: vX.X.X`
3. agent 统一从 task_spec.md 读取

这样三个来源的数据就能保持一致。
