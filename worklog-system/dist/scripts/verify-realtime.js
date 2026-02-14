/**
 * 真实时间记录验证脚本
 * 验证 SubAgent、Git、文件系统监控都使用真实时间
 */
import { SubAgentRecorder, GitMonitor, FilesystemMonitor } from '../src/collect/collector.js';
import { stat, writeFile, mkdir, readFile } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
const execAsync = promisify(exec);
async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
async function testSubAgentRealTime() {
    console.log('\n🧪 测试 SubAgent 真实时间记录...\n');
    const recorder = new SubAgentRecorder();
    const member = 'TestForge';
    const task = '测试真实时间记录';
    // 记录真实开始时间
    const beforeStart = Date.now();
    const taskId = await recorder.startTask(member, task);
    const afterStart = Date.now();
    // 模拟任务执行 2 秒
    await sleep(2000);
    // 记录真实结束时间
    const beforeEnd = Date.now();
    await recorder.endTask(taskId, ['test-output.txt'], true);
    const afterEnd = Date.now();
    // 验证结果
    const runningTasks = recorder.getRunningTasks();
    console.log(`   ✅ 任务已结束，无运行中任务: ${runningTasks.length === 0}`);
    // 读取记录的文件验证
    const today = new Date().toISOString().split('T')[0];
    const logPath = `/data/work-logs/${today}/${member}.jsonl`;
    if (existsSync(logPath)) {
        const content = await readFile(logPath, 'utf-8');
        const lines = content.trim().split('\n');
        const completedTask = JSON.parse(lines[lines.length - 1]);
        console.log(`   📊 任务开始时间: ${completedTask.start_time}`);
        console.log(`   📊 任务结束时间: ${completedTask.end_time}`);
        console.log(`   📊 任务时长: ${completedTask.duration} 秒`);
        console.log(`   📊 时间来源: ${completedTask.time_source}`);
        // 验证时间戳在合理范围内
        const startTime = new Date(completedTask.start_time).getTime();
        const endTime = new Date(completedTask.end_time).getTime();
        const startValid = startTime >= beforeStart - 1000 && startTime <= afterStart + 1000;
        const endValid = endTime >= beforeEnd - 1000 && endTime <= afterEnd + 1000;
        const durationValid = completedTask.duration >= 1 && completedTask.duration <= 4;
        const sourceValid = completedTask.time_source === 'real_subagent_callback';
        console.log(`   ${startValid ? '✅' : '❌'} 开始时间真实有效`);
        console.log(`   ${endValid ? '✅' : '❌'} 结束时间真实有效`);
        console.log(`   ${durationValid ? '✅' : '❌'} 时长计算正确 (~2秒)`);
        console.log(`   ${sourceValid ? '✅' : '❌'} 时间来源标记正确`);
        return startValid && endValid && durationValid && sourceValid;
    }
    return false;
}
async function testGitRealTime() {
    console.log('\n🧪 测试 Git 真实时间记录...\n');
    const testRepo = '/tmp/test-git-repo-' + Date.now();
    await mkdir(testRepo, { recursive: true });
    // 初始化 git 仓库并创建提交
    await execAsync(`cd "${testRepo}" && git init && git config user.email "test@test.com" && git config user.name "Test"`);
    await writeFile(join(testRepo, 'test.txt'), 'test content');
    await execAsync(`cd "${testRepo}" && git add . && git commit -m "test commit"`);
    // 获取真实提交时间
    const { stdout: gitTime } = await execAsync(`cd "${testRepo}" && git log -1 --format=%ci`);
    const realCommitTime = gitTime.trim();
    // 使用 GitMonitor 扫描
    const monitor = new GitMonitor([testRepo]);
    const commits = await monitor.scanRepo(testRepo, 'Test');
    // 清理
    await execAsync(`rm -rf "${testRepo}"`);
    if (commits.length > 0) {
        const commit = commits[0];
        console.log(`   📊 Git 真实时间: ${realCommitTime}`);
        console.log(`   📊 记录时间: ${commit.timestamp}`);
        console.log(`   📊 时间来源: ${commit.time_source}`);
        // 验证时间匹配（允许1秒误差）
        const gitTimeMs = new Date(realCommitTime).getTime();
        const recordTimeMs = new Date(commit.timestamp).getTime();
        const timeMatch = Math.abs(gitTimeMs - recordTimeMs) < 1000;
        const sourceValid = commit.time_source === 'git_log_ci';
        console.log(`   ${timeMatch ? '✅' : '❌'} Git 时间真实匹配`);
        console.log(`   ${sourceValid ? '✅' : '❌'} 时间来源标记正确`);
        return timeMatch && sourceValid;
    }
    console.log('   ❌ 未找到 Git 提交');
    return false;
}
async function testFilesystemRealTime() {
    console.log('\n🧪 测试文件系统真实时间记录...\n');
    // 确保日志目录存在
    const today = new Date().toISOString().split('T')[0];
    const logDir = `/data/work-logs/${today}`;
    await mkdir(logDir, { recursive: true });
    const testDir = '/tmp/test-fs-monitor-' + Date.now();
    await mkdir(testDir, { recursive: true });
    const monitor = new FilesystemMonitor(testDir);
    const member = 'TestForge';
    await monitor.start(member);
    // 创建测试文件
    const testFile = join(testDir, 'test-file.txt');
    await writeFile(testFile, 'test content');
    // 等待文件系统事件检测（需要足够时间）
    await sleep(500);
    // 停止监控以刷新缓冲区
    await monitor.stop();
    // 等待文件写入完成
    await sleep(200);
    // 获取文件真实 mtime
    const stats = await stat(testFile);
    const realMtime = stats.mtime.toISOString();
    // 读取记录
    const logPath = `${logDir}/fs-${member}.jsonl`;
    let recordValid = false;
    if (existsSync(logPath)) {
        const content = await readFile(logPath, 'utf-8');
        const lines = content.trim().split('\n').filter(l => l.trim());
        console.log(`   📄 找到 ${lines.length} 条记录`);
        // 查找匹配的文件记录（使用最后一个匹配的记录，因为可能有多个事件）
        const matchingRecords = [];
        for (const line of lines) {
            try {
                const record = JSON.parse(line);
                if (record.path === testFile) {
                    matchingRecords.push(record);
                }
            }
            catch (e) {
                // 忽略解析错误
            }
        }
        if (matchingRecords.length > 0) {
            // 使用最后一个记录（最新的状态）
            const record = matchingRecords[matchingRecords.length - 1];
            console.log(`   📊 文件真实 mtime: ${realMtime}`);
            console.log(`   📊 记录时间: ${record.timestamp}`);
            console.log(`   📊 时间来源: ${record.time_source}`);
            console.log(`   📊 文件大小: ${record.size}`);
            // 验证时间匹配（允许2秒误差，因为文件系统时间精度不同）
            const mtimeMs = new Date(realMtime).getTime();
            const recordTimeMs = new Date(record.timestamp).getTime();
            const timeMatch = Math.abs(mtimeMs - recordTimeMs) < 2000;
            const sourceValid = record.time_source === 'fs_stat_mtime';
            const sizeValid = record.size === stats.size;
            console.log(`   ${timeMatch ? '✅' : '❌'} 文件 mtime 真实匹配`);
            console.log(`   ${sourceValid ? '✅' : '❌'} 时间来源标记正确`);
            console.log(`   ${sizeValid ? '✅' : '❌'} 文件大小记录正确`);
            recordValid = timeMatch && sourceValid && sizeValid;
        }
        else {
            console.log('   ❌ 未找到匹配的文件记录');
        }
    }
    else {
        console.log(`   ❌ 日志文件不存在: ${logPath}`);
    }
    // 清理
    await execAsync(`rm -rf "${testDir}"`);
    return recordValid;
}
async function main() {
    console.log('='.repeat(60));
    console.log('🔍 时间线采集系统 - 真实时间记录验证');
    console.log('='.repeat(60));
    const results = {
        subAgent: await testSubAgentRealTime(),
        git: await testGitRealTime(),
        filesystem: await testFilesystemRealTime(),
    };
    console.log('\n' + '='.repeat(60));
    console.log('📋 验证结果汇总');
    console.log('='.repeat(60));
    console.log(`   SubAgent 真实时间: ${results.subAgent ? '✅ 通过' : '❌ 失败'}`);
    console.log(`   Git 真实时间:      ${results.git ? '✅ 通过' : '❌ 失败'}`);
    console.log(`   文件系统真实时间:  ${results.filesystem ? '✅ 通过' : '❌ 失败'}`);
    const allPassed = results.subAgent && results.git && results.filesystem;
    console.log('\n' + '='.repeat(60));
    console.log(allPassed ? '✅ 所有验证通过！真实时间记录工作正常。' : '❌ 部分验证失败，请检查。');
    console.log('='.repeat(60));
    process.exit(allPassed ? 0 : 1);
}
main().catch(err => {
    console.error('验证失败:', err);
    process.exit(1);
});
//# sourceMappingURL=verify-realtime.js.map