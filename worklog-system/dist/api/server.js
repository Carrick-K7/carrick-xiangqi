/**
 * 工作记录系统 - API 服务器
 * Phase 2: RESTful API
 */
import express from 'express';
import cors from 'cors';
import { queryService } from '../src/query/query.js';
import { WorkLogCollector } from '../src/collect/collector.js';
import { reportGenerator } from '../src/utils/reports.js';
const app = express();
const PORT = process.env.WORKLOG_PORT || 3456;
// 中间件
app.use(cors());
app.use(express.json());
// 全局collector实例
const collector = new WorkLogCollector([
    '/root/.openclaw/workspace',
]);
// ============ API Routes ============
// 健康检查
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'worklog-system',
        timestamp: new Date().toISOString(),
    });
});
// GET /api/work-logs/query - 查询工作记录
app.get('/api/work-logs/query', async (req, res) => {
    try {
        const params = {
            member: req.query.member,
            date: req.query.date,
            start: req.query.start,
            end: req.query.end,
            source: req.query.source,
        };
        const result = await queryService.query(params);
        res.json({
            success: true,
            data: result,
        });
    }
    catch (err) {
        console.error('Query error:', err);
        res.status(500).json({ success: false, error: String(err) });
    }
});
// GET /api/work-logs/timeline - 获取时间线
app.get('/api/work-logs/timeline', async (req, res) => {
    try {
        const params = {
            date: req.query.date || new Date().toISOString().split('T')[0],
            member: req.query.member,
        };
        if (!params.date) {
            return res.status(400).json({ success: false, error: 'date is required' });
        }
        const result = await queryService.getTimeline(params);
        res.json({
            success: true,
            data: result,
        });
    }
    catch (err) {
        console.error('Timeline error:', err);
        res.status(500).json({ success: false, error: String(err) });
    }
});
// GET /api/work-logs/summary - 获取每日汇总
app.get('/api/work-logs/summary', async (req, res) => {
    try {
        const params = {
            member: req.query.member,
            date: req.query.date || new Date().toISOString().split('T')[0],
        };
        if (!params.member) {
            return res.status(400).json({ success: false, error: 'member is required' });
        }
        const result = await queryService.getSummary(params);
        res.json({
            success: true,
            data: result,
        });
    }
    catch (err) {
        console.error('Summary error:', err);
        res.status(500).json({ success: false, error: String(err) });
    }
});
// GET /api/work-logs/members - 获取成员列表
app.get('/api/work-logs/members', async (req, res) => {
    try {
        const date = req.query.date;
        const members = await queryService.getMembers(date);
        res.json({
            success: true,
            data: { members, date: date || new Date().toISOString().split('T')[0] },
        });
    }
    catch (err) {
        console.error('Members error:', err);
        res.status(500).json({ success: false, error: String(err) });
    }
});
// GET /api/work-logs/dates - 获取日期列表
app.get('/api/work-logs/dates', async (req, res) => {
    try {
        const dates = await queryService.getDates();
        res.json({
            success: true,
            data: { dates },
        });
    }
    catch (err) {
        console.error('Dates error:', err);
        res.status(500).json({ success: false, error: String(err) });
    }
});
// POST /api/work-logs/task/start - 开始任务
app.post('/api/work-logs/task/start', async (req, res) => {
    try {
        const { member, task, taskId } = req.body;
        if (!member || !task) {
            return res.status(400).json({
                success: false,
                error: 'member and task are required'
            });
        }
        const id = await collector.subAgent.startTask(member, task, taskId);
        res.json({
            success: true,
            data: { taskId: id, status: 'started', member, task },
        });
    }
    catch (err) {
        console.error('Task start error:', err);
        res.status(500).json({ success: false, error: String(err) });
    }
});
// POST /api/work-logs/task/end - 结束任务
app.post('/api/work-logs/task/end', async (req, res) => {
    try {
        const { taskId, deliverables, success = true } = req.body;
        if (!taskId) {
            return res.status(400).json({
                success: false,
                error: 'taskId is required'
            });
        }
        await collector.subAgent.endTask(taskId, deliverables || [], success);
        res.json({
            success: true,
            data: { taskId, status: 'completed' },
        });
    }
    catch (err) {
        console.error('Task end error:', err);
        res.status(500).json({ success: false, error: String(err) });
    }
});
// POST /api/work-logs/git/scan - 手动触发Git扫描
app.post('/api/work-logs/git/scan', async (req, res) => {
    try {
        const { member } = req.body;
        const commits = await collector.git.scanAll(member || '');
        res.json({
            success: true,
            data: { scanned: commits.length, commits },
        });
    }
    catch (err) {
        console.error('Git scan error:', err);
        res.status(500).json({ success: false, error: String(err) });
    }
});
// GET /api/work-logs/running - 获取运行中任务
app.get('/api/work-logs/running', (req, res) => {
    const tasks = collector.subAgent.getRunningTasks();
    res.json({
        success: true,
        data: { tasks, count: tasks.length },
    });
});
// GET /api/work-logs/report/hourly - 获取小时简报
app.get('/api/work-logs/report/hourly', async (req, res) => {
    try {
        const date = req.query.date || new Date().toISOString().split('T')[0];
        const hour = parseInt(req.query.hour || new Date().getHours().toString(), 10);
        const format = req.query.format || 'json';
        const report = await reportGenerator.generateHourlyReport(date, hour);
        if (format === 'text') {
            res.setHeader('Content-Type', 'text/plain; charset=utf-8');
            res.send(reportGenerator.generateReportText(report));
        }
        else {
            res.json({
                success: true,
                data: report,
            });
        }
    }
    catch (err) {
        console.error('Hourly report error:', err);
        res.status(500).json({ success: false, error: String(err) });
    }
});
// GET /api/work-logs/report/daily - 获取日报
app.get('/api/work-logs/report/daily', async (req, res) => {
    try {
        const date = req.query.date || new Date().toISOString().split('T')[0];
        const format = req.query.format || 'json';
        const report = await reportGenerator.generateDailyReport(date);
        if (format === 'markdown') {
            res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
            res.send(reportGenerator.generateDailyMarkdown(report));
        }
        else {
            res.json({
                success: true,
                data: report,
            });
        }
    }
    catch (err) {
        console.error('Daily report error:', err);
        res.status(500).json({ success: false, error: String(err) });
    }
});
// 启动服务器
export function startServer(port = PORT) {
    return new Promise((resolve) => {
        app.listen(port, () => {
            console.log(`[WorkLog] API server running on port ${port}`);
            resolve();
        });
    });
}
// 导出app用于测试
export { app };
// 如果直接运行此文件
if (import.meta.url === `file://${process.argv[1]}`) {
    startServer();
}
//# sourceMappingURL=server.js.map