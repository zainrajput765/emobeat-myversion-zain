import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")

# Initialize MongoDB Client
client = MongoClient(MONGO_URI)

# Select Database
db = client["emobeat_db"]

# Select Collections
users_collection = db["users"]
scans_collection = db["scans"]
