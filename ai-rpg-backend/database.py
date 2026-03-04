from sqlalchemy import Column, Integer, String, Text, JSON, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Database setup using SQLAlchemy
SQLALCHEMY_DATABASE_URL = "sqlite:///./game.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

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