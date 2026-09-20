import pytest


def test_register_new_user(client):
    """Register a new user successfully."""
    response = client.post("/api/auth/register", json={
        "email": "newuser@yaduk.dev",
        "password": "securepass123",
        "full_name": "New User"
    })
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "newuser@yaduk.dev"
    assert data["user"]["full_name"] == "New User"


def test_register_duplicate_email(client):
    """Registering with an existing email fails."""
    payload = {
        "email": "duplicate@yaduk.dev",
        "password": "password123",
        "full_name": "First User"
    }
    client.post("/api/auth/register", json=payload)
    response = client.post("/api/auth/register", json=payload)
    assert response.status_code == 400
    assert "already exists" in response.json()["detail"]


def test_login_valid_credentials(client):
    """Login with valid credentials returns token."""
    client.post("/api/auth/register", json={
        "email": "loginuser@yaduk.dev",
        "password": "mypassword",
        "full_name": "Login User"
    })
    response = client.post("/api/auth/login", json={
        "email": "loginuser@yaduk.dev",
        "password": "mypassword"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "loginuser@yaduk.dev"


def test_login_invalid_password(client):
    """Login with wrong password fails."""
    client.post("/api/auth/register", json={
        "email": "wrongpw@yaduk.dev",
        "password": "correctpass",
    })
    response = client.post("/api/auth/login", json={
        "email": "wrongpw@yaduk.dev",
        "password": "wrongpass"
    })
    assert response.status_code == 401


def test_login_nonexistent_user(client):
    """Login with non-existent email fails."""
    response = client.post("/api/auth/login", json={
        "email": "ghost@yaduk.dev",
        "password": "anything"
    })
    assert response.status_code == 401


def test_me_with_valid_token(client, registered_user):
    """Fetch current user with valid token."""
    token = registered_user["access_token"]
    response = client.get("/api/auth/me", headers={
        "Authorization": f"Bearer {token}"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "test@yaduk.dev"


def test_me_without_token(client):
    """Fetch current user without token fails."""
    response = client.get("/api/auth/me")
    assert response.status_code == 401


def test_me_with_invalid_token(client):
    """Fetch current user with garbage token fails."""
    response = client.get("/api/auth/me", headers={
        "Authorization": "Bearer invalid.garbage.token"
    })
    assert response.status_code == 401
