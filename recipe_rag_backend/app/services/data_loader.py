# app/services/data_loader.py
import pandas as pd
import logging
from typing import List
from langchain.schema import Document
from app.core.config import settings

logger = logging.getLogger(__name__)

class DataLoader:
    def __init__(self):
        self.df = None
        self.recipes_count = 0
        
    def load_data(self, file_path: str = None) -> pd.DataFrame:
        try:
            file_path = file_path or settings.DATA_FILE_PATH
            logger.info(f"Loading data from: {file_path}")
            
            self.df = pd.read_csv(file_path)
            self.recipes_count = len(self.df)
            logger.info(f"Successfully loaded {self.recipes_count} recipes")
            
            self._clean_data()
            return self.df
            
        except Exception as e:
            logger.error(f"Error loading data: {e}")
            raise
    
    def _clean_data(self):
        self.df = self.df.fillna('')
        text_columns = ['Name', 'Type', 'Description', 'Ingredients', 'Directions', 'Notes', 'YT Link']
        for col in text_columns:
            if col in self.df.columns:
                self.df[col] = self.df[col].astype(str).apply(self._clean_text)
    
    def _clean_text(self, text: str) -> str:
        if not text:
            return ""
        
        replacements = {
            '\u2019': "'", '\u2018': "'", '\u201c': '"', '\u201d': '"',
            '\u2013': '-', '\u2014': '-', '\u2026': '...', '\u00b0': ' degrees',
            '\u00bd': '1/2', '\u00bc': '1/4', '\u00be': '3/4'
        }
        
        for unicode_char, ascii_char in replacements.items():
            text = text.replace(unicode_char, ascii_char)
        
        text = text.encode('ascii', 'ignore').decode('ascii')
        return ' '.join(text.split())
    
    def prepare_documents(self) -> List[Document]:
        if self.df is None:
            raise ValueError("Data not loaded. Call load_data() first.")
        
        documents = []
        for _, row in self.df.iterrows():
            recipe_text = f"""
Recipe Name: {row['Name']}
Type: {row['Type']}
Description: {row['Description']}
Calories: {row['Calories'] if row['Calories'] else 'Not specified'}
Ingredients: {row['Ingredients']}
Directions: {row['Directions']}
Notes: {row['Notes'] if row['Notes'] else 'No additional notes'}
"""
            metadata = {
                "name": row['Name'],
                "type": row['Type'],
                "calories": float(row['Calories']) if row['Calories'] and str(row['Calories']).replace('.', '').isdigit() else 0,
                "has_video": bool(row['YT Link']),
                "youtube_link": row['YT Link'] if row['YT Link'] else ""
            }
            documents.append(Document(page_content=recipe_text, metadata=metadata))
        
        return documents