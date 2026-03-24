## Session — Day 1 | Date: 23.03.2026

**What I built today:**

Built the full RAG pipeline from scratch. ingest.py reads PDF and 
txt files, splits the text into overlapping chunks, embeds each 
chunk using nomic-embed-text via Ollama, and stores them in 
ChromaDB. retriever.py takes a query string, embeds it with the 
same model, and returns the 3 most similar chunks from the 
collection.
