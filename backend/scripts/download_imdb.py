import os
import pandas as pd
from datasets import load_dataset

def download_imdb():
    print("Loading imdb dataset from Hugging Face...")
    # Load the train split which has 25,000 reviews
    dataset = load_dataset('imdb', split='train')
    
    # Convert to pandas DataFrame
    df = dataset.to_pandas()
    
    print(f"Loaded {len(df)} records. Formatting...")
    
    # Hugging Face imdb dataset has 'text' and 'label' columns.
    # Label 0 = negative, Label 1 = positive.
    # We need 'review' and 'sentiment' columns for SentixAI CsvIngestor.ts
    
    df.rename(columns={'text': 'review'}, inplace=True)
    df['sentiment'] = df['label'].map({0: 'negative', 1: 'positive'})
    
    # Drop the original 'label' column to match expected CSV strictly
    df.drop(columns=['label'], inplace=True)
    
    # Ensure data directory exists
    data_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'data')
    os.makedirs(data_dir, exist_ok=True)
    
    csv_path = os.path.join(data_dir, 'IMDB Dataset.csv')
    print(f"Saving to {csv_path}...")
    
    # Save to CSV
    df.to_csv(csv_path, index=False)
    
    print("Done! The dataset is ready for CsvIngestor.ts")

if __name__ == "__main__":
    download_imdb()
