/**
 * 工作记录系统 - 数据采集服务
 * Phase 1: SubAgent任务记录、Git监听、文件监控
 */
export interface SubAgentTask {
    id: string;
    member: string;
    task: string;
    start_time: string;
    end_time?: string;
    duration?: number;
    deliverables: string[];
    status: 'running' | 'completed' | 'failed';
    source: 'subagent';
    time_source?: 'real_subagent_callback' | 'manual';
}
export interface GitCommit {
    id: string;
    hash: string;
    author: string;
    email: string;
    timestamp: string;
    message: string;
    files: string[];
    repo: string;
    source: 'git';
    time_source?: 'git_log_ci' | 'manual';
}
export interface FileChange {
    id: string;
    path: string;
    change_type: 'create' | 'modify' | 'delete';
    timestamp: string;
    size?: number;
    member?: string;
    source: 'filesystem';
    time_source?: 'fs_stat_mtime' | 'watcher_detected';
}
export type WorkLogEntry = SubAgentTask | GitCommit | FileChange;
export declare function getLogPath(date?: string): string;
export declare function ensureDir(path: string): Promise<void>;
export declare class SubAgentRecorder {
    private runningTasks;
    startTask(member: string, task: string, taskId?: string): Promise<string>;
    endTask(taskId: string, deliverables?: string[], success?: boolean): Promise<void>;
    updateTaskDeliverable(taskId: string, deliverable: string): Promise<void>;
    private saveEntry;
    getRunningTasks(): SubAgentTask[];
}
export declare class GitMonitor {
    private repos;
    private watchedRepos;
    private intervalId?;
    constructor(repos?: string[]);
    addRepo(repoPath: string): void;
    scanAll(member: string): Promise<GitCommit[]>;
    scanRepo(repoPath: string, member?: string): Promise<GitCommit[]>;
    private saveGitCommit;
    startWatching(intervalMs?: number): void;
    stopWatching(): void;
}
export declare class FilesystemMonitor {
    private basePath;
    private watchers;
    private changeBuffer;
    private flushInterval?;
    private pendingStats;
    private member;
    constructor(basePath: string);
    start(member: string): Promise<void>;
    private recordFileChange;
    private flushChanges;
    stop(): Promise<void>;
}
export declare class WorkLogCollector {
    subAgent: SubAgentRecorder;
    git: GitMonitor;
    fs: FilesystemMonitor;
    constructor(repos?: string[], projectsPath?: string);
    init(member: string): Promise<void>;
    shutdown(): Promise<void>;
}
export declare const defaultCollector: WorkLogCollector;
//# sourceMappingURL=collector.d.ts.map