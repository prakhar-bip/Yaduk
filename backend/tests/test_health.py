def test_root_returns_welcome(client):
    """Root endpoint returns welcome message."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "message" in data
    assert "Yaduk" in data["message"]


def test_health_endpoint(client):
    """Health endpoint returns healthy status with DB info."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "database" in data
    assert "service" in data


def test_health_api_endpoint(client):
    """API health endpoint returns same as root health."""
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
