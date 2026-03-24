# GOAL: Accept a file path as input.
# 1. Read the file (support .txt and .pdf)
# 2. Split the text into chunks (~500 characters, 50 character overlap)
# 3. Embed each chunk using nomic-embed-text via Ollama
# 4. Store the chunks in a ChromaDB collection called "mentormind"
# 5. Print how many chunks were stored

import sys
import pathlib
import chromadb
import ollama


def read_file(file_path: str) -> str:
    path = pathlib.Path(file_path)
    if path.suffix == ".txt":
        return path.read_text(encoding="utf-8")
    elif path.suffix == ".pdf":
        import pypdf
        reader = pypdf.PdfReader(str(path))
        return "\n".join(page.extract_text() or "" for page in reader.pages)
    else:
        raise ValueError(f"Unsupported file type: {path.suffix}")


def chunk_text(text: str, size: int = 500, overlap: int = 50) -> list[str]:
    chunks = []
    start = 0
    while start < len(text):
        chunks.append(text[start:start + size])
        start += size - overlap
    return chunks


def ingest(file_path: str):
    text = read_file(file_path)
    chunks = chunk_text(text)

    client = chromadb.PersistentClient(path="./chroma_db")
    collection = client.get_or_create_collection("mentormind")

    ids = []
    embeddings = []
    documents = []

    for i, chunk in enumerate(chunks):
        response = ollama.embeddings(model="nomic-embed-text", prompt=chunk)
        ids.append(f"{pathlib.Path(file_path).stem}_{i}")
        embeddings.append(response["embedding"])
        documents.append(chunk)

    collection.add(ids=ids, embeddings=embeddings, documents=documents)
    print(f"Stored {len(chunks)} chunks.")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python ingest.py <file_path>")
        sys.exit(1)
    ingest(sys.argv[1])