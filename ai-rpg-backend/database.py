from sqlalchemy import Boolean, Column, Integer, String, Text, JSON, ForeignKey, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship

# Database setup using SQLAlchemy
SQLALCHEMY_DATABASE_URL = "sqlite:///./game.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Define the User model (for future authentication features)
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String) # For later: Auth

# Define the Scenario model
class Scenario(Base):
    __tablename__ = "scenarios"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    description = Column(Text)
    image_url = Column(String, nullable=True)
    # The hidden prompt that tells Gemini how this world works:
    system_prompt = Column(Text) 
    creator_id = Column(Integer, ForeignKey("users.id"))
    is_public = Column(Boolean, default=True)

# Define the Adventure model
class Adventure(Base):
    __tablename__ = "adventures"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True) # Null for guests
    scenario_id = Column(Integer, ForeignKey("scenarios.id"))
    current_stats = Column(JSON) # {hp: 20, str: 10...}
    history = Column(JSON) # The chat logs
    last_played = Column(String)
    stats = Column(JSON) # To store character stats like HP, Strength, etc.

# Define the Character model
class Character(Base):
    __tablename__ = "characters"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    # Stats
    strength = Column(Integer, default=10)
    dexterity = Column(Integer, default=10)
    intelligence = Column(Integer, default=10)
    constitution = Column(Integer, default=10)
    # Game Info
    hp = Column(Integer, default=20)
    level = Column(Integer, default=1)
    world_context = Column(Text) # The "Setting" of the story
    history = Column(JSON, default=[]) # To store the chat logs

Base.metadata.create_all(bind=engine)