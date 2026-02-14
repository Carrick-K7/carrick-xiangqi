/**
 * 工作记录系统集成模块
 * 用于在其他项目（如主workspace）中集成工作记录功能
 */
import { SubAgentRecorder, GitMonitor, FilesystemMonitor, WorkLogCollector } from './collect/collector.js';
import { queryService } from './query/query.js';
import { indexService } from './utils/indexer.js';
// 导出所有核心功能
export { SubAgentRecorder, GitMonitor, FilesystemMonitor, WorkLogCollector, queryService, indexService, };
// 快速初始化函数
export async function initWorkLog(config) {
    const collector = new WorkLogCollector(config.repos || [], config.projectsPath);
    if (config.autoStart !== false) {
        await collector.init(config.member);
    }
    return collector;
}
// 记录SubAgent任务的工具函数
export async function recordTask(member, task, executor) {
    const recorder = new SubAgentRecorder();
    const taskId = await recorder.startTask(member, task);
    try {
        const deliverables = await executor();
        await recorder.endTask(taskId, deliverables, true);
    }
    catch (err) {
        await recorder.endTask(taskId, [], false);
        throw err;
    }
}
//# sourceMappingURL=index.js.map