import logging
import json
import re
import hashlib
from typing import Dict, Any, List, Optional

logger = logging.getLogger(__name__)

class IntentAnalyzer:
    def __init__(self):
        self.llm = None
        self.intent_cache = {}
        self.cache_hits = 0
        self.cache_misses = 0
        
    def initialize(self, llm):
        self.llm = llm
    
    def understand_query_intent(self, query: str) -> Dict[str, Any]:
        """Original intent analysis without context"""
        normalized_query = self._normalize_query(query)
        if normalized_query in self.intent_cache:
            self.cache_hits += 1
            logger.info(f"Intent cache HIT for query: '{query}'")
            return self.intent_cache[normalized_query]
        
        self.cache_misses += 1
        
        try:
            intent_prompt = self._build_intent_prompt(query)
            response = self.llm.predict(intent_prompt)
            intent_data = self._parse_intent_response(response)
            
            self.intent_cache[normalized_query] = intent_data
            return intent_data
            
        except Exception as e:
            logger.error(f"Error understanding query intent: {e}")
            return self._get_fallback_intent_data(query)
    
    def understand_query_intent_with_context(self, query: str, conversation_history: List[Dict] = None) -> Dict[str, Any]:
        """Enhanced intent analysis with conversation context"""
        if not conversation_history:
            return self.understand_query_intent(query)
        
        try:
            # Build conversation context
            context_lines = []
            for msg in conversation_history[-6:]:  # Last 3 exchanges
                role = "User" if msg.get("role") == "user" else "Assistant"
                context_lines.append(f"{role}: {msg.get('content', '')}")
            
            conversation_context = "\n".join(context_lines)
            
            enhanced_prompt = f"""You are an expert at understanding user recipe queries WITH conversation context.

CONVERSATION HISTORY (most recent first):
{conversation_context}

CURRENT USER QUERY: "{query}"

Analyze this query considering the conversation history. Extract ALL relevant information including:

1. **Constraints** (from current query AND previous context)
2. **Preferences** (from current query AND previous context)  
3. **Search Strategy** (considering the full conversation flow)

Pay special attention to:
- Follow-up questions that reference previous recipes
- Refinements or changes to previous constraints
- New information that builds on previous context

Return the SAME JSON format as the original intent analysis, but with context-aware understanding.
"""

            response = self.llm.predict(enhanced_prompt)
            intent_data = self._parse_intent_response(response)
            logger.info(f"Context-aware intent analysis: {intent_data['query_type']}")
            
            # Cache with context consideration
            cache_key = self._normalize_query(query + str(hash(str(conversation_history))))
            self.intent_cache[cache_key] = intent_data
            
            return intent_data
            
        except Exception as e:
            logger.error(f"Error in context-aware intent analysis: {e}")
            return self.understand_query_intent(query)
    
    def _build_intent_prompt(self, query: str) -> str:
        """Build the intent analysis prompt"""
        return f"""You are an expert at understanding user recipe queries. Analyze this query and extract ALL relevant information.

User Query: "{query}"

Extract the following information:

[Your existing intent prompt structure here - too long to duplicate]
"""

    def _parse_intent_response(self, response: str) -> Dict[str, Any]:
        """Parse the LLM response into intent data"""
        response = response.strip()
        if response.startswith("```json"):
            response = response[7:]
        elif response.startswith("```"):
            response = response[3:]
        if response.endswith("```"):
            response = response[:-3]
        response = response.strip()
        
        return json.loads(response)
    
    def _normalize_query(self, query: str) -> str:
        """Normalize query for caching"""
        normalized = query.lower().strip()
        normalized = re.sub(r'\s+', ' ', normalized)
        normalized = normalized.replace('?', '').replace('!', '').strip()
        return normalized
    
    def _get_fallback_intent_data(self, query: str) -> Dict[str, Any]:
        """Fallback intent data"""
        return {
            "query_type": "general",
            "constraints": {
                "budget_max": None,
                "time_max_minutes": None,
                "max_ingredients": None,
                "min_ingredients": None,
                "ingredients_available": [],
                "ingredients_must_use": [],
                "equipment_required": [],
                "equipment_only": [],
                "dietary_restrictions": [],
                "allergens_to_avoid": [],
                "health_conditions": [],
                "skill_level": None
            },
            "preferences": {
                "cuisine_types": [],
                "flavor_profiles": [],
                "meal_types": [],
                "texture_preferences": [],
                "nutritional_goals": [],
                "cooking_methods": []
            },
            "cancer_patient_specific": {
                "symptoms": [],
                "dietary_needs": [],
                "texture_requirements": []
            },
            "search_strategy": {
                "primary_focus": query,
                "search_keywords": query.split()[:5],
                "must_match_criteria": [],
                "enhanced_query": query
            }
        }
    
    def get_cache_stats(self) -> Dict[str, Any]:
        return {
            "cache_size": len(self.intent_cache),
            "cache_hits": self.cache_hits,
            "cache_misses": self.cache_misses,
            "hit_rate": f"{round(self.cache_hits / max(self.cache_hits + self.cache_misses, 1) * 100, 1)}%"
        }
    
    def clear_caches(self):
        self.intent_cache.clear()
        self.cache_hits = 0
        self.cache_misses = 0