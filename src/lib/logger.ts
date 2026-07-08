type LogLevel = "info" | "warn" | "error" | "audit";

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  event: string;
  message: string;
  metadata?: Record<string, unknown>;
}

function writeLog(entry: LogEntry) {
  const line = JSON.stringify(entry);
  if (entry.level === "error") {
    console.error(line);
    return;
  }
  console.log(line);
}

export const logger = {
  info(event: string, message: string, metadata?: Record<string, unknown>) {
    writeLog({
      timestamp: new Date().toISOString(),
      level: "info",
      event,
      message,
      metadata,
    });
  },

  warn(event: string, message: string, metadata?: Record<string, unknown>) {
    writeLog({
      timestamp: new Date().toISOString(),
      level: "warn",
      event,
      message,
      metadata,
    });
  },

  error(event: string, message: string, metadata?: Record<string, unknown>) {
    writeLog({
      timestamp: new Date().toISOString(),
      level: "error",
      event,
      message,
      metadata,
    });
  },

  audit(event: string, message: string, metadata?: Record<string, unknown>) {
    writeLog({
      timestamp: new Date().toISOString(),
      level: "audit",
      event,
      message,
      metadata,
    });
  },
};
