/**
 * 整点简报数据生成模块
 * 用于每小时自动生成团队工作简报
 */
import type { SubAgentTask, GitCommit, FileChange } from '../collect/collector.js';
export interface HourlyReport {
    hour: number;
    timestamp: string;
    summary: {
        activeMembers: string[];
        totalTasks: number;
        completedTasks: number;
        totalCommits: number;
        totalFileChanges: number;
        totalDuration: number;
    };
    highlights: {
        topMember: string;
        topTask: string;
        recentCommits: GitCommit[];
        activeProjects: string[];
    };
    details: {
        tasks: SubAgentTask[];
        commits: GitCommit[];
        fileChanges: FileChange[];
    };
}
export interface DailyReport {
    date: string;
    generatedAt: string;
    hours: HourlyReport[];
    dailySummary: {
        totalMembers: number;
        totalTasks: number;
        totalDuration: number;
        totalCommits: number;
        keyDeliverables: string[];
    };
}
export declare class ReportGenerator {
    /**
     * 生成指定小时的简报
     */
    generateHourlyReport(date: string, hour: number): Promise<HourlyReport>;
    /**
     * 生成全天简报
     */
    generateDailyReport(date: string): Promise<DailyReport>;
    /**
     * 生成简报文本（用于推送）
     */
    generateReportText(report: HourlyReport): string;
    /**
     * 生成Markdown格式日报
     */
    generateDailyMarkdown(report: DailyReport): string;
}
export declare const reportGenerator: ReportGenerator;
//# sourceMappingURL=reports.d.ts.map