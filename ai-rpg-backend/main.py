import os
import random
from typing import List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from google import genai
from google.genai import types
from supabase import create_client, Client # added for Supabase integration

# Load environment variables from .env file
load_dotenv()

# Initialize Supabase client
supabase = create_client(
    supabase_url=os.getenv("SUPABASE_URL"),
    supabase_key=os.getenv("SUPABASE_KEY")
)

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

    class Config:
        extra = "ignore" # Ignore any extra fields that might come from the frontend        

class GameState(BaseModel):
    user_input: str
    history: List[ChatMessage] = []
    # Added these to identify the user
    adventure_id: Optional[str] = None
    user_id: Optional[str] = None 
    guest_id: Optional[str] = None
    stats: Optional[dict] = None


class UserAuth(BaseModel):
    username: str
    password: str


# Helper to calculate D&D style modifiers: (Stat - 10) / 2
def get_modifier(score):
    return (score - 10) // 2


@app.post("/play")
async def play_turn(state: GameState):
    # For now, we'll use default stats. 
    # (Later, we will fetch these from Supabase based on adventure_id)
    stats = state.stats or {"strength": 14, "dexterity": 10, "intelligence": 12, "hp": 20, "level": 1}
    
    mod = 0
    stat_used = "None"
    input_lower = state.user_input.lower()

    if any(word in input_lower for word in ["hit", "kick", "break", "lift", "attack", "push", "pull", "fight"]):
        mod = get_modifier(stats["strength"])
        stat_used = "Strength"
    elif any(word in input_lower for word in ["dodge", "sneak", "steal", "run", "hide", "climb", "acrobat", "shoot", "aim", "use"]):
        mod = get_modifier(stats["dexterity"])
        stat_used = "Dexterity"
    elif any(word in input_lower for word in ["think", "read", "cast", "spell", "learn"]):
        mod = get_modifier(stats["intelligence"])
        stat_used = "Intelligence"

    # 3. Dice Logic (Kept from your version)
    dice_roll = random.randint(1, 20)
    total_roll = dice_roll + mod
    
    if total_roll == 1:
        outcome_modifier = "A critical failure. The worst possible outcome happens."
    elif 2 <= total_roll <= 5:
        outcome_modifier = "A poor outcome. Things go badly."
    elif 6 <= total_roll <= 14:
        outcome_modifier = "A mixed or standard outcome. Some success, some struggle."
    elif 15 <= total_roll <= 19:
        outcome_modifier = "A great success."
    elif dice_roll == 20: 
        outcome_modifier = "A critical success! A natural 20!"
    else:
        outcome_modifier = "An extraordinary success!"

    # 4. System Instructions (Your specific rules)
    system_instruction = f"""
    You are a professional Dungeon Master. 
    Player Just Attempted: "{state.user_input}"
    Roll: {dice_roll} + {mod} = {total_roll} ({outcome_modifier})
    
    Rules:
    - If the roll is low the outcome should be bad for the player, if the roll is high the outcome should be good for the player.
    - natural 1's (a roll of 1) are always a critical failure, and natural 20's (a roll of 20) are always a critical success, regardless of modifiers.
    - low rolls may lead to the player taking damage, failing a quest, or losing an item. High rolls may lead to defeating an enemy, successfully sneaking past a guard, or finding treasure.
    - Incorporate the dice roll result into the narrative.
    - Keep responses under 200 words.
    - Be immersive and descriptive.
    - Never break character.
    """

    try:
        # 5. Gemini Call
        contents = [types.Content(role=msg.role, parts=[types.Part.from_text(text=msg.text)]) for msg in state.history]
        contents.append(types.Content(role="user", parts=[types.Part.from_text(text=state.user_input)]))

        response = client.models.generate_content(
            model="gemini-2.5-flash", # Use 1.5-flash or 2.0-flash-exp
            contents=contents,
            config=types.GenerateContentConfig(system_instruction=system_instruction),
        )

        # 6. SAVE TO SUPABASE
        # We prepare the new history list
        new_history = [{"role": msg.role, "text": msg.text} for msg in state.history]
        new_history.append({"role": "user", "text": state.user_input})
        new_history.append({"role": "model", "text": response.text})

        # We update the 'adventures' table
        adventure_data = {
            "history": new_history,
            "stats": stats,
            "user_id": state.user_id,
            "guest_id": state.guest_id
        }

        # If we have an adventure_id, update that row. Otherwise, let Supabase create one.
        if state.adventure_id:
            supabase.table("adventures").update(adventure_data).eq("id", state.adventure_id).execute()
        else:
            # First time playing this session
            res = supabase.table("adventures").insert(adventure_data).execute()

        return {
            "story_text": response.text,
            "roll": dice_roll,
            "modifier": mod,
            "stat_used": stat_used,
            "total_roll": total_roll,
            "hp": stats["hp"]
        }
        
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

































