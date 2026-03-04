import random
import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

GENAI_API_KEY = os.getenv("GEMINI_API_KEY")

app = FastAPI()

# Allow Frontend to talk to Backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure Gemini
genai.configure(api_key=GENAI_API_KEY)
model = genai.GenerativeModel('gemini-1.5-flash')

class GameState(BaseModel):
    user_input: str
    history: list = [] # To keep track of the story

@app.post("/play")
async def play_turn(state: GameState):
    # 1. Roll the D20
    dice_roll = random.randint(1, 20)
    
    # 2. Determine the "Quality" of the outcome based on the roll
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
    else: # Modifier for rolls above 20 (if we want to allow for bonuses)
        outcome_modifier = "A great success but not a natural 20. Things go very well."

    # 3. Construct the prompt
    system_prompt = f"""
    You are a Dungeon Master for a text-based RPG. 
    The player just attempted: "{state.user_input}"
    The dice roll result was: {dice_roll} ({outcome_modifier}).
    
    Based on this roll, describe what happens next in the story. 
    Keep the response under 200 words. Use a descriptive, immersive tone.
    """

    try:
        # 4. Call Gemini
        # We pass the history so the AI remembers previous turns
        chat = model.start_chat(history=state.history)
        response = chat.send_message(system_prompt)
        
        return {
            "story_text": response.text,
            "roll": dice_roll,
            "modifier": outcome_modifier
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)