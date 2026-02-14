# 开发流程规范

**版本:** v1.0  
**适用范围:** Lyra、Forge、Miku

---

## 1. Git 工作流

### 1.1 提交规范
```bash
# 1. 功能开发完成，测试通过
git add -A
git commit -m "feat: 功能描述"

# 2. 创建 Tag（部署前必须）
git tag -a v1.2.0 -m "feat: 功能描述"

# 3. 推送到上游
git push origin main
git push origin v1.2.0
```

### 1.2 上游同步
**注意：** 上游可能是 GitHub 或其他平台
- GitHub: `github.com/Carrick-K7/`
- 其他: 根据项目配置

**必须及时推送，确保同步！**

---

## 2. PTT 文档同步

### 2.1 什么时候刷新文档？
| 场景 | 操作 |
|:---|:---|
| 需求变动 | 更新 `product_spec.md` |
| 技术方案变动 | 更新 `tech_spec.md` |
| 开发进度变动 | 更新 `task_spec.md` |
| 发现新边界情况 | 补充测试用例 |

### 2.2 文档先于代码
**禁止：** 先写代码，后补文档  
**必须：** 文档更新 → Git commit → 再写代码

---

## 3. 部署流程

### 3.1 部署前检查清单
- [ ] Jason 验收通过
- [ ] Miku 预发布测试通过
- [ ] 已创建 SemVer Tag
- [ ] 已推送到上游
- [ ] 文档已更新

### 3.2 部署步骤
```bash
# 1. 构建
npm run build

# 2. 部署到生产
./deploy.sh

# 3. 验证生产环境
curl https://xxx.com/health

# 4. 通知 Carrick
```

---

## 4. 测试要求

### 4.1 TDD 强制
- Red: 先写失败测试
- Green: 写代码让测试通过
- Refactor: 优化保持测试通过

### 4.2 测试覆盖率
- 业务逻辑: ≥ 80%
- 关键路径: 必须 100%

---

*违反规范 → Jason 打回 → 重新执行* 🛑
