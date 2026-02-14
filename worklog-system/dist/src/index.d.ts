/**
 * 工作记录系统集成模块
 * 用于在其他项目（如主workspace）中集成工作记录功能
 */
import { SubAgentRecorder, GitMonitor, FilesystemMonitor, WorkLogCollector } from './collect/collector.js';
import { queryService } from './query/query.js';
import { indexService } from './utils/indexer.js';
export { SubAgentRecorder, GitMonitor, FilesystemMonitor, WorkLogCollector, queryService, indexService, };
export type { SubAgentTask, GitCommit, FileChange, WorkLogEntry, } from './collect/collector.js';
export interface WorkLogConfig {
    member: string;
    repos?: string[];
    projectsPath?: string;
    autoStart?: boolean;
}
export declare function initWorkLog(config: WorkLogConfig): Promise<WorkLogCollector>;
export declare function recordTask(member: string, task: string, executor: () => Promise<string[]>): Promise<void>;
//# sourceMappingURL=index.d.ts.map