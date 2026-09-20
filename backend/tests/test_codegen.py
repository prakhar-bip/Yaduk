from unittest.mock import patch


@patch("app.api.endpoints.codegen.generate_single_file")
def test_codegen_generate_file_success(mock_gen, client):
    """Test generating a single file via codegen endpoint."""
    mock_gen.return_value = "import React from 'react';\nexport default function Dashboard() { return <div>Dashboard</div>; }"
    
    payload = {
        "file_path": "frontend/src/pages/Dashboard.tsx",
        "file_purpose": "Dashboard page with metrics and statistics",
        "project_title": "AI Platform",
        "blueprint_summary": "Intelligent architecture platform",
        "db_schema_ddl": "CREATE TABLE users (id SERIAL PRIMARY KEY, name VARCHAR(255));",
        "api_routes": [
            {
                "method": "GET",
                "route": "/api/v1/users",
                "summary": "List users",
            }
        ],
        "theme": {
            "primary": "#3B82F6",
            "secondary": "#1E293B",
            "accent": "#10B981",
            "dark": "#0F172A"
        },
        "approved_dependencies": [
            {"name": "react", "purpose": "UI Library"}
        ]
    }
    
    response = client.post("/api/codegen/generate-file", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["file_path"] == "frontend/src/pages/Dashboard.tsx"
    assert data["language"] == "typescript"
    assert data["success"] is True
    assert "Dashboard" in data["code"]


@patch("app.api.endpoints.codegen.generate_single_file")
def test_codegen_generate_python_file(mock_gen, client):
    """Test language detection for python file."""
    mock_gen.return_value = "from fastapi import APIRouter\nrouter = APIRouter()\n"
    
    payload = {
        "file_path": "backend/app/routers/users.py",
        "file_purpose": "User management router",
        "project_title": "AI Platform"
    }
    
    response = client.post("/api/codegen/generate-file", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["file_path"] == "backend/app/routers/users.py"
    assert data["language"] == "python"
    assert data["success"] is True


@patch("app.api.endpoints.codegen.generate_single_file")
def test_codegen_failure_handling(mock_gen, client):
    """Test 500 status when code generation raises an exception."""
    mock_gen.side_effect = RuntimeError("Provider timeout")
    
    payload = {
        "file_path": "backend/app/models.py",
        "file_purpose": "SQLAlchemy models",
        "project_title": "AI Platform"
    }
    
    response = client.post("/api/codegen/generate-file", json=payload)
    assert response.status_code == 500
    assert "Provider timeout" in response.json()["detail"]
