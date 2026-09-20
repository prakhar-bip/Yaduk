import time
import threading
import boto3
from botocore.exceptions import ClientError
from app.core.config import settings
from app.core.activity_logger import log_activity

def get_cloudwatch_client():
    """Create boto3 CloudWatch client using existing AWS credentials."""
    try:
        kwargs = {"region_name": settings.AWS_REGION}
        if settings.AWS_ACCESS_KEY_ID and settings.AWS_SECRET_ACCESS_KEY:
            kwargs["aws_access_key_id"] = settings.AWS_ACCESS_KEY_ID
            kwargs["aws_secret_access_key"] = settings.AWS_SECRET_ACCESS_KEY
        return boto3.client("cloudwatch", **kwargs)
    except Exception:
        return None

def _publish_metrics_async(metric_data: list):
    """Internal: publish metrics in a background thread to avoid blocking."""
    try:
        client = get_cloudwatch_client()
        if not client:
            return
        client.put_metric_data(
            Namespace=settings.CLOUDWATCH_NAMESPACE,
            MetricData=metric_data
        )
    except ClientError as e:
        log_activity(
            agent="CloudWatch Metrics [Publish]",
            success=False,
            error=str(e),
            warning_reason="CloudWatch metric publish failed (non-blocking)"
        )
    except Exception:
        pass  # Never let metrics crash the app

def publish_ai_metric(
    agent_name: str,
    model_tier: str,
    latency_ms: float,
    success: bool,
    task_type: str = "fast"
):
    """Publish AI agent invocation metrics to CloudWatch (non-blocking)."""
    dimensions = [
        {"Name": "AgentName", "Value": agent_name[:256]},
        {"Name": "ModelTier", "Value": model_tier[:256]},
        {"Name": "TaskType", "Value": task_type[:256]},
    ]
    
    metric_data = [
        {
            "MetricName": "InvocationLatencyMs",
            "Value": latency_ms,
            "Unit": "Milliseconds",
            "Dimensions": dimensions,
        },
        {
            "MetricName": "InvocationCount",
            "Value": 1,
            "Unit": "Count",
            "Dimensions": dimensions,
        },
    ]
    
    if not success:
        metric_data.append({
            "MetricName": "ErrorCount",
            "Value": 1,
            "Unit": "Count",
            "Dimensions": dimensions,
        })
    
    # Fire-and-forget in background thread
    thread = threading.Thread(target=_publish_metrics_async, args=(metric_data,), daemon=True)
    thread.start()

def publish_student_event(event_type: str):
    """Publish student lifecycle events (e.g., ProfileCreated, BlueprintGenerated)."""
    metric_data = [
        {
            "MetricName": event_type,
            "Value": 1,
            "Unit": "Count",
            "Dimensions": [{"Name": "EventType", "Value": event_type}],
        }
    ]
    thread = threading.Thread(target=_publish_metrics_async, args=(metric_data,), daemon=True)
    thread.start()
