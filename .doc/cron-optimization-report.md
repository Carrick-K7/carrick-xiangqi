# 定时任务优化报告

## 当前定时任务列表

| 任务名 | 类型 | sessionTarget | 是否需要Agent | 状态 |
|:---|:---:|:---:|:---:|:---:|
| team-check-30min | systemEvent | main | ❌ 不需要 | ✅ 正常 |
| **novel-sync-daily** | systemEvent | main | ❌ 不需要 | ✅ 已优化 |
| daily-team-summary-pushdeer | systemEvent | main | ❌ 不需要 | ✅ 正常 |
| subscription-reminder | systemEvent | main | ❌ 不需要 | ✅ 正常 |
| ctt-briefing-final | agentTurn | isolated | ✅ 需要 | ✅ 正常 |
| moltbook-top5-hourly | agentTurn | isolated | ✅ 需要 | ⚠️ 待观察 |
| hn-top5-daily | agentTurn | isolated | ✅ 需要 | ⚠️ 待观察 |

## 优化说明

### 已轻量化（4个）
1. ✅ **team-check-30min** - 只是发送检查提示
2. ✅ **novel-sync-daily** - 改回 systemEvent，Miku直接执行shell脚本
3. ✅ **daily-team-summary-pushdeer** - 只是发送提示
4. ✅ **subscription-reminder** - 只是发送提醒

### 需要Agent（3个）
这些任务需要LLM生成内容，无法轻量化：

1. **ctt-briefing-final** - 生成CTT简报（需要理解task_spec内容）
2. **moltbook-top5-hourly** - 抓取+总结Moltbook帖子
3. **hn-top5-daily** - 抓取+总结HN新闻

### 状态说明
- moltbook 和 hn 之前报错是因为没配置agent，现在已改为 kimi-coding-k2p5
- 下次执行时观察是否正常

## 建议

当前配置合理：
- 简单任务（执行脚本/发通知）→ systemEvent + main session
- 复杂任务（需要LLM推理）→ agentTurn + isolated session

无需进一步调整。
