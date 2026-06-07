from fastapi import FastAPI, Depends, HTTPException, WebSocket, WebSocketDisconnect, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func
import json
from datetime import datetime

import models
import schemas
from database import engine, get_db

# Create tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Discord Clone API")

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============ CONNECTION MANAGEMENT ============
class ConnectionManager:
    def __init__(self):
        self.active_connections: dict = {}
        self.user_sockets: dict = {}

    async def connect(self, websocket: WebSocket, user_id: int):
        await websocket.accept()
        if user_id not in self.active_connections:
            self.active_connections[user_id] = []
        self.active_connections[user_id].append(websocket)
        self.user_sockets[websocket] = user_id

    def disconnect(self, websocket: WebSocket, user_id: int):
        self.active_connections[user_id].remove(websocket)
        if not self.active_connections[user_id]:
            del self.active_connections[user_id]
        del self.user_sockets[websocket]

    async def broadcast_to_user(self, user_id: int, message: dict):
        if user_id in self.active_connections:
            for connection in self.active_connections[user_id]:
                try:
                    await connection.send_json(message)
                except:
                    pass

    async def broadcast_to_all(self, message: dict):
        for connections in self.active_connections.values():
            for connection in connections:
                try:
                    await connection.send_json(message)
                except:
                    pass

manager = ConnectionManager()

# ============ USER ROUTES ============

@app.post("/api/users/register", response_model=schemas.User)
def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    db_user = models.User(username=user.username, email=user.email)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.post("/api/users/login", response_model=schemas.User)
def login_user(email: str, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == email).first()
    if not db_user:
        raise HTTPException(status_code=401, detail="User not found")
    return db_user

