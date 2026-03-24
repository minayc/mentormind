# GOAL: Accept a query string and return the most relevant chunks.
# 1. Connect to the existing ChromaDB collection "mentormind"
# 2. Embed the query using nomic-embed-text via Ollama
# 3. Search the collection for the top 3 most similar chunks
# 4. Return the results (the actual text, not just IDs)

import sys
import chromadb
import ollama

def embed_query(query: str):
    queryResponse = ollama.embeddings(model="nomic-embed-text", prompt=query)

    if "embedding" not in queryResponse:
        raise ValueError("No embeddning returned from model")
    return queryResponse["embedding"]


def search_query(search_query: str) -> str:
    search_query_embedded = embed_query(search_query)

    client = chromadb.PersistentClient(path="./chroma_db")
    collection = client.get_collection("mentormind")

    result = collection.query(query_embeddings=[search_query_embedded], n_results=3)
    for chunk in result["documents"][0]:
            print(chunk)
    return result["documents"][0]

if __name__ == '__main__':
    results = search_query(sys.argv[1])
    print(results)











