// Logger utility for consistent logging across the application
const fs = require('fs');
const path = require('path');

class Logger {
  constructor() {
    this.logDir = path.join(process.cwd(), 'logs');
    this.ensureLogDirectory();
  }

  // Ensure log directory exists
  ensureLogDirectory() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  // Format log message
  formatMessage(level, message, ...args) {
    const timestamp = new Date().toISOString();
    const formattedArgs = args.length > 0 ? ' ' + args.map(arg => 
      typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
    ).join(' ') : '';
    
    return `[${timestamp}] ${level.toUpperCase()}: ${message}${formattedArgs}`;
  }

  // Write to file
  writeToFile(level, formattedMessage) {
    if (process.env.NODE_ENV === 'production' || process.env.LOG_TO_FILE === 'true') {
      const logFile = path.join(this.logDir, `${level}.log`);
      fs.appendFileSync(logFile, formattedMessage + '\n');
    }
  }

  // Info level logging
  info(message, ...args) {
    const formatted = this.formatMessage('info', message, ...args);
    console.log('\x1b[36m%s\x1b[0m', formatted); // Cyan
    this.writeToFile('info', formatted);
  }

  // Warning level logging
  warn(message, ...args) {
    const formatted = this.formatMessage('warn', message, ...args);
    console.warn('\x1b[33m%s\x1b[0m', formatted); // Yellow
    this.writeToFile('warn', formatted);
  }

  // Error level logging
  error(message, ...args) {
    const formatted = this.formatMessage('error', message, ...args);
    console.error('\x1b[31m%s\x1b[0m', formatted); // Red
    this.writeToFile('error', formatted);
  }

  // Debug level logging
  debug(message, ...args) {
    if (process.env.NODE_ENV !== 'production' || process.env.LOG_LEVEL === 'debug') {
      const formatted = this.formatMessage('debug', message, ...args);
      console.log('\x1b[90m%s\x1b[0m', formatted); // Gray
      this.writeToFile('debug', formatted);
    }
  }

  // Success level logging (custom)
  success(message, ...args) {
    const formatted = this.formatMessage('success', message, ...args);
    console.log('\x1b[32m%s\x1b[0m', formatted); // Green
    this.writeToFile('info', formatted);
  }
}

// Export singleton instance
module.exports = new Logger();