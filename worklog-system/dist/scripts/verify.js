/**
 * 数据完整性验证脚本
 */
import { indexService } from '../src/utils/indexer.js';
async function main() {
    const date = process.argv[2];
    console.log(`🔍 验证数据完整性${date ? ` (${date})` : ''}...`);
    const result = await indexService.verifyIntegrity(date);
    console.log(`\n📊 验证结果:`);
    console.log(`   状态: ${result.valid ? '✅ 通过' : '❌ 失败'}`);
    console.log(`   文件数: ${result.stats.totalFiles}`);
    console.log(`   记录数: ${result.stats.totalEntries}`);
    console.log(`   损坏: ${result.stats.corrupted}`);
    if (result.issues.length > 0) {
        console.log(`\n⚠️ 发现 ${result.issues.length} 个问题:`);
        result.issues.forEach(issue => console.log(`   - ${issue}`));
    }
}
main().catch(console.error);
//# sourceMappingURL=verify.js.map