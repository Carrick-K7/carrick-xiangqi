/**
 * 工作记录系统 - 索引与存储
 * Phase 3: 索引系统、数据完整性、备份策略
 */
import { readFile, writeFile, mkdir, readdir, copyFile } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
const BASE_LOG_PATH = '/data/work-logs';
const INDEX_PATH = join(BASE_LOG_PATH, 'index');
const AUDIT_PATH = join(BASE_LOG_PATH, 'audit');
const BACKUP_PATH = join(BASE_LOG_PATH, 'backup');
// ============ 索引服务 ============
export class IndexService {
    async ensureDirs() {
        await mkdir(INDEX_PATH, { recursive: true });
        await mkdir(AUDIT_PATH, { recursive: true });
        await mkdir(BACKUP_PATH, { recursive: true });
    }
    // ============ 成员索引 ============
    async buildMemberIndex(member) {
        const dates = await this.getDates();
        let totalTasks = 0;
        let totalDuration = 0;
        let lastActivity = '';
        const activeDates = [];
        for (const date of dates) {
            const logPath = join(BASE_LOG_PATH, date, `${member}.jsonl`);
            if (!existsSync(logPath))
                continue;
            const entries = await this.readJsonl(logPath);
            const tasks = entries.filter(e => e.source === 'subagent');
            if (tasks.length > 0) {
                activeDates.push(date);
                totalTasks += tasks.length;
                totalDuration += tasks.reduce((sum, t) => sum + (t.duration || 0), 0);
                const lastTask = tasks[tasks.length - 1];
                const lastTaskEndTime = lastTask.end_time || lastTask.start_time;
                if (!lastActivity || lastTaskEndTime > lastActivity) {
                    lastActivity = lastTaskEndTime;
                }
            }
        }
        return {
            member,
            dates: activeDates,
            totalTasks,
            totalDuration,
            lastActivity,
        };
    }
    async saveMemberIndex(member, index) {
        const filePath = join(INDEX_PATH, `member-${member}.json`);
        await writeFile(filePath, JSON.stringify(index, null, 2));
    }
    async getMemberIndex(member) {
        const filePath = join(INDEX_PATH, `member-${member}.json`);
        if (!existsSync(filePath))
            return null;
        const content = await readFile(filePath, 'utf-8');
        return JSON.parse(content);
    }
    // ============ 项目索引 ============
    async buildProjectIndex(project) {
        const dates = await this.getDates();
        const members = new Set();
        const activeDates = [];
        let totalCommits = 0;
        let totalFileChanges = 0;
        for (const date of dates) {
            const datePath = join(BASE_LOG_PATH, date);
            if (!existsSync(datePath))
                continue;
            const files = await readdir(datePath);
            let hasActivity = false;
            for (const file of files) {
                if (!file.endsWith('.jsonl'))
                    continue;
                const logPath = join(datePath, file);
                const entries = await this.readJsonl(logPath);
                const commits = entries.filter(e => e.source === 'git' &&
                    e.repo === project);
                const fileChanges = entries.filter(e => e.source === 'filesystem' &&
                    e.path.includes(project));
                if (commits.length > 0 || fileChanges.length > 0) {
                    hasActivity = true;
                    const member = file.replace('.jsonl', '').replace(/^(git-|fs-)/, '');
                    members.add(member);
                    totalCommits += commits.length;
                    totalFileChanges += fileChanges.length;
                }
            }
            if (hasActivity) {
                activeDates.push(date);
            }
        }
        return {
            project,
            members: Array.from(members),
            dates: activeDates,
            totalCommits,
            totalFileChanges,
        };
    }
    async saveProjectIndex(project, index) {
        const filePath = join(INDEX_PATH, `project-${project}.json`);
        await writeFile(filePath, JSON.stringify(index, null, 2));
    }
    // ============ 日汇总索引 ============
    async buildDailySummary(date) {
        const datePath = join(BASE_LOG_PATH, date);
        if (!existsSync(datePath)) {
            return {
                date,
                members: [],
                totalTasks: 0,
                totalDuration: 0,
                totalCommits: 0,
                totalFileChanges: 0,
            };
        }
        const members = new Set();
        let totalTasks = 0;
        let totalDuration = 0;
        let totalCommits = 0;
        let totalFileChanges = 0;
        const files = await readdir(datePath);
        for (const file of files) {
            if (!file.endsWith('.jsonl'))
                continue;
            const member = file.replace('.jsonl', '').replace(/^(git-|fs-)/, '');
            members.add(member);
            const logPath = join(datePath, file);
            const entries = await this.readJsonl(logPath);
            const tasks = entries.filter(e => e.source === 'subagent');
            const commits = entries.filter(e => e.source === 'git');
            const fileChanges = entries.filter(e => e.source === 'filesystem');
            totalTasks += tasks.length;
            totalDuration += tasks.reduce((sum, t) => sum + (t.duration || 0), 0);
            totalCommits += commits.length;
            totalFileChanges += fileChanges.length;
        }
        return {
            date,
            members: Array.from(members),
            totalTasks,
            totalDuration,
            totalCommits,
            totalFileChanges,
        };
    }
    async saveDailySummary(date, summary) {
        const filePath = join(INDEX_PATH, `daily-${date}.json`);
        await writeFile(filePath, JSON.stringify(summary, null, 2));
    }
    async getDailySummary(date) {
        const filePath = join(INDEX_PATH, `daily-${date}.json`);
        if (!existsSync(filePath))
            return null;
        const content = await readFile(filePath, 'utf-8');
        return JSON.parse(content);
    }
    // ============ 审计日志 ============
    async logAudit(action, details) {
        const timestamp = new Date().toISOString();
        const log = {
            timestamp,
            action,
            details,
        };
        const date = timestamp.split('T')[0];
        const filePath = join(AUDIT_PATH, `${date}.jsonl`);
        const line = JSON.stringify(log) + '\n';
        await writeFile(filePath, line, { flag: 'a' });
    }
    // ============ 数据完整性检查 ============
    async verifyIntegrity(date) {
        const targetDate = date || new Date().toISOString().split('T')[0];
        const datePath = join(BASE_LOG_PATH, targetDate);
        const issues = [];
        let totalFiles = 0;
        let totalEntries = 0;
        let corrupted = 0;
        if (!existsSync(datePath)) {
            return { valid: true, issues: [], stats: { totalFiles: 0, totalEntries: 0, corrupted: 0 } };
        }
        const files = await readdir(datePath);
        for (const file of files) {
            if (!file.endsWith('.jsonl'))
                continue;
            totalFiles++;
            const filePath = join(datePath, file);
            const content = await readFile(filePath, 'utf-8');
            const lines = content.trim().split('\n').filter(l => l);
            for (let i = 0; i < lines.length; i++) {
                totalEntries++;
                try {
                    JSON.parse(lines[i]);
                }
                catch {
                    corrupted++;
                    issues.push(`Corrupted JSON in ${file} line ${i + 1}`);
                }
            }
        }
        await this.logAudit('integrity_check', {
            date: targetDate,
            totalFiles,
            totalEntries,
            corrupted,
            issues: issues.length,
        });
        return {
            valid: issues.length === 0,
            issues,
            stats: { totalFiles, totalEntries, corrupted },
        };
    }
    // ============ 备份策略 ============
    async createBackup(date) {
        const targetDate = date || new Date().toISOString().split('T')[0];
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupDir = join(BACKUP_PATH, `${targetDate}_${timestamp}`);
        await mkdir(backupDir, { recursive: true });
        const datePath = join(BASE_LOG_PATH, targetDate);
        if (!existsSync(datePath)) {
            return { backupPath: backupDir, files: 0 };
        }
        const files = await readdir(datePath);
        let copied = 0;
        for (const file of files) {
            if (file.endsWith('.jsonl')) {
                await copyFile(join(datePath, file), join(backupDir, file));
                copied++;
            }
        }
        await this.logAudit('backup_created', {
            date: targetDate,
            backupPath: backupDir,
            files: copied,
        });
        return { backupPath: backupDir, files: copied };
    }
    // ============ 重建所有索引 ============
    async rebuildAllIndexes() {
        const dates = await this.getDates();
        const members = new Set();
        // 收集所有成员
        for (const date of dates) {
            const datePath = join(BASE_LOG_PATH, date);
            if (!existsSync(datePath))
                continue;
            const files = await readdir(datePath);
            for (const file of files) {
                if (file.endsWith('.jsonl')) {
                    const member = file.replace('.jsonl', '').replace(/^(git-|fs-)/, '');
                    members.add(member);
                }
            }
        }
        // 重建成员索引
        for (const member of members) {
            const index = await this.buildMemberIndex(member);
            await this.saveMemberIndex(member, index);
        }
        // 重建日汇总索引
        for (const date of dates) {
            const summary = await this.buildDailySummary(date);
            await this.saveDailySummary(date, summary);
        }
        await this.logAudit('indexes_rebuilt', {
            members: members.size,
            dates: dates.length,
        });
    }
    // 辅助方法
    async getDates() {
        if (!existsSync(BASE_LOG_PATH))
            return [];
        const entries = await readdir(BASE_LOG_PATH);
        return entries
            .filter(e => e.match(/^\d{4}-\d{2}-\d{2}$/))
            .sort();
    }
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
        catch {
            return [];
        }
    }
}
// 导出单例
export const indexService = new IndexService();
//# sourceMappingURL=indexer.js.map