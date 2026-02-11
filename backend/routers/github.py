"""
GitHub integration - fetch repo stats for social proof
"""
from fastapi import APIRouter
import httpx
from typing import Optional

router = APIRouter()

GITHUB_REPO = "coaxk/subbrainarr"
GITHUB_API_URL = f"https://api.github.com/repos/{GITHUB_REPO}"

@router.get("/stars")
async def get_github_stars():
    """
    Fetch current GitHub star count
    """
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                GITHUB_API_URL,
                headers={"Accept": "application/vnd.github.v3+json"},
                timeout=5.0
            )
            
            if response.status_code == 200:
                data = response.json()
                return {
                    "stars": data.get("stargazers_count", 0),
                    "forks": data.get("forks_count", 0),
                    "watchers": data.get("watchers_count", 0),
                    "open_issues": data.get("open_issues_count", 0),
                    "repo_url": data.get("html_url", ""),
                    "description": data.get("description", "")
                }
            else:
                return {"stars": 0, "error": "Could not fetch stats"}
                
    except Exception as e:
        return {"stars": 0, "error": str(e)}