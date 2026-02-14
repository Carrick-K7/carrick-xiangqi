/**
 * 工作记录系统 - 数据采集服务
 * Phase 1: SubAgent任务记录、Git监听、文件监控
 */
import { appendFile, mkdir, stat } from 'fs/promises';
import { existsSync } from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';
import { watch } from 'fs';
import { join } from 'path';
const execAsync = promisify(exec);
// ============ 路径工具 ============
const BASE_LOG_PATH = '/data/work-logs';
export function getLogPath(date) {
    const d = date || new Date().toISOString().split('T')[0];
    return join(BASE_LOG_PATH, d);
}
export async function ensureDir(path) {
    if (!existsSync(path)) {
        await mkdir(path, { recursive: true });
    }
}
// ============ Task 1.1: SubAgent任务记录 ============
export class SubAgentRecorder {
    runningTasks = new Map();
    async startTask(member, task, taskId) {
        const id = taskId || `task-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        // 使用真实当前时间（SubAgent spawn 时刻）
        const realStartTime = new Date().toISOString();
        const entry = {
            id,
            member,
            task,
            start_time: realStartTime,
            deliverables: [],
            status: 'running',
            source: 'subagent',
            time_source: 'real_subagent_callback',
        };
        this.runningTasks.set(id, entry);
        await this.saveEntry(member, entry);
        return id;
    }
    async endTask(taskId, deliverables = [], success = true) {
        const task = this.runningTasks.get(taskId);
        if (!task) {
            throw new Error(`Task ${taskId} not found`);
        }
        // 使用真实当前时间（SubAgent complete 时刻）
        const realEndTime = new Date();
        const realStartTime = new Date(task.start_time);
        const realDurationSec = Math.round((realEndTime.getTime() - realStartTime.getTime()) / 1000);
        task.end_time = realEndTime.toISOString();
        task.duration = realDurationSec;
        task.deliverables = deliverables;
        task.status = success ? 'completed' : 'failed';
        task.time_source = 'real_subagent_callback';
        this.runningTasks.delete(taskId);
        await this.saveEntry(task.member, task);
    }
    async updateTaskDeliverable(taskId, deliverable) {
        const task = this.runningTasks.get(taskId);
        if (task) {
            task.deliverables.push(deliverable);
        }
    }
    async saveEntry(member, entry) {
        const logPath = getLogPath();
        await ensureDir(logPath);
        const filePath = join(logPath, `${member}.jsonl`);
        await appendFile(filePath, JSON.stringify(entry) + '\n');
    }
    getRunningTasks() {
        return Array.from(this.runningTasks.values());
    }
}
// ============ Task 1.2: Git提交监听 ============
export class GitMonitor {
    repos;
    watchedRepos = new Set();
    intervalId;
    constructor(repos = []) {
        this.repos = repos;
        repos.forEach(r => this.watchedRepos.add(r));
    }
    addRepo(repoPath) {
        this.watchedRepos.add(repoPath);
    }
    async scanAll(member) {
        const commits = [];
        for (const repo of this.watchedRepos) {
            const repoCommits = await this.scanRepo(repo, member);
            commits.push(...repoCommits);
        }
        return commits;
    }
    async scanRepo(repoPath, member) {
        try {
            // 获取今日提交 - 使用 %ci (committer date ISO) 获取真实提交时间
            const today = new Date().toISOString().split('T')[0];
            const cmd = `cd "${repoPath}" && git log --since="${today} 00:00" --until="${today} 23:59" --pretty=format:"%H|%an|%ae|%ci|%s"`;
            const { stdout } = await execAsync(cmd);
            if (!stdout.trim())
                return [];
            const commits = [];
            const lines = stdout.trim().split('\n');
            for (const line of lines) {
                const [hash, author, email, timestamp, ...msgParts] = line.split('|');
                const message = msgParts.join('|');
                // 获取变更文件
                const fileCmd = `cd "${repoPath}" && git show --name-only --format="" ${hash}`;
                const { stdout: fileOutput } = await execAsync(fileCmd);
                const files = fileOutput.trim().split('\n').filter(f => f);
                const commit = {
                    id: `git-${hash.slice(0, 12)}`,
                    hash: hash.slice(0, 12),
                    author,
                    email,
                    timestamp,
                    message,
                    files,
                    repo: repoPath.split('/').pop() || 'unknown',
                    source: 'git',
                    time_source: 'git_log_ci',
                };
                commits.push(commit);
                await this.saveGitCommit(author, commit);
            }
            return commits;
        }
        catch (err) {
            console.error(`Failed to scan repo ${repoPath}:`, err);
            return [];
        }
    }
    async saveGitCommit(member, commit) {
        const logPath = getLogPath();
        await ensureDir(logPath);
        const filePath = join(logPath, `git-${member}.jsonl`);
        await appendFile(filePath, JSON.stringify(commit) + '\n');
    }
    startWatching(intervalMs = 60000) {
        // 每分钟扫描一次
        this.intervalId = setInterval(() => {
            this.scanAll('');
        }, intervalMs);
    }
    stopWatching() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }
    }
}
// ============ Task 1.3: 文件系统监控 ============
export class FilesystemMonitor {
    basePath;
    watchers = new Map();
    changeBuffer = [];
    flushInterval;
    pendingStats = [];
    member = '';
    constructor(basePath) {
        this.basePath = basePath;
    }
    async start(member) {
        if (!existsSync(this.basePath)) {
            console.warn(`Path ${this.basePath} does not exist`);
            return;
        }
        this.member = member;
        // 批量写入，每5秒刷新一次
        this.flushInterval = setInterval(() => this.flushChanges(this.member), 5000);
        const watcher = watch(this.basePath, { recursive: true }, (eventType, filename) => {
            if (!filename)
                return;
            const changeType = eventType === 'rename' ? 'create' : 'modify';
            const filePath = join(this.basePath, filename);
            // 异步获取文件状态，但立即返回以避免阻塞 watcher
            const statPromise = this.recordFileChange(filePath, changeType, member);
            this.pendingStats.push(statPromise);
            // 清理已完成的 promise
            statPromise.finally(() => {
                const idx = this.pendingStats.indexOf(statPromise);
                if (idx > -1)
                    this.pendingStats.splice(idx, 1);
            });
        });
        this.watchers.set(this.basePath, watcher);
    }
    async recordFileChange(filePath, changeType, member) {
        // 使用 fs.stat() 获取真实文件修改时间 (mtime)
        let realTimestamp = new Date().toISOString();
        let fileSize;
        try {
            const stats = await stat(filePath);
            realTimestamp = stats.mtime.toISOString();
            fileSize = stats.size;
        }
        catch (err) {
            // 如果文件已删除或无法访问，使用当前时间作为后备
            // 静默处理，因为这是正常现象（文件可能被快速删除）
        }
        const change = {
            id: `fs-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            path: filePath,
            change_type: changeType,
            timestamp: realTimestamp,
            size: fileSize,
            member,
            source: 'filesystem',
            time_source: 'fs_stat_mtime',
        };
        this.changeBuffer.push(change);
    }
    async flushChanges(member) {
        if (this.changeBuffer.length === 0)
            return;
        const logPath = getLogPath();
        await ensureDir(logPath);
        const filePath = join(logPath, `fs-${member || this.member}.jsonl`);
        const lines = this.changeBuffer.map(c => JSON.stringify(c)).join('\n') + '\n';
        await appendFile(filePath, lines);
        this.changeBuffer = [];
    }
    async stop() {
        this.watchers.forEach(w => w.close());
        this.watchers.clear();
        if (this.flushInterval) {
            clearInterval(this.flushInterval);
        }
        // 等待所有 pending 的 stat 操作完成
        await Promise.all(this.pendingStats);
        await this.flushChanges(this.member);
    }
}
// ============ 主数据采集器 ============
export class WorkLogCollector {
    subAgent;
    git;
    fs;
    constructor(repos = [], projectsPath = '/root/.openclaw/workspace/projects') {
        this.subAgent = new SubAgentRecorder();
        this.git = new GitMonitor(repos);
        this.fs = new FilesystemMonitor(projectsPath);
    }
    async init(member) {
        // 启动文件监控
        await this.fs.start(member);
        // 启动Git轮询
        this.git.startWatching();
        console.log(`[WorkLog] Collector initialized for ${member}`);
    }
    async shutdown() {
        this.git.stopWatching();
        await this.fs.stop();
    }
}
// 导出单例
export const defaultCollector = new WorkLogCollector();
//# sourceMappingURL=collector.js.map