/**
 * 备份脚本
 */
import { indexService } from '../src/utils/indexer.js';
async function main() {
    const date = process.argv[2];
    console.log(`💾 创建备份${date ? ` (${date})` : ''}...`);
    await indexService.ensureDirs();
    const result = await indexService.createBackup(date);
    console.log(`✅ 备份完成: ${result.backupPath}`);
    console.log(`   文件数: ${result.files}`);
}
main().catch(console.error);
//# sourceMappingURL=backup.js.map