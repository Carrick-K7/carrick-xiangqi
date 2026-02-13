/**
 * Pikafish 象棋引擎封装
 * 提供 position、go、bestmove 等基本接口
 */

class XiangqiEngine {
  constructor() {
    this.engine = null;
    this.isReady = false;
    this.outputCallbacks = [];
    this.pendingResolve = null;
    this.pendingReject = null;
    this.bestMove = null;
    this.evaluation = null;
    this.thinkingOutput = [];
  }

  /**
   * 初始化引擎
   */
  async init() {
    if (this.engine) return;

    const wasmUrl = 'engine/pikafish.wasm';
    
    try {
      // 先加载引擎脚本
      await this._loadScript('engine/pikafish.js');
      
      if (typeof Pikafish === 'undefined') {
        throw new Error('Pikafish script not loaded');
      }

      // 加载 WASM 文件
      console.log('Loading WASM from:', wasmUrl);
      const response = await fetch(wasmUrl);
      if (!response.ok) {
        throw new Error(`Failed to load WASM: ${response.status} ${response.statusText}`);
      }
      const wasmBinary = await response.arrayBuffer();
      console.log('WASM loaded, size:', wasmBinary.byteLength);

      // 初始化 Pikafish 模块
      const self = this;
      
      // 创建 Module 配置
      const moduleConfig = {
        wasmBinary: wasmBinary,
        locateFile: (file) => {
          console.log('locateFile called for:', file);
          if (file.endsWith('.wasm')) {
            return wasmUrl;
          }
          return 'engine/' + file;
        },
        print: (text) => {
          self._handleOutput(text);
        },
        printErr: (text) => {
          console.error('[Engine Error]:', text);
        },
        setStatus: (status) => {
          console.log('[Engine Status]:', status);
        }
      };
      
      // 创建引擎实例
      console.log('Creating Pikafish instance...');
      this.engine = await Pikafish(moduleConfig);
      console.log('Pikafish instance created');
      
      // 设置输出处理
      this.engine.read_stdout = (text) => {
        self._handleOutput(text);
      };

      // 等待引擎初始化
      await this._sendCommand('uci');
      await this._waitFor('uciok', 10000);
      
      // 设置引擎参数
      await this._sendCommand('setoption name Threads value 1');
      await this._sendCommand('setoption name Hash value 16');
      await this._sendCommand('isready');
      await this._waitFor('readyok', 10000);
      
      this.isReady = true;
      console.log('Pikafish 引擎初始化完成');
    } catch (error) {
      console.error('引擎初始化失败:', error);
      throw error;
    }
  }

  /**
   * 加载外部脚本
   */
  _loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  /**
   * 处理引擎输出
   */
  _handleOutput(text) {
    console.log('[Engine]:', text);
    
    // 保存思考输出
    if (text.startsWith('info')) {
      this.thinkingOutput.push(text);
      
      // 解析评估分数
      const scoreMatch = text.match(/score cp (-?\d+)/);
      if (scoreMatch) {
        this.evaluation = parseInt(scoreMatch[1]);
      }
      
      // 解析胜率百分比（如果有）
      const winrateMatch = text.match(/score winrate (\d+)/);
      if (winrateMatch) {
        this.winrate = parseInt(winrateMatch[1]);
      }
    }
    
    // 解析最佳着法
    if (text.startsWith('bestmove')) {
      const parts = text.split(' ');
      this.bestMove = parts[1];
      if (this.pendingResolve) {
        this.pendingResolve({
          bestMove: this.bestMove,
          evaluation: this.evaluation,
          thinking: this.thinkingOutput
        });
        this.pendingResolve = null;
      }
    }
    
    // 检查等待的条件
    if (this.waitCondition && text.includes(this.waitCondition)) {
      if (this.pendingResolve) {
        this.pendingResolve(text);
        this.pendingResolve = null;
      }
      this.waitCondition = null;
    }
  }

  /**
   * 发送命令到引擎
   */
  _sendCommand(cmd) {
    return new Promise((resolve) => {
      if (this.engine && this.engine.send_command) {
        this.engine.send_command(cmd);
      }
      resolve();
    });
  }

  /**
   * 等待特定输出
   */
  _waitFor(condition, timeout = 5000) {
    return new Promise((resolve, reject) => {
      this.waitCondition = condition;
      this.pendingResolve = resolve;
      
      setTimeout(() => {
        if (this.pendingResolve) {
          this.pendingResolve = null;
          reject(new Error(`Timeout waiting for: ${condition}`));
        }
      }, timeout);
    });
  }

  /**
   * 设置局面
   * @param {string} fen - FEN 格式局面字符串
   */
  async position(fen) {
    if (!this.isReady) {
      await this.init();
    }
    
    // 清除之前的思考输出
    this.thinkingOutput = [];
    this.bestMove = null;
    this.evaluation = null;
    
    if (fen) {
      await this._sendCommand(`position fen ${fen}`);
    } else {
      await this._sendCommand('position startpos');
    }
  }

  /**
   * 分析当前局面
   * @param {Object} options - 分析选项
   * @param {number} options.depth - 搜索深度
   * @param {number} options.movetime - 思考时间（毫秒）
   */
  async go(options = {}) {
    if (!this.isReady) {
      await this.init();
    }
    
    this.thinkingOutput = [];
    this.bestMove = null;
    this.evaluation = null;
    
    let goCmd = 'go';
    
    if (options.depth) {
      goCmd += ` depth ${options.depth}`;
    } else if (options.movetime) {
      goCmd += ` movetime ${options.movetime}`;
    } else {
      // 默认思考1秒
      goCmd += ' movetime 1000';
    }
    
    await this._sendCommand(goCmd);
    
    // 等待最佳着法
    return new Promise((resolve, reject) => {
      this.pendingResolve = resolve;
      
      const timeout = options.movetime || 5000;
      setTimeout(() => {
        if (this.pendingResolve) {
          this.pendingResolve = null;
          reject(new Error('Analysis timeout'));
        }
      }, timeout + 2000);
    });
  }

  /**
   * 快速获取最佳着法
   * @param {string} fen - FEN 格式局面
   * @param {number} depth - 搜索深度
   */
  async getBestMove(fen, depth = 10) {
    await this.position(fen);
    return await this.go({ depth });
  }

  /**
   * 停止思考
   */
  async stop() {
    if (this.engine) {
      await this._sendCommand('stop');
    }
  }

  /**
   * 退出引擎
   */
  async quit() {
    if (this.engine) {
      await this._sendCommand('quit');
      this.engine = null;
      this.isReady = false;
    }
  }

  /**
   * 将引擎评估分数转换为胜率
   * @param {number} cp - 引擎评估分数（百分兵）
   * @returns {number} 胜率（0-100）
   */
  static scoreToWinrate(cp) {
    // 使用 Logistic 函数将分数转换为胜率
    // 基于经验：100分 ≈ 55% 胜率，300分 ≈ 70% 胜率
    const winrate = 50 + 50 * Math.tanh(cp / 400);
    return Math.round(Math.max(0, Math.min(100, winrate)));
  }

  /**
   * 评估分数转文字描述
   */
  static scoreToDescription(cp) {
    if (cp > 800) return '红方大优';
    if (cp > 400) return '红方明显优势';
    if (cp > 150) return '红方稍优';
    if (cp > -150) return '局面均衡';
    if (cp > -400) return '黑方稍优';
    if (cp > -800) return '黑方明显优势';
    return '黑方大优';
  }
}

// 导出引擎类
if (typeof module !== 'undefined' && module.exports) {
  module.exports = XiangqiEngine;
}
