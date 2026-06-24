import logging
from typing import Optional
 
import chromadb
from chromadb.config import Settings as ChromaSettings
from langchain_core.documents import Document
 
from config.settings import CHROMA_DB_DIR
from pipeline.embedder import get_embeddings
 
logger = logging.getLogger(_name_)
 
COLLECTION_NAME = "eyedetect_medical_kb"
 
_chroma_client: Optional[chromadb.ClientAPI] = None
 
 
def _get_client() -> chromadb.ClientAPI:
    global _chroma_client
    if _chroma_client is None:
        CHROMA_DB_DIR.mkdir(parents=True, exist_ok=True)
        _chroma_client = chromadb.PersistentClient(
            path=str(CHROMA_DB_DIR),
            settings=ChromaSettings(anonymized_telemetry=False),
        )
        logger.info("ChromaDB client initialized — path=%s", CHROMA_DB_DIR)
    return _chroma_client
 
 
def _get_collection():
    client = _get_client()
    return client.get_or_create_collection(
        name=COLLECTION_NAME,
        metadata={"hnsw:space": "cosine"},
    )
 
 
# ─── Write Operations ────────────────────────────────────────
 
 
def add_documents(chunks: list[Document]) -> int:
    """
    Embed and store document chunks in ChromaDB with full metadata.
 
    Stored metadata per chunk:
        source, file_type, doc_id, language, disease_category,
        page, chunk_index, chunk_total, chunk_strategy
 
    Returns the number of chunks successfully stored.
    """
    if not chunks:
        return 0
 
    collection = _get_collection()
    embeddings_model = get_embeddings()
 
    texts = [c.page_content for c in chunks]
    metadatas = []
    ids = []
 
    for i, chunk in enumerate(chunks):
        meta = {}
        for key, val in chunk.metadata.items():
            if val is None:
                continue
            if isinstance(val, (str, int, float, bool)):
                meta[key] = val
            else:
                meta[key] = str(val)
        metadatas.append(meta)
 
        doc_id = chunk.metadata.get("doc_id", "unknown")
        ids.append(f"{doc_id}chunk{i}")
 
    vectors = embeddings_model.embed_documents(texts)
 
    BATCH = 166
    stored = 0
    for start in range(0, len(ids), BATCH):
        end = start + BATCH
        collection.add(
            ids=ids[start:end],
            embeddings=vectors[start:end],
            documents=texts[start:end],
            metadatas=metadatas[start:end],
        )
        stored += end - start
 
    stored = min(stored, len(ids))
    logger.info("Stored %d chunks in ChromaDB collection '%s'", stored, COLLECTION_NAME)
    return stored
 
 
def delete_by_doc_id(doc_id: str) -> int:
    """Remove all chunks that belong to a specific document ID."""
    collection = _get_collection()
    existing = collection.get(where={"doc_id": doc_id})
    count = len(existing["ids"])
    if count > 0:
        collection.delete(ids=existing["ids"])
        logger.info("Deleted %d chunks for doc_id=%s", count, doc_id)
    return count
 
 
def delete_by_source(source_filename: str) -> int:
    """Remove all chunks originating from a specific file."""
    collection = _get_collection()
    existing = collection.get(where={"source": source_filename})
    count = len(existing["ids"])
    if count > 0:
        collection.delete(ids=existing["ids"])
        logger.info("Deleted %d chunks for source=%s", count, source_filename)
    return count
 
 
# ─── Read Operations ─────────────────────────────────────────
 
 
def search(
    query: str,
    k: int = 4,
    language: Optional[str] = None,
    disease_category: Optional[str] = None,
) -> list[dict]:
    """
    Similarity search across the medical knowledge base.
 
    Returns a list of dicts, each containing:
        text, metadata, relevance_score
    """
    collection = _get_collection()
    embeddings_model = get_embeddings()
 
    query_vector = embeddings_model.embed_query(query)
 
    where_filter = _build_filter(language, disease_category)
 
    results = collection.query(
        query_embeddings=[query_vector],
        n_results=k,
        where=where_filter,
        include=["documents", "metadatas", "distances"],
    )
 
    hits = []
    for doc, meta, dist in zip(
        results["documents"][0],
        results["metadatas"][0],
        results["distances"][0],
    ):
        relevance = max(0.0, 1.0 - dist)
        hits.append({
            "text": doc,
            "metadata": meta,
            "relevance_score": round(relevance, 4),
        })
 
    logger.info(
        "Search returned %d results [k=%d, lang=%s, disease=%s]",
        len(hits), k, language, disease_category,
    )
    return hits
 
 
def _build_filter(
    language: Optional[str] = None,
    disease_category: Optional[str] = None,
) -> Optional[dict]:
    """Construct ChromaDB where-filter from optional criteria."""
    conditions = []
    if language:
        conditions.append({"language": language})
    if disease_category:
        conditions.append({"disease_category": disease_category})
 
    if not conditions:
        return None
    if len(conditions) == 1:
        return conditions[0]
    return {"$and": conditions}
 
 
# ─── Stats ────────────────────────────────────────────────────
 
 
def get_collection_stats() -> dict:
    """Return summary statistics about the vector store."""
    collection = _get_collection()
    total = collection.count()
    return {
        "collection": COLLECTION_NAME,
        "total_chunks": total,
        "persist_directory": str(CHROMA_DB_DIR),
    }
