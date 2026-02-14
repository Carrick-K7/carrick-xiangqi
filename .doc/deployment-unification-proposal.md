# 统一部署规范提案

## 当前部署方式

| 项目 | 当前方式 | 路径 |
|:---|:---|:---|
| Dashboard | 本地文件 | `/var/www/dashboard` |
| Xiangqi | 本地文件 | `/var/www/xiangqi/dist` |
| Toolbox | Zeabur代理 | `carrick-toolbox.zeabur.app` |
| Drum | 本地文件 | `/var/www/drum-app/app` |

## 建议统一方案

### 方案A：全部本地部署（推荐）

```
/var/www/
├── dashboard/       # Dashboard
├── xiangqi/         # Xiangqi
├── toolbox/         # Toolbox (从Zeabur迁回)
└── drum/            # Drum (drum-app → drum)
```

**Caddy配置：**
```caddy
xxx.carrick7.com {
    root * /var/www/xxx
    file_server
    try_files {path} {path}/ /index.html
}
```

### 方案B：全部反向代理

```
Dashboard  → localhost:5173
Xiangqi    → localhost:5174
Toolbox    → Zeabur / localhost
Drum       → localhost:5175
```

## 扩展性考虑

新增项目时：
1. 创建 `/var/www/{project}`
2. 添加 Caddy 配置
3. 部署脚本统一格式

**建议采用方案A（本地部署）**，因为：
- 简单可控
- 无外部依赖
- 便于CI/CD统一处理

---

## 小说动态加载方案

### 当前问题
- 章节列表硬编码在 NovelView.vue
- 实际文件34个，显示32个

### 解决方案

**API端点：** `GET /api/novels`
返回：
```json
{
  "novels": [
    {
      "id": "ak-daily",
      "title": "人机AK的日常",
      "chapters": [
        {"title": "...", "file": "..."}
      ]
    }
  ]
}
```

**实现方式：**
1. 后端扫描 `public/novels/` 目录
2. 按文件名排序生成章节列表
3. 前端页面加载时请求API

**GitHub同步：**
- 定时任务每小时拉取最新章节
- 或用户访问时触发同步检查
