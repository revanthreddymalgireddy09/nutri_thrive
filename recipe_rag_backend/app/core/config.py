import os
from dotenv import load_dotenv

load_dotenv(override=True)

class Settings:
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    DATA_FILE_PATH: str = os.getenv("DATA_FILE_PATH", "app/data/Recipe.csv")
    
    EMBEDDING_MODEL: str = "text-embedding-ada-002"
    LLM_MODEL: str = "gpt-3.5-turbo"
    LLM_TEMPERATURE: float = 0.5
    LLM_MAX_TOKENS: int = 1500
    
    CHUNK_SIZE: int = 1000
    CHUNK_OVERLAP: int = 100
    SEARCH_K: int = 8

settings = Settings()
