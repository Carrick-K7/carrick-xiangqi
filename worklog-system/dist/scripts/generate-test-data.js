/**
 * 工作记录系统测试数据生成器
 */
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
const BASE_LOG_PATH = '/data/work-logs';
async function ensureDir(path) {
    if (!existsSync(path)) {
        await mkdir(path, { recursive: true });
    }
}
async function main() {
    const today = new Date().toISOString().split('T')[0];
    const logPath = join(BASE_LOG_PATH, today);
    await ensureDir(logPath);
    // 模拟 SubAgent 任务数据 - 标记为模拟数据
    const forgeTasks = [
        {
            id: 'task-1',
            member: 'Forge',
            task: '工作记录系统 Phase 1 开发 - 数据采集服务',
            start_time: `${today}T08:00:00.000Z`,
            end_time: `${today}T10:00:00.000Z`,
            duration: 7200,
            deliverables: ['collector.ts', 'Git监听模块', '文件系统监控'],
            status: 'completed',
            source: 'subagent',
            time_source: 'manual', // 模拟数据
        },
        {
            id: 'task-2',
            member: 'Forge',
            task: '工作记录系统 Phase 2 开发 - Dashboard 界面',
            start_time: `${today}T10:15:00.000Z`,
            end_time: `${today}T13:15:00.000Z`,
            duration: 10800,
            deliverables: ['API服务器', '查询逻辑', '前端Dashboard'],
            status: 'completed',
            source: 'subagent',
            time_source: 'manual', // 模拟数据
        },
        {
            id: 'task-3',
            member: 'Forge',
            task: '工作记录系统 Phase 3 开发 - 索引与存储',
            start_time: `${today}T13:30:00.000Z`,
            end_time: `${today}T15:00:00.000Z`,
            duration: 5400,
            deliverables: ['索引系统', '数据完整性检查', '备份策略'],
            status: 'completed',
            source: 'subagent',
            time_source: 'manual', // 模拟数据
        },
    ];
    // 模拟 Git 提交数据 - 标记为模拟数据
    const gitCommits = [
        {
            id: 'git-abc123',
            hash: 'abc123def456',
            author: 'Forge',
            email: 'forge@ai.team',
            timestamp: `${today}T09:30:00.000Z`,
            message: 'feat: 实现 SubAgent 任务采集模块',
            files: ['src/collect/collector.ts'],
            repo: 'workspace',
            source: 'git',
            time_source: 'manual', // 模拟数据
        },
        {
            id: 'git-def456',
            hash: 'def456ghi789',
            author: 'Forge',
            email: 'forge@ai.team',
            timestamp: `${today}T11:45:00.000Z`,
            message: 'feat: 完成查询API和Dashboard界面',
            files: ['src/query/query.ts', 'api/server.ts', 'dashboard/index.html'],
            repo: 'workspace',
            source: 'git',
            time_source: 'manual', // 模拟数据
        },
        {
            id: 'git-ghi789',
            hash: 'ghi789jkl012',
            author: 'Forge',
            email: 'forge@ai.team',
            timestamp: `${today}T14:00:00.000Z`,
            message: 'feat: 添加索引系统和数据完整性校验',
            files: ['src/utils/indexer.ts', 'scripts/rebuild-index.ts'],
            repo: 'workspace',
            source: 'git',
            time_source: 'manual', // 模拟数据
        },
    ];
    // 模拟文件变更数据 - 标记为模拟数据
    const fileChanges = [
        {
            id: 'fs-1',
            path: '/root/.openclaw/workspace/worklog-system/src/collect/collector.ts',
            change_type: 'create',
            timestamp: `${today}T08:00:00.000Z`,
            member: 'Forge',
            source: 'filesystem',
            time_source: 'manual', // 模拟数据
        },
        {
            id: 'fs-2',
            path: '/root/.openclaw/workspace/worklog-system/api/server.ts',
            change_type: 'create',
            timestamp: `${today}T10:15:00.000Z`,
            member: 'Forge',
            source: 'filesystem',
            time_source: 'manual', // 模拟数据
        },
        {
            id: 'fs-3',
            path: '/root/.openclaw/workspace/worklog-system/dashboard/index.html',
            change_type: 'create',
            timestamp: `${today}T11:30:00.000Z`,
            member: 'Forge',
            source: 'filesystem',
            time_source: 'manual', // 模拟数据
        },
    ];
    // 写入文件
    await writeFile(join(logPath, 'Forge.jsonl'), forgeTasks.map(t => JSON.stringify(t)).join('\n') + '\n');
    await writeFile(join(logPath, 'git-Forge.jsonl'), gitCommits.map(c => JSON.stringify(c)).join('\n') + '\n');
    await writeFile(join(logPath, 'fs-Forge.jsonl'), fileChanges.map(f => JSON.stringify(f)).join('\n') + '\n');
    console.log('✅ 测试数据已生成');
    console.log(`   任务: ${forgeTasks.length}`);
    console.log(`   Git提交: ${gitCommits.length}`);
    console.log(`   文件变更: ${fileChanges.length}`);
    console.log(`   路径: ${logPath}`);
}
main().catch(console.error);
//# sourceMappingURL=generate-test-data.js.map