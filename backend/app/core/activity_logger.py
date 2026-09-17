import sys
from datetime import datetime
from typing import Optional, Any

# Column header format requested:
# date,time,ai agent that used to generate response,success,error,wraning message reason for error and warning
LOG_HEADER = "date,time,ai agent that used to generate response,success,error,wraning message reason for error and warning"

_header_printed = False

def sanitize_field(val: Any) -> str:
    """
    Sanitize field to ensure it is printed on a single line and doesn't break
    comma-separated format by replacing internal commas with semicolons and newlines with spaces.
    """
    if val is None or val == "":
        return "None"
    s = str(val).replace("\r", " ").replace("\n", " ").strip()
    return s.replace(",", ";")

def print_log_header():
    """Prints the log format header to the terminal once."""
    global _header_printed
    if not _header_printed:
        sys.stdout.write(LOG_HEADER + "\n")
        sys.stdout.flush()
        _header_printed = True

def log_activity(
    agent: str,
    success: bool,
    error: Optional[str] = None,
    warning_reason: Optional[str] = None,
    dt: Optional[datetime] = None
) -> str:
    """
    Logs an activity strictly to the terminal in the exact format:
    date,time,ai agent that used to generate response,success,error,wraning message reason for error and warning

    This is output ONLY to sys.stdout (terminal) and never returned to the frontend.
    """
    print_log_header()

    now = dt or datetime.now()
    date_str = now.strftime("%Y-%m-%d")
    time_str = now.strftime("%H:%M:%S")
    agent_str = sanitize_field(agent)
    success_str = "true" if success else "false"
    error_str = sanitize_field(error)
    warning_str = sanitize_field(warning_reason)

    log_line = f"{date_str},{time_str},{agent_str},{success_str},{error_str},{warning_str}"

    # Output strictly on terminal
    sys.stdout.write(log_line + "\n")
    sys.stdout.flush()
    return log_line
