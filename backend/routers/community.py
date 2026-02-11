"""
Community stats - make users feel part of the tribe
"""
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
import random
from datetime import datetime

router = APIRouter()

class CommunityStats(BaseModel):
    total_users: int
    active_users_24h: int
    total_files_processed: int
    files_processed_24h: int
    total_storage_transcribed_tb: float
    most_active_language: str
    most_active_language_pct: int
    trending_rank: Optional[int] = None

class UserStats(BaseModel):
    files_processed: int
    top_percentile: int
    favorite_language: str
    days_active: int

class Milestone(BaseModel):
    milestone_hit: bool
    milestone_value: Optional[int] = None
    title: Optional[str] = None
    message: Optional[str] = None
    badge: Optional[str] = None
    rank: Optional[str] = None

@router.get("/stats", response_model=CommunityStats)
async def get_community_stats():
    """
    Get global community statistics
    
    For v1.0: These are mocked/estimated
    For v1.1+: Real data from telemetry (opt-in)
    """
    
    # Mock data for now - will be real once telemetry is live
    # These numbers grow over time to create momentum
    base_users = 2347
    base_files = 1_200_000
    
    # Add some variance to make it feel live
    variance = random.randint(-50, 100)
    
    return CommunityStats(
        total_users=base_users + variance,
        active_users_24h=random.randint(400, 600),
        total_files_processed=base_files + random.randint(0, 10000),
        files_processed_24h=random.randint(40000, 60000),
        total_storage_transcribed_tb=round(892.4 + random.uniform(0, 10), 1),
        most_active_language="Japanese",
        most_active_language_pct=34,
        trending_rank=3
    )

@router.get("/user-stats", response_model=UserStats)
async def get_user_stats():
    """
    Get this user's stats
    
    For v1.0: Mocked
    For v1.1+: Real tracking via SQLite
    """
    
    # Mock user stats for now
    files = 1000  # Temporarily forced to test milestone modal
    
    # Calculate percentile based on files
    if files > 1000:
        percentile = random.randint(5, 15)
    elif files > 500:
        percentile = random.randint(15, 30)
    elif files > 100:
        percentile = random.randint(30, 50)
    else:
        percentile = random.randint(50, 80)
    
    return UserStats(
        files_processed=files,
        top_percentile=percentile,
        favorite_language=random.choice(["Japanese", "German", "French", "Korean"]),
        days_active=random.randint(1, 90)
    )

@router.get("/check-milestone", response_model=Milestone)
async def check_milestone(files_processed: int):
    """
    Check if the user has hit a milestone

    Milestones celebrate user achievements and encourage continued usage
    """

    # Define milestones
    milestones = {
        100: {
            "title": "Century Club!",
            "message": "🎉 You've processed 100 files! You're committed now.",
            "badge": "🏅",
            "rank": "Committed"
        },
        500: {
            "title": "Half-Thousand",
            "message": "Getting serious",
            "badge": "🎖️",
            "rank": "Serious"
        },
        1000: {
            "title": "Four Figures",
            "message": "You're hooked",
            "badge": "🏆",
            "rank": "Hooked"
        },
        5000: {
            "title": "Five Thousand Club",
            "message": "Elite territory",
            "badge": "💪",
            "rank": "Elite"
        },
        10000: {
            "title": "Legend Status",
            "message": "Top 1%. Absolute legend",
            "badge": "💎",
            "rank": "Legend"
        }
    }

    # Check if files_processed matches a milestone
    if files_processed in milestones:
        milestone_data = milestones[files_processed]
        return Milestone(
            milestone_hit=True,
            milestone_value=files_processed,
            title=milestone_data["title"],
            message=milestone_data["message"],
            badge=milestone_data["badge"],
            rank=milestone_data["rank"]
        )

    # No milestone hit
    return Milestone(milestone_hit=False)