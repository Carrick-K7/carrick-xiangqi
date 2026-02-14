/**
 * 工作记录系统 - 查询服务
 * Phase 2: API 设计和查询逻辑
 */
import { readFile, readdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
const BASE_LOG_PATH = '/data/work-logs';
// ============ 查询服务 ============
export class WorkLogQueryService {
    // GET /api/work-logs/query
    async query(params) {
        const { member, date, start, end, source } = params;
        // 确定查询日期
        const targetDate = date || new Date().toISOString().split('T')[0];
        const logPath = join(BASE_LOG_PATH, targetDate);
        if (!existsSync(logPath)) {
            return { entries: [], total: 0, filters: params };
        }
        // 读取所有相关文件
        const entries = [];
        if (member) {
            // 查询特定成员
            if (!source || source === 'subagent') {
                entries.push(...await this.readJsonl(join(logPath, `${member}.jsonl`)));
            }
            if (!source || source === 'git') {
                entries.push(...await this.readJsonl(join(logPath, `git-${member}.jsonl`)));
            }
            if (!source || source === 'filesystem') {
                entries.push(...await this.readJsonl(join(logPath, `fs-${member}.jsonl`)));
            }
        }
        else {
            // 查询所有成员
            const files = await readdir(logPath);
            for (const file of files) {
                if (file.endsWith('.jsonl')) {
                    const fileSource = file.startsWith('git-') ? 'git' :
                        file.startsWith('fs-') ? 'filesystem' : 'subagent';
                    if (!source || source === fileSource) {
                        entries.push(...await this.readJsonl(join(logPath, file)));
                    }
                }
            }
        }
        // 时间范围过滤
        let filtered = entries;
        if (start || end) {
            filtered = entries.filter(e => this.isInTimeRange(e, start, end));
        }
        // 按时间排序
        filtered.sort((a, b) => {
            const aTime = this.getEntryTime(a);
            const bTime = this.getEntryTime(b);
            return aTime.localeCompare(bTime);
        });
        return {
            entries: filtered,
            total: filtered.length,
            filters: params,
        };
    }
    // GET /api/work-logs/timeline
    async getTimeline(params) {
        const { date, member } = params;
        const result = await this.query({ date, member });
        // 按小时分组
        const hourMap = new Map();
        for (let i = 0; i < 24; i++) {
            hourMap.set(i, {
                time: `${i.toString().padStart(2, '0')}:00`,
                hour: i,
                entries: [],
                type: 'task',
            });
        }
        for (const entry of result.entries) {
            const entryDate = new Date(this.getEntryTime(entry));
            const hour = entryDate.getHours();
            const event = hourMap.get(hour);
            event.entries.push(entry);
            // 确定类型
            if (entry.source === 'git')
                event.type = 'git';
            else if (entry.source === 'filesystem')
                event.type = 'file';
            else
                event.type = 'task';
        }
        return {
            date,
            hours: Array.from(hourMap.values()),
            totalEvents: result.total,
        };
    }
    // GET /api/work-logs/summary
    async getSummary(params) {
        const { member, date } = params;
        const query = await this.query({ member, date });
        const tasks = query.entries.filter(e => e.source === 'subagent');
        const commits = query.entries.filter(e => e.source === 'git');
        const fileChanges = query.entries.filter(e => e.source === 'filesystem');
        // 计算工作小时分布
        const workHours = new Array(24).fill(0).map((_, i) => ({ hour: i, activity: 0 }));
        for (const task of tasks) {
            const startHour = new Date(task.start_time).getHours();
            workHours[startHour].activity += 1;
            if (task.end_time) {
                const endHour = new Date(task.end_time).getHours();
                if (endHour !== startHour) {
                    workHours[endHour].activity += 1;
                }
            }
        }
        // 合并所有交付物
        const deliverables = tasks
            .flatMap(t => t.deliverables)
            .filter((d, i, arr) => arr.indexOf(d) === i); // 去重
        return {
            member,
            date,
            totalTasks: tasks.length,
            completedTasks: tasks.filter(t => t.status === 'completed').length,
            totalGitCommits: commits.length,
            totalFileChanges: fileChanges.length,
            totalDuration: tasks.reduce((sum, t) => sum + (t.duration || 0), 0),
            deliverables,
            workHours,
        };
    }
    // 获取成员列表
    async getMembers(date) {
        const targetDate = date || new Date().toISOString().split('T')[0];
        const logPath = join(BASE_LOG_PATH, targetDate);
        if (!existsSync(logPath))
            return [];
        const files = await readdir(logPath);
        const members = new Set();
        for (const file of files) {
            if (file.endsWith('.jsonl')) {
                // 解析文件名获取成员名
                let member = file.replace('.jsonl', '');
                member = member.replace(/^(git-|fs-)/, '');
                members.add(member);
            }
        }
        return Array.from(members).sort();
    }
    // 获取日期列表
    async getDates() {
        if (!existsSync(BASE_LOG_PATH))
            return [];
        const entries = await readdir(BASE_LOG_PATH);
        return entries
            .filter(e => e.match(/^\d{4}-\d{2}-\d{2}$/))
            .sort()
            .reverse();
    }
    // 辅助方法
    async readJsonl(filePath) {
        if (!existsSync(filePath))
            return [];
        try {
            const content = await readFile(filePath, 'utf-8');
            return content
                .trim()
                .split('\n')
                .filter(line => line.trim())
                .map(line => JSON.parse(line));
        }
        catch (err) {
            console.error(`Failed to read ${filePath}:`, err);
            return [];
        }
    }
    getEntryTime(entry) {
        if ('timestamp' in entry)
            return entry.timestamp;
        if ('start_time' in entry)
            return entry.start_time;
        return '';
    }
    isInTimeRange(entry, start, end) {
        const time = this.getEntryTime(entry);
        if (!time)
            return false;
        const hourMin = time.slice(11, 16); // HH:MM from ISO string
        if (start && hourMin < start)
            return false;
        if (end && hourMin > end)
            return false;
        return true;
    }
}
// 导出单例
export const queryService = new WorkLogQueryService();
//# sourceMappingURL=query.js.map