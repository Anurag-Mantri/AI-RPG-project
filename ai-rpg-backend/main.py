import os
import random
from typing import List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from google import genai
from google.genai import types

# Load environment variables from .env file
load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize the new Google GenAI Client
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

# We define the structure for history messages
class ChatMessage(BaseModel):
    role: str # "user" or "model"
    text: str

class GameState(BaseModel):
    user_input: str
    history: List[ChatMessage] = []

@app.post("/play")
async def play_turn(state: GameState):
    # 1. Roll the D20
    dice_roll = random.randint(1, 20)
    
    # 2. Logic for the outcome
    if dice_roll == 1:
        outcome_modifier = "A critical failure. The worst possible outcome happens."
    elif 2 <= dice_roll <= 5:
        outcome_modifier = "A poor outcome. Things go badly for the player."
    elif 6 <= dice_roll <= 14:
        outcome_modifier = "A mixed or standard outcome. Some success, some struggle."
    elif 15 <= dice_roll <= 19:
        outcome_modifier = "A great success. Things go very well."
    elif dice_roll == 20: # 20
        outcome_modifier = "A critical success! A natural 20! The best possible outcome happens."
    else: # Modifier added more than 20
        outcome_modifier = "An extraordinary success! The player achieves something remarkable. But not a natural 20."
        
    # 3. System Instructions (This tells the AI how to behave)
    system_instruction = f"""
    You are a professional Dungeon Master for a text based RPG game. You create immersive narratives based on player actions and dice rolls. 
    The player just attempted: "{state.user_input}"
    The player just rolled a {dice_roll} out of 20. 
    The dice roll outcome is: {dice_roll} ({outcome_modifier})
    
    Rules:
    - Incorporate the dice roll result into the narrative.
    - Keep responses under 200 words.
    - Be immersive and descriptive.
    - Never break character.
    """

    try:
        # 4. Format history for the new SDK
        # The new SDK expects a list of Content objects
        contents = []
        for msg in state.history:
            contents.append(types.Content(role=msg.role, parts=[types.Part.from_text(text=msg.text)]))
        
        # Add the latest user input
        contents.append(types.Content(role="user", parts=[types.Part.from_text(text=state.user_input)]))

        # 5. Generate Response
        response = client.models.generate_content(
            model="gemini-2.5-flash", # or "gemini-1.5-pro"
            contents=contents,
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                temperature=0.7,
            ),
        )

        return {
            "story_text": response.text,
            "roll": dice_roll,
            "modifier": outcome_modifier
        }
        
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)