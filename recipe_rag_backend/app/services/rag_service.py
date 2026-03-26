import logging
import time
from typing import List, Dict, Any, Optional

from app.core.config import settings
from app.services.data_loader import DataLoader
from app.services.aicr_guidelines_service import aicr_service
from app.services.intent_analyzer import IntentAnalyzer
from app.services.recipe_verifier import RecipeVerifier
from app.services.recipe_enhancer import RecipeEnhancer
from app.services.search_engine import SearchEngine
from app.services.response_generator import ResponseGenerator

logger = logging.getLogger(__name__)

class RecipeRAGService:
    def __init__(self):
        self.embeddings = None
        self.llm = None
        self.vector_store = None
        self.data_loader = DataLoader()
        self.is_initialized = False
        self.initialization_error = None
        
        # Initialize modular services
        self.intent_analyzer = IntentAnalyzer()
        self.recipe_verifier = RecipeVerifier()
        self.recipe_enhancer = RecipeEnhancer()
        self.search_engine = SearchEngine()
        self.response_generator = ResponseGenerator()
        
    def initialize(self):
        try:
            if not settings.OPENAI_API_KEY:
                raise ValueError("OPENAI_API_KEY not found")
            
            from langchain.embeddings import OpenAIEmbeddings
            from langchain.vectorstores import FAISS
            from langchain.text_splitter import RecursiveCharacterTextSplitter
            from langchain.chat_models import ChatOpenAI
            
            self.embeddings = OpenAIEmbeddings(
                model=settings.EMBEDDING_MODEL,
                openai_api_key=settings.OPENAI_API_KEY
            )
            
            self.llm = ChatOpenAI(
                model_name=settings.LLM_MODEL,
                temperature=settings.LLM_TEMPERATURE,
                max_tokens=settings.LLM_MAX_TOKENS,
                openai_api_key=settings.OPENAI_API_KEY
            )
            
            # Initialize modular services with LLM and embeddings
            self.intent_analyzer.initialize(self.llm)
            self.recipe_verifier.initialize(self.llm)
            self.recipe_enhancer.initialize(self.llm, aicr_service)
            self.search_engine.initialize(self.vector_store, self.llm)
            self.response_generator.initialize(self.llm)
            
            self.data_loader.load_data()
            documents = self.data_loader.prepare_documents()
            
            text_splitter = RecursiveCharacterTextSplitter(
                chunk_size=settings.CHUNK_SIZE,
                chunk_overlap=settings.CHUNK_OVERLAP
            )
            split_docs = text_splitter.split_documents(documents)
            
            logger.info(f"Creating vector store with {len(split_docs)} document chunks")
            self.vector_store = FAISS.from_documents(split_docs, self.embeddings)
            
            # Update search engine with vector store
            self.search_engine.vector_store = self.vector_store
            
            self.is_initialized = True
            self.initialization_error = None
            logger.info("RAG system initialized successfully")
            
        except Exception as e:
            self.is_initialized = False
            self.initialization_error = str(e)
            logger.error(f"Error initializing RAG system: {e}")
            raise
    
    def ask_question(self, query: str, mode: str = "auto", conversation_history: List[Dict] = None) -> Dict[str, Any]:
        """
        Main entry point with conversation context support
        """
        if not self.is_initialized:
            raise ValueError("RAG system not initialized")
        
        logger.info(f"Processing query: '{query}' with {len(conversation_history or [])} previous messages")
        start_time = time.time()
        
        try:
            # Step 1: Enhanced intent understanding with conversation context
            intent_data = self.intent_analyzer.understand_query_intent_with_context(query, conversation_history)
            logger.info(f"Intent analysis: {time.time() - start_time:.2f}s")
            
            # Step 2: Multi-query search
            docs = self.search_engine.multi_query_search(query, intent_data, k=settings.SEARCH_K * 2)
            logger.info(f"Search complete: {time.time() - start_time:.2f}s, found {len(docs)} docs")
            
            # Step 3: Reranking
            reranked_docs = self.search_engine.rerank_with_constraint_filtering(docs, query, intent_data, top_k=settings.SEARCH_K)
            logger.info(f"Reranking complete: {time.time() - start_time:.2f}s, {len(reranked_docs)} docs")
            
            # Step 4: Extract recipe details
            candidate_recipes = []
            for doc in reranked_docs:
                try:
                    recipe_details = self.search_engine.extract_recipe_details(doc.page_content)
                    recipe_data = {
                        "name": self.search_engine.safe_get_metadata(doc, "name"),
                        "type": self.search_engine.safe_get_metadata(doc, "type"),
                        "calories": self.search_engine.safe_get_metadata(doc, "calories", 0),
                        "content": doc.page_content,
                        "youtube_link": self.search_engine.safe_get_metadata(doc, "youtube_link", ""),
                        **recipe_details
                    }
                    candidate_recipes.append(recipe_data)
                except Exception as e:
                    logger.error(f"Error extracting recipe: {e}")
                    continue
            
            logger.info(f"Extraction complete: {time.time() - start_time:.2f}s")
            
            # Step 5: BATCH VERIFICATION with AICR validation
            candidate_recipes = self.recipe_verifier.batch_verify_recipes(candidate_recipes, intent_data, aicr_service)
            logger.info(f"Batch verification complete: {time.time() - start_time:.2f}s")
            
            # Separate passed/failed
            verified_recipes = [r for r in candidate_recipes if r.get("verification_details", {}).get("passes_verification")]
            failed_recipes = [r for r in candidate_recipes if not r.get("verification_details", {}).get("passes_verification")]
            
            logger.info(f"Verification: {len(verified_recipes)} passed, {len(failed_recipes)} failed")
            
            # Step 6: Generate fallback if needed with AICR guidelines
            source_docs = verified_recipes
            
            if not verified_recipes:
                logger.warning("No recipes passed - generating AICR-compliant custom recipes")
                generated_recipes = self.recipe_enhancer.generate_fallback_recipes(query, intent_data, failed_recipes)
                
                if generated_recipes:
                    source_docs = generated_recipes
                else:
                    return {
                        "query": query,
                        "response": self.response_generator.generate_helpful_no_results_message(query, intent_data),
                        "source": "no_results",
                        "matches_found": 0,
                        "mode": mode,
                        "intent_analysis": intent_data,
                        "source_documents": []
                    }
            
            # Step 7: PARALLEL ENHANCEMENT with AICR guidelines
            source_docs = self.recipe_enhancer.batch_enhance_recipes(source_docs, intent_data)
            logger.info(f"Enhancement complete: {time.time() - start_time:.2f}s")
            
            # Step 8: Generate response
            response_text = self.response_generator.generate_personalized_response(query, source_docs, intent_data)
            
            total_time = time.time() - start_time
            logger.info(f"TOTAL TIME: {total_time:.2f}s")
            
            return {
                "query": query,
                "response": response_text,
                "source": "database" if verified_recipes else "llm_generated",
                "matches_found": len(source_docs),
                "mode": mode,
                "source_documents": source_docs,
                "intent_analysis": intent_data,
                "dynamically_adapted": any(doc.get("dynamically_adapted", False) for doc in source_docs),
                "instructions_generated": any(doc.get("instructions_generated", False) for doc in source_docs),
                "aicr_compliant": all(doc.get("aicr_compliance", {}).get("overall_compliant", False) for doc in source_docs),
                "verification_details": {
                    "total_candidates": len(candidate_recipes),
                    "passed_verification": len(verified_recipes),
                    "failed_verification": len(failed_recipes),
                    "llm_generated": len(source_docs) if not verified_recipes else 0
                },
                "performance": {
                    "total_time_seconds": round(total_time, 2)
                },
                "conversation_context_used": conversation_history is not None and len(conversation_history) > 0,
                "previous_messages_considered": len(conversation_history) if conversation_history else 0
            }
            
        except Exception as e:
            logger.error(f"Error processing query: {e}")
            import traceback
            logger.error(traceback.format_exc())
            return {
                "query": query,
                "response": "I apologize for the error. Please try rephrasing your question.",
                "source": "error",
                "matches_found": 0,
                "mode": mode,
                "source_documents": []
            }
    
    def search_recipes(self, query: str, k: int = None) -> List[Dict[str, Any]]:
        """Search for recipes"""
        if not self.is_initialized:
            raise ValueError("RAG system not initialized")
        
        k = k or settings.SEARCH_K
        intent_data = self.intent_analyzer.understand_query_intent(query)
        docs = self.search_engine.multi_query_search(query, intent_data, k=k)
        reranked_docs = self.search_engine.rerank_with_constraint_filtering(docs, query, intent_data, top_k=k)
        
        recipes = []
        for doc in reranked_docs:
            try:
                recipe_details = self.search_engine.extract_recipe_details(doc.page_content)
                recipe = {
                    "name": self.search_engine.safe_get_metadata(doc, "name"),
                    "type": self.search_engine.safe_get_metadata(doc, "type"),
                    "calories": self.search_engine.safe_get_metadata(doc, "calories", 0),
                    "content": doc.page_content,
                    "youtube_link": self.search_engine.safe_get_metadata(doc, "youtube_link", ""),
                    **recipe_details
                }
                
                # Add AICR validation to search results
                aicr_compliance = aicr_service.validate_recipe_compliance(recipe)
                recipe["aicr_compliance"] = aicr_compliance
                
                recipes.append(recipe)
            except Exception as e:
                logger.error(f"Error processing document: {e}")
                continue
        
        return recipes
    
    def get_system_info(self) -> Dict[str, Any]:
        """Get system information"""
        return {
            "initialized": self.is_initialized,
            "initialization_error": self.initialization_error,
            "recipes_loaded": self.data_loader.recipes_count if self.data_loader else 0,
            "vector_store_ready": self.vector_store is not None,
            "supports_dynamic_adaptation": True,
            "supports_constraint_based_search": True,
            "supports_recipe_verification": True,
            "supports_llm_generation": True,
            "supports_aicr_guidelines": True,
            "supports_conversation_context": True,
            "optimizations": {
                "batch_verification": True,
                "parallel_enhancement": True,
                "combined_enhancement": True,
                "token_reduction": True,
                "advanced_caching": True,
                "aicr_validation": True,
                "conversation_context": True
            },
            "cache_statistics": self.get_combined_cache_stats(),
            "aicr_guidelines": {
                "loaded": aicr_service._initialized,
                "source": aicr_service.get_guidelines()["metadata"]["source"],
                "version": aicr_service.get_guidelines()["metadata"]["version"]
            }
        }
    
    def get_combined_cache_stats(self) -> Dict[str, Any]:
        """Combine cache stats from all services"""
        return {
            "intent_analyzer": self.intent_analyzer.get_cache_stats(),
            "recipe_verifier": self.recipe_verifier.get_cache_stats(),
            "recipe_enhancer": self.recipe_enhancer.get_cache_stats()
        }
    
    def clear_caches(self):
        """Clear all caches"""
        self.intent_analyzer.clear_caches()
        self.recipe_verifier.clear_caches()
        self.recipe_enhancer.clear_caches()
        logger.info("All caches cleared")

# Global instance
rag_service = RecipeRAGService()
