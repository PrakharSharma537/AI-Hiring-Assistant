import os
from dotenv import load_dotenv
from langchain_community.document_loaders import JSONLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.embeddings.fastembed import FastEmbedEmbeddings
from langchain_pinecone import PineconeVectorStore
from pinecone import Pinecone, ServerlessSpec

# Load env
load_dotenv()
api_key = os.getenv("PINECONE_API_KEY")

# Pinecone init
pc = Pinecone(api_key=api_key)
index_name = "hiringdb"

# अगर index exist नहीं करता तो create करो
if index_name not in pc.list_indexes().names():
    pc.create_index(
        name=index_name,
        dimension=786,
        metric="cosine",
        spec=ServerlessSpec(cloud="aws", region="us-east-1")
    )

# Load JSON
loader = JSONLoader(file_path='../data/data.json', jq_schema='.[]', text_content=False)
docs = loader.load()

# Split docs
text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=100)
chunked_docs = text_splitter.split_documents(docs)

# Embeddings
embeddings = FastEmbedEmbeddings()

# Push to Pinecone
vector_store = PineconeVectorStore.from_documents(
    chunked_docs,
    embeddings,
    index_name=index_name
)

print("✅ Catalog ingested into Pinecone successfully!")
