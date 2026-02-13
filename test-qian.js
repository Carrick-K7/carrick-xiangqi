const notation = "前车进一";
const pattern = /^([前后])?([将帅車车馬马炮相象仕士兵卒])([一二三四五六七八九123456789])([平进退])([一二三四五六七八九123456789])$/;

const match = notation.match(pattern);
console.log("匹配结果:", match);

if (match) {
  const [, prefix, pieceChar, fromColChar, action, targetChar] = match;
  console.log("prefix:", prefix);
  console.log("pieceChar:", pieceChar);
  console.log("fromColChar:", fromColChar);
  console.log("action:", action);
  console.log("targetChar:", targetChar);
}
