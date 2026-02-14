/**
 * 重建索引脚本
 */
import { indexService } from '../src/utils/indexer.js';
async function main() {
    console.log('🔄 重建索引...');
    await indexService.ensureDirs();
    await indexService.rebuildAllIndexes();
    console.log('✅ 索引重建完成');
}
main().catch(console.error);
//# sourceMappingURL=rebuild-index.js.map