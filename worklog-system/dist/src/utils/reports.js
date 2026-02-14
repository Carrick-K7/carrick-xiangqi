/**
 * 整点简报数据生成模块
 * 用于每小时自动生成团队工作简报
 */
import { queryService } from '../query/query.js';
export class ReportGenerator {
    /**
     * 生成指定小时的简报
     */
    async generateHourlyReport(date, hour) {
        const startTime = `${String(hour).padStart(2, '0')}:00`;
        const endTime = `${String(hour).padStart(2, '0')}:59`;
        // 查询该小时的所有记录
        const result = await queryService.query({
            date,
            start: startTime,
            end: endTime,
        });
        const tasks = result.entries.filter(e => e.source === 'subagent');
        const commits = result.entries.filter(e => e.source === 'git');
        const fileChanges = result.entries.filter(e => e.source === 'filesystem');
        // 活跃成员
        const memberSet = new Set();
        result.entries.forEach(e => {
            const member = e.member || e.author || 'unknown';
            memberSet.add(member);
        });
        // 活跃项目
        const projectSet = new Set();
        commits.forEach(c => projectSet.add(c.repo));
        fileChanges.forEach(f => {
            const parts = f.path.split('/');
            if (parts.length > 2)
                projectSet.add(parts[parts.length - 2]);
        });
        // 找出最高产成员
        const memberStats = {};
        tasks.forEach(t => {
            memberStats[t.member] = (memberStats[t.member] || 0) + (t.duration || 0);
        });
        const topMember = Object.entries(memberStats)
            .sort((a, b) => b[1] - a[1])[0]?.[0] || '';
        // 找出最重要的任务
        const topTask = tasks
            .sort((a, b) => (b.duration || 0) - (a.duration || 0))[0]?.task || '';
        return {
            hour,
            timestamp: new Date().toISOString(),
            summary: {
                activeMembers: Array.from(memberSet),
                totalTasks: tasks.length,
                completedTasks: tasks.filter(t => t.status === 'completed').length,
                totalCommits: commits.length,
                totalFileChanges: fileChanges.length,
                totalDuration: tasks.reduce((sum, t) => sum + (t.duration || 0), 0),
            },
            highlights: {
                topMember,
                topTask,
                recentCommits: commits.slice(0, 5),
                activeProjects: Array.from(projectSet),
            },
            details: {
                tasks,
                commits,
                fileChanges,
            },
        };
    }
    /**
     * 生成全天简报
     */
    async generateDailyReport(date) {
        const hours = [];
        // 生成每个小时的报告
        for (let h = 0; h < 24; h++) {
            const report = await this.generateHourlyReport(date, h);
            if (report.summary.totalTasks > 0 || report.summary.totalCommits > 0) {
                hours.push(report);
            }
        }
        // 获取日汇总
        const members = await queryService.getMembers(date);
        const allEntries = await queryService.query({ date });
        const tasks = allEntries.entries.filter(e => e.source === 'subagent');
        const commits = allEntries.entries.filter(e => e.source === 'git');
        // 收集所有交付物
        const deliverables = tasks
            .flatMap(t => t.deliverables)
            .filter((d, i, arr) => arr.indexOf(d) === i);
        return {
            date,
            generatedAt: new Date().toISOString(),
            hours,
            dailySummary: {
                totalMembers: members.length,
                totalTasks: tasks.length,
                totalDuration: tasks.reduce((sum, t) => sum + (t.duration || 0), 0),
                totalCommits: commits.length,
                keyDeliverables: deliverables,
            },
        };
    }
    /**
     * 生成简报文本（用于推送）
     */
    generateReportText(report) {
        const { summary, highlights } = report;
        const lines = [
            `📊 ${report.hour}:00-${report.hour}:59 工作简报`,
            '',
            `👥 活跃成员: ${summary.activeMembers.join(', ') || '无'}`,
            `✅ 完成任务: ${summary.completedTasks}/${summary.totalTasks}`,
            `📝 Git提交: ${summary.totalCommits}`,
            `📁 文件变更: ${summary.totalFileChanges}`,
            `⏱️ 总工时: ${Math.round(summary.totalDuration / 60)}分钟`,
        ];
        if (highlights.topMember) {
            lines.push('', `🏆 最高产: ${highlights.topMember}`);
        }
        if (highlights.recentCommits.length > 0) {
            lines.push('', '最新提交:');
            highlights.recentCommits.slice(0, 3).forEach(c => {
                lines.push(`  • ${c.message.slice(0, 40)}${c.message.length > 40 ? '...' : ''}`);
            });
        }
        return lines.join('\n');
    }
    /**
     * 生成Markdown格式日报
     */
    generateDailyMarkdown(report) {
        const lines = [
            `# 📊 ${report.date} 工作日报`,
            '',
            `> 生成时间: ${report.generatedAt}`,
            '',
            '## 📈 今日概览',
            '',
            `- 👥 活跃成员: ${report.dailySummary.totalMembers}人`,
            `- ✅ 完成任务: ${report.dailySummary.totalTasks}`,
            `- ⏱️ 总工时: ${Math.round(report.dailySummary.totalDuration / 3600 * 10) / 10}小时`,
            `- 📝 Git提交: ${report.dailySummary.totalCommits}`,
            '',
            '## 🎯 主要交付物',
            '',
            ...report.dailySummary.keyDeliverables.map(d => `- ${d}`),
            '',
            '## ⏰ 时段详情',
            '',
        ];
        report.hours.forEach(h => {
            lines.push(`### ${h.hour}:00-${h.hour}:59`);
            lines.push('');
            lines.push(`- 任务: ${h.summary.totalTasks}个`);
            lines.push(`- 提交: ${h.summary.totalCommits}次`);
            lines.push(`- 工时: ${Math.round(h.summary.totalDuration / 60)}分钟`);
            if (h.highlights.topTask) {
                lines.push(`- 主要工作: ${h.highlights.topTask.slice(0, 50)}`);
            }
            lines.push('');
        });
        return lines.join('\n');
    }
}
// 导出单例
export const reportGenerator = new ReportGenerator();
//# sourceMappingURL=reports.js.map