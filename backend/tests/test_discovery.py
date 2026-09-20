def test_create_student_profile(client, sample_student_payload):
    """Create a student profile via discovery endpoint."""
    response = client.post("/api/discovery/", json=sample_student_payload)
    assert response.status_code == 200
    data = response.json()
    assert data["field_of_study"] == "Computer Science"
    assert data["experience_level"] == "Intermediate"
    assert "id" in data
    assert isinstance(data["technical_skills"], list)


def test_create_student_profile_missing_fields(client):
    """Creating a student with missing required fields fails."""
    response = client.post("/api/discovery/", json={
        "field_of_study": "CS"
    })
    assert response.status_code == 422  # Pydantic validation error
