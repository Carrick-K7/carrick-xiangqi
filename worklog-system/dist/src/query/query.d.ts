/**
 * 工作记录系统 - 查询服务
 * Phase 2: API 设计和查询逻辑
 */
import type { WorkLogEntry } from '../collect/collector.js';
export interface QueryParams {
    member?: string;
    date?: string;
    start?: string;
    end?: string;
    source?: 'subagent' | 'git' | 'filesystem';
}
export interface TimelineParams {
    date: string;
    member?: string;
}
export interface SummaryParams {
    member: string;
    date: string;
}
export interface QueryResult {
    entries: WorkLogEntry[];
    total: number;
    filters: QueryParams;
}
export interface TimelineEvent {
    time: string;
    hour: number;
    entries: WorkLogEntry[];
    type: 'task' | 'git' | 'file';
}
export interface TimelineResult {
    date: string;
    hours: TimelineEvent[];
    totalEvents: number;
}
export interface DailySummary {
    member: string;
    date: string;
    totalTasks: number;
    completedTasks: number;
    totalGitCommits: number;
    totalFileChanges: number;
    totalDuration: number;
    deliverables: string[];
    workHours: {
        hour: number;
        activity: number;
    }[];
}
export declare class WorkLogQueryService {
    query(params: QueryParams): Promise<QueryResult>;
    getTimeline(params: TimelineParams): Promise<TimelineResult>;
    getSummary(params: SummaryParams): Promise<DailySummary>;
    getMembers(date?: string): Promise<string[]>;
    getDates(): Promise<string[]>;
    private readJsonl;
    private getEntryTime;
    private isInTimeRange;
}
export declare const queryService: WorkLogQueryService;
//# sourceMappingURL=query.d.ts.map