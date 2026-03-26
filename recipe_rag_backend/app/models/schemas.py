# app/models/schemas.py
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class RecipeRequest(BaseModel):
    query: str
    mode: Optional[str] = "auto"
    k: Optional[int] = 8

class RecipeDocument(BaseModel):
    """Individual recipe with full details and adaptations"""
    name: str
    type: str
    calories: Optional[int] = 0
    description: Optional[str] = ""
    content: Optional[str] = ""
    youtube_link: Optional[str] = ""
    
    # Recipe details
    ingredients: List[str] = []
    instructions: List[str] = []
    
    # Dynamic adaptations (the magic!)
    ingredient_adaptations: Optional[List[str]] = None
    helpful_tips: Optional[List[str]] = None
    
    # Flags
    dynamically_adapted: Optional[bool] = False
    instructions_generated: Optional[bool] = False
    instructions_adapted: Optional[bool] = False
    needs_instruction_generation: Optional[bool] = False
    
    class Config:
        extra = "allow"  # Allow additional fields

class IntentAnalysis(BaseModel):
    """User query intent analysis"""
    query_type: str
    constraints: Dict[str, Any] = {}
    preferences: Dict[str, Any] = {}
    cancer_patient_specific: Dict[str, Any] = {}
    search_strategy: Dict[str, Any] = {}
    
    class Config:
        extra = "allow"

class RecipeResponse(BaseModel):
    """Complete response with AI summary and detailed recipes"""
    query: str
    response: str  # AI-generated personalized response
    source: str
    matches_found: int
    mode: str
    
    # The key field that was missing!
    source_documents: List[Dict[str, Any]] = Field(default_factory=list)
    
    # Optional fields
    intent_analysis: Optional[Dict[str, Any]] = None
    dynamically_adapted: Optional[bool] = False
    instructions_generated: Optional[bool] = False
    verification_details: Optional[Dict[str, Any]] = None
    
    class Config:
        extra = "allow"  # Allow additional fields from the service

class SearchResponse(BaseModel):
    """Quick search response"""
    query: str
    results: List[Dict[str, Any]]
    total_found: int

class HealthCheck(BaseModel):
    status: str
    message: str
    model_loaded: bool
    recipes_count: int
    initialization_error: Optional[str] = None
    
    # Add more info
    instruction_cache_size: Optional[int] = 0
    supports_dynamic_adaptation: Optional[bool] = True
    supports_constraint_based_search: Optional[bool] = True
