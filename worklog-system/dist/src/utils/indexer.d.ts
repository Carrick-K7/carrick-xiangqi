/**
 * 工作记录系统 - 索引与存储
 * Phase 3: 索引系统、数据完整性、备份策略
 */
export interface MemberIndex {
    member: string;
    dates: string[];
    totalTasks: number;
    totalDuration: number;
    lastActivity: string;
}
export interface ProjectIndex {
    project: string;
    members: string[];
    dates: string[];
    totalCommits: number;
    totalFileChanges: number;
}
export interface DailySummaryIndex {
    date: string;
    members: string[];
    totalTasks: number;
    totalDuration: number;
    totalCommits: number;
    totalFileChanges: number;
}
export interface AuditLog {
    timestamp: string;
    action: string;
    details: Record<string, any>;
    checksum?: string;
}
export declare class IndexService {
    ensureDirs(): Promise<void>;
    buildMemberIndex(member: string): Promise<MemberIndex>;
    saveMemberIndex(member: string, index: MemberIndex): Promise<void>;
    getMemberIndex(member: string): Promise<MemberIndex | null>;
    buildProjectIndex(project: string): Promise<ProjectIndex>;
    saveProjectIndex(project: string, index: ProjectIndex): Promise<void>;
    buildDailySummary(date: string): Promise<DailySummaryIndex>;
    saveDailySummary(date: string, summary: DailySummaryIndex): Promise<void>;
    getDailySummary(date: string): Promise<DailySummaryIndex | null>;
    logAudit(action: string, details: Record<string, any>): Promise<void>;
    verifyIntegrity(date?: string): Promise<{
        valid: boolean;
        issues: string[];
        stats: {
            totalFiles: number;
            totalEntries: number;
            corrupted: number;
        };
    }>;
    createBackup(date?: string): Promise<{
        backupPath: string;
        files: number;
    }>;
    rebuildAllIndexes(): Promise<void>;
    private getDates;
    private readJsonl;
}
export declare const indexService: IndexService;
//# sourceMappingURL=indexer.d.ts.map