from unittest.mock import patch, MagicMock


@patch("app.api.endpoints.artifacts.list_student_artifacts")
def test_list_artifacts(mock_list, client):
    """List artifacts for a student (mocked S3)."""
    mock_list.return_value = [
        {
            "key": "blueprints/1/blueprint-12345.json",
            "size_bytes": 2048,
            "last_modified": "2026-09-20T00:00:00",
            "url": "https://s3.amazonaws.com/test-url",
            "type": "blueprint"
        }
    ]
    response = client.get("/api/artifacts/1")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["type"] == "blueprint"


@patch("app.api.endpoints.artifacts.upload_blueprint_artifact")
def test_upload_blueprint(mock_upload, client):
    """Upload a blueprint artifact (mocked S3)."""
    mock_upload.return_value = {
        "key": "blueprints/1/blueprint-99999.json",
        "url": "https://s3.amazonaws.com/presigned-url",
        "size_bytes": 1024
    }
    response = client.post("/api/artifacts/blueprint", json={
        "student_id": 1,
        "blueprint": {"title": "Test Project", "overview": {}}
    })
    assert response.status_code == 200
    data = response.json()
    assert data["key"].startswith("blueprints/")
    assert "url" in data


@patch("app.api.endpoints.artifacts.generate_presigned_url")
def test_generate_download_url(mock_presign, client):
    """Generate presigned download URL (mocked S3)."""
    mock_presign.return_value = "https://s3.amazonaws.com/fresh-presigned-url"
    response = client.post("/api/artifacts/download-url", json={
        "key": "blueprints/1/blueprint-12345.json",
        "expires_in": 1800
    })
    assert response.status_code == 200
    data = response.json()
    assert "url" in data