'''
@app.post("/play")
async def play_turn(state: GameState):
    db = SessionLocal()

    char = db.query(Character).first() # For simplicity, we just use the first character in the DB

    if not char:
        char = Character(name="Adventurer", world_context="A fantasy world.")
        db.add(char)
        db.commit()
        db.refresh(char)

    mod = 0
    stat_used = "None"
    input_lower = state.user_input.lower()

    if any(word in input_lower for word in ["hit", "kick", "break", "lift", "attack", "push", "pull", "fight"]):
        mod = get_modifier(char.strength)
        stat_used = "Strength"
    elif any(word in input_lower for word in ["dodge", "sneak", "steal", "run", "hide", "climb", "acrobat", "shoot", "aim", "use"]):
        mod = get_modifier(char.dexterity)
        stat_used = "Dexterity"
    elif any(word in input_lower for word in ["think", "read", "cast", "spell", "learn"]):
        mod = get_modifier(char.intelligence)
        stat_used = "Intelligence"
    

    # 1. Roll the D20
    dice_roll = random.randint(1, 20)
    total_roll = dice_roll + mod
    
    # 2. Logic for the outcome
    if total_roll == 1:
        outcome_modifier = "A critical failure. The worst possible outcome happens."
    elif 2 <= total_roll <= 5:
        outcome_modifier = "A poor outcome. Things go badly for the player."
    elif 6 <= total_roll <= 14:
        outcome_modifier = "A mixed or standard outcome. Some success, some struggle."
    elif 15 <= total_roll <= 19:
        outcome_modifier = "A great success. Things go very well."
    elif dice_roll == 20: # 20
        outcome_modifier = "A critical success! A natural 20! The best possible outcome happens."
    else: # Modifier added more than 20
        outcome_modifier = "An extraordinary success! The player achieves something remarkable. But not a natural 20."
        
    # 3. System Instructions (This tells the AI how to behave)
    system_instruction = f"""
    You are a professional Dungeon Master for a text based RPG game. You create immersive narratives based on player actions and dice rolls. 
    Player Character: {char.name}
    Stats: Str {char.strength}, Dex {char.dexterity}, Int {char.intelligence}
    The player just attempted: "{state.user_input}"
    Stat used for this action: {stat_used} (+{mod} bonus)
    The player just rolled a {dice_roll} out of 20.
    Roll + Modifier = {dice_roll} + {mod} = {total_roll}
    The dice roll outcome is: {outcome_modifier}
    
    Current Hp: {char.hp}
    Current Level: {char.level}

    Rules:
    - If the roll is low the outcome should be bad for the player, if the roll is high the outcome should be good for the player.
    - natural 1's (a roll of 1) are always a critical failure, and natural 20's (a roll of 20) are always a critical success, regardless of modifiers.
    - low rolls may lead to the player taking damage, failing a quest, or losing an item. High rolls may lead to defeating an enemy, successfully sneaking past a guard, or finding treasure.
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
            model="gemini-2.5-flash", 
            contents=contents,
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                temperature=0.7,
            ),
        )

        # Convert Pydantic models to dicts
        existing_history = [
            {"role": msg.role, "text": msg.text}
            for msg in state.history
        ]

        new_history = existing_history + [
            {"role": "user", "text": state.user_input},
            {"role": "model", "text": response.text}
        ]
        char.history = new_history
        db.commit()


        return {
            "story_text": response.text,
            "roll": dice_roll,
            "modifier": mod,
            "stat_used": stat_used,
            "total_roll": total_roll,
            "hp": char.hp
        }
        
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    
'''