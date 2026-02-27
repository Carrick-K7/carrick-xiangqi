# 中国象棋PGN格式调研报告

## 1. 标准PGN格式规范

### 1.1 PGN简介
PGN（Portable Game Notation）是国际象棋标准的棋谱记录格式，经过适当扩展也可用于中国象棋。

### 1.2 PGN文件结构
```
[Event "赛事名称"]
[Site "比赛地点"]
[Date "YYYY.MM.DD"]
[Round "轮次"]
[Red "红方姓名"]
[Black "黑方姓名"]
[Result "结果"]
[ECO "开局代码"]

1. 炮二平五 马8进7 2. 馬二进三 车9平8 ...
```

### 1.3 标准标签字段
| 字段 | 说明 | 示例 |
|------|------|------|
| Event | 赛事名称 | "全国象棋个人赛" |
| Site | 比赛地点 | "上海" |
| Date | 日期 | "2023.10.15" |
| Round | 轮次 | "5" |
| Red | 红方 | "王天一" |
| Black | 黑方 | "郑惟桐" |
| Result | 结果 | "1-0" (红胜), "0-1" (黑胜), "1/2-1/2" (和棋) |
| ECO | 开局代码 | "C42" |
| Opening | 开局名称 | "中炮对屏风马" |

### 1.4 记谱格式
- 回合编号后跟红方和黑方的着法
- 着法间用空格分隔
- 注释用花括号 `{}` 包裹
- 变例用圆括号 `()` 包裹

## 2. 中文记谱与PGN转换

### 2.1 中国象棋记谱规则
中国象棋使用四字记谱法：
```
[棋子名称][原纵线][动作][目标位置]
```

示例：
- `炮二平五` - 二路炮平到五路
- `馬八进七` - 八路马进到七路
- `車二进六` - 二路车前进六步

### 2.2 棋盘坐标系统
```
  九 八 七 六 五 四 三 二 一  (红方视角)
  ┌─┬─┬─┬─┬─┬─┬─┬─┐
1 │ │ │ │ │ │ │ │ │ │  1
  ├─┼─┼─┼─┼─┼─┼─┼─┤
2 │ │ │ │ │ │ │ │ │ │  2
  ├─┼─┼─┼─┼─┼─┼─┼─┤
...
10│ │ │ │ │ │ │ │ │ │  10
  └─┴─┴─┴─┴─┴─┴─┴─┘
  1  2  3  4  5  6  7  8  9   (黑方视角)
```

### 2.3 转换工具推荐

#### 2.3.1 JavaScript库
```javascript
// xiangqi-pgn-parser (概念示例)
const pgn = `[Event "测试"]
[Red "红方"]
[Black "黑方"]

1. 炮二平五 马8进7 2. 馬二进三 车9平8`;

const game = parseXiangqiPGN(pgn);
console.log(game.moves); // 解析后的着法数组
```

#### 2.3.2 Python库
```python
# 中国象棋PGN处理概念代码
import re

def parse_move(move_str):
    """解析单步棋"""
    pattern = r'([車馬象士帅炮兵卒])([一二三四五六七八九十])([进退平])([一二三四五六七八九十]?)'
    match = re.match(pattern, move_str)
    return match.groups() if match else None

def convert_to_wxf(move_str):
    """转换为WXF格式（国际通用）"""
    # WXF格式示例：C2.5 (炮二平五)
    pass
```

#### 2.3.3 现有开源项目
1. **xiangqi.js** - JavaScript象棋引擎，支持PGN解析
2. **cchess** - Python中国象棋库
3. **xiangqi-board** - React象棋棋盘组件

## 3. PGN扩展建议

### 3.1 中国象棋专用标签
```
[Variant "xiangqi"]          # 棋种标识
[TimeControl "30+10"]        # 时间控制
[Termination "正常"]          # 结束方式
[FEN "rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR w"]  # 初始局面
```

### 3.2 FEN格式（中国象棋）
```
[开局FEN]
rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR w - - 0 1

[符号说明]
r = 车(黑)  n = 马(黑)  b = 象(黑)  a = 士(黑)
k = 将(黑)  c = 炮(黑)  p = 卒(黑)
R = 車(红)  N = 馬(红)  B = 相(红)  A = 仕(红)
K = 帅(红)  C = 炮(红)  P = 兵(红)
9 = 9个连续空格
```

## 4. 数据格式示例

### 4.1 完整PGN示例
```pgn
[Event "烂柯神机"]
[Site "明代"]
[Date "????.??.??"]
[Round "1"]
[Red "红方"]
[Black "黑方"]
[Result "1-0"]
[Variant "xiangqi"]
[Opening "残局-气吞关右"]

1. 車二进五 将6进1 2. 車二退一 将6退1 
3. 炮三平八 车2退7 4. 車二进一 将6进1 
5. 馬四进二 将6平5 6. 車二退一 士5进6 
7. 馬二退四 {红胜} 1-0
```

### 4.2 JSON格式示例
```json
{
  "id": "lanke-001",
  "name": "烂柯神机第1局 气吞关右",
  "type": "ancient",
  "era": "明代",
  "category": "残局",
  "moves": ["車二进五", "将6进1", "車二退一", "将6退1", "..."],
  "pgn": "1. 車二进五 将6进1 2. 車二退一 将6退1 ...",
  "result": "红胜",
  "difficulty": "中等",
  "tags": ["残局", "车马炮", "红胜"]
}
```

## 5. 推荐技术栈

### 5.1 解析库
| 语言 | 库名 | 功能 |
|------|------|------|
| JavaScript | xiangqi.js | 完整的象棋引擎 |
| Python | cchess | 象棋规则验证 |
| Java | xqwizard | 象棋巫师内核 |

### 5.2 棋盘显示
- **HTML5 Canvas** - 自定义绘制
- **SVG** - 矢量图形，缩放不失真
- **WebGL** - 3D效果（未来扩展）

## 6. 注意事项

1. **编码问题** - PGN文件应使用UTF-8编码以支持中文
2. **大小写敏感** - 棋子符号区分大小写（红方大写）
3. **数字格式** - 中文数字一二三四 vs 阿拉伯数字1234
4. **变例处理** - 使用标准PGN变例格式 `( ... )`

## 7. 参考资源

- [中国象棋记谱法 - 维基百科](https://zh.wikipedia.org/wiki/中国象棋)
- [PGN规范 - Chess.com](https://www.chess.com/terms/pgn-chess)
- [WXF格式规范](http://www.xiangqi.com/)