@app.get("/api/users/{user_id}", response_model=schemas.User)
def get_user(user_id: int, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user

@app.get("/api/users", response_model=list[schemas.User])
def list_users(db: Session = Depends(get_db)):
    return db.query(models.User).all()

@app.put("/api/users/{user_id}", response_model=schemas.User)
def update_user(user_id: int, user_update: schemas.UserUpdate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    if user_update.status:
        db_user.status = user_update.status
    if user_update.avatar_url:
        db_user.avatar_url = user_update.avatar_url

    db.commit()
    db.refresh(db_user)
    return db_user

# ============ FRIEND ROUTES ============

@app.post("/api/users/{user_id}/friends/{friend_id}")
def add_friend(user_id: int, friend_id: int, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    friend = db.query(models.User).filter(models.User.id == friend_id).first()

    if not user or not friend:
        raise HTTPException(status_code=404, detail="User not found")

    user.groups.append(friend)
    db.commit()
    return {"message": "Friend added successfully"}

@app.get("/api/users/{user_id}/friends", response_model=list[schemas.User])
def get_friends(user_id: int, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    # This is a simplified approach - in production, use proper friend relationship
    return db.query(models.User).filter(models.User.id != user_id).all()

# ============ DIRECT MESSAGE ROUTES ============

@app.post("/api/messages/direct", response_model=schemas.DirectMessage)
def send_direct_message(msg: schemas.DirectMessageCreate, db: Session = Depends(get_db)):
    db_msg = models.DirectMessage(
        sender_id=msg.sender_id if hasattr(msg, 'sender_id') else 1,
        recipient_id=msg.recipient_id,
        content=msg.content
    )
    db.add(db_msg)
    db.commit()
    db.refresh(db_msg)

    # Broadcast to recipient
    import asyncio
    asyncio.create_task(manager.broadcast_to_user(msg.recipient_id, {
        "type": "new_message",
        "message": db_msg.__dict__
    }))

    return db_msg

@app.get("/api/messages/direct/{user_id}/{friend_id}", response_model=list[schemas.DirectMessage])
def get_direct_messages(user_id: int, friend_id: int, db: Session = Depends(get_db)):
    messages = db.query(models.DirectMessage).filter(
        ((models.DirectMessage.sender_id == user_id) & (models.DirectMessage.recipient_id == friend_id)) |
        ((models.DirectMessage.sender_id == friend_id) & (models.DirectMessage.recipient_id == user_id))
    ).order_by(models.DirectMessage.created_at).all()
    return messages

# ============ GROUP ROUTES ============

@app.post("/api/groups", response_model=schemas.Group)
def create_group(group: schemas.GroupCreate, user_id: int = Query(...), db: Session = Depends(get_db)):
    db_group = models.Group(
        name=group.name,
        description=group.description,
        created_by=user_id
    )
    db.add(db_group)
    db.commit()
    db.refresh(db_group)
    return db_group

@app.get("/api/groups/{group_id}", response_model=schemas.Group)
def get_group(group_id: int, db: Session = Depends(get_db)):
    db_group = db.query(models.Group).filter(models.Group.id == group_id).first()
    if not db_group:
        raise HTTPException(status_code=404, detail="Group not found")
    return db_group

@app.post("/api/groups/{group_id}/members/{user_id}")
def add_group_member(group_id: int, user_id: int, db: Session = Depends(get_db)):
    group = db.query(models.Group).filter(models.Group.id == group_id).first()
    user = db.query(models.User).filter(models.User.id == user_id).first()

    if not group or not user:
        raise HTTPException(status_code=404, detail="Group or user not found")

    if user not in group.members:
        group.members.append(user)
        db.commit()

    return {"message": "User added to group"}

@app.get("/api/groups/{group_id}/members", response_model=list[schemas.User])
def get_group_members(group_id: int, db: Session = Depends(get_db)):
    group = db.query(models.Group).filter(models.Group.id == group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    return group.members

# ============ GROUP MESSAGE ROUTES ============

@app.post("/api/messages/group", response_model=schemas.GroupMessage)
def send_group_message(msg: schemas.GroupMessageCreate, sender_id: int = Query(...), db: Session = Depends(get_db)):
    db_msg = models.GroupMessage(
        group_id=msg.group_id,
        sender_id=sender_id,
        content=msg.content
    )
    db.add(db_msg)
    db.commit()
    db.refresh(db_msg)
    return db_msg

@app.get("/api/messages/group/{group_id}", response_model=list[schemas.GroupMessage])
def get_group_messages(group_id: int, db: Session = Depends(get_db)):
    messages = db.query(models.GroupMessage).filter(
        models.GroupMessage.group_id == group_id
    ).order_by(models.GroupMessage.created_at).all()
    return messages

# ============ CALL ROUTES ============

@app.post("/api/calls", response_model=schemas.Call)
def create_call(call: schemas.CallCreate, initiator_id: int = Query(...), db: Session = Depends(get_db)):
    db_call = models.Call(
        initiator_id=initiator_id,
        max_participants=call.max_participants
    )
    db.add(db_call)
    db.commit()
    db.refresh(db_call)
    return db_call

@app.get("/api/calls/{call_id}", response_model=schemas.Call)
def get_call(call_id: int, db: Session = Depends(get_db)):
    db_call = db.query(models.Call).filter(models.Call.id == call_id).first()
    if not db_call:
        raise HTTPException(status_code=404, detail="Call not found")
    return db_call

@app.post("/api/calls/{call_id}/join")
def join_call(call_id: int, user_id: int = Query(...), db: Session = Depends(get_db)):
    db_call = db.query(models.Call).filter(models.Call.id == call_id).first()
    user = db.query(models.User).filter(models.User.id == user_id).first()

    if not db_call or not user:
        raise HTTPException(status_code=404, detail="Call or user not found")

    if len(db_call.participants) >= db_call.max_participants:
        raise HTTPException(status_code=400, detail="Call is full")

    if user not in db_call.participants:
        db_call.participants.append(user)
        db.commit()

    return {"message": "Joined call successfully"}

@app.post("/api/calls/{call_id}/leave")
def leave_call(call_id: int, user_id: int = Query(...), db: Session = Depends(get_db)):
    db_call = db.query(models.Call).filter(models.Call.id == call_id).first()
    user = db.query(models.User).filter(models.User.id == user_id).first()

    if not db_call or not user:
        raise HTTPException(status_code=404, detail="Call or user not found")

    if user in db_call.participants:
        db_call.participants.remove(user)
        if not db_call.participants:
            db_call.is_active = False
        db.commit()

    return {"message": "Left call successfully"}

# ============ GAME VOTING ROUTES ============

@app.post("/api/games/vote", response_model=schemas.GameVote)
def vote_game(vote: schemas.GameVoteCreate, user_id: int = Query(...), db: Session = Depends(get_db)):
    db_vote = models.GameVote(
        game_name=vote.game_name,
        user_id=user_id
    )
    db.add(db_vote)
    db.commit()
    db.refresh(db_vote)
    return db_vote

@app.get("/api/games/top-votes", response_model=list[schemas.GameVoteResult])
def get_top_game_votes(db: Session = Depends(get_db)):
    results = db.query(
        models.GameVote.game_name,
        func.count(models.GameVote.id).label('vote_count')
    ).group_by(models.GameVote.game_name).order_by(func.count(models.GameVote.id).desc()).all()

    return [{"game_name": r[0], "vote_count": r[1]} for r in results]

# ============ WEBSOCKET ROUTES ============

@app.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: int, db: Session = Depends(get_db)):
    await manager.connect(websocket, user_id)
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if user:
        user.status = "online"
        db.commit()

    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)

            if message.get("type") == "message":
                await manager.broadcast_to_all({
                    "type": "user_message",
                    "user_id": user_id,
                    "content": message.get("content"),
                    "timestamp": datetime.utcnow().isoformat()
                })
            elif message.get("type") == "call_signal":
                await manager.broadcast_to_all({
                    "type": "call_signal",
                    "from": user_id,
                    "signal": message.get("signal")
                })
            elif message.get("type") == "screen_share":
                await manager.broadcast_to_all({
                    "type": "screen_share",
                    "user_id": user_id,
                    "action": message.get("action")
                })
    except WebSocketDisconnect:
        manager.disconnect(websocket, user_id)
        if user:
            user.status = "offline"
            db.commit()
        await manager.broadcast_to_all({
            "type": "user_offline",
            "user_id": user_id
        })

@app.get("/")
def read_root():
    return {"message": "Discord Clone API - Running on FastAPI"}
