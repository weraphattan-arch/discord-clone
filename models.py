from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean, Table, Float
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

# Association tables for many-to-many relationships
friendship = Table(
    'friendship',
    Base.metadata,
    Column('user_id', Integer, ForeignKey('user.id'), primary_key=True),
    Column('friend_id', Integer, ForeignKey('user.id'), primary_key=True)
)

group_members = Table(
    'group_members',
    Base.metadata,
    Column('group_id', Integer, ForeignKey('group.id'), primary_key=True),
    Column('user_id', Integer, ForeignKey('user.id'), primary_key=True)
)

call_participants = Table(
    'call_participants',
    Base.metadata,
    Column('call_id', Integer, ForeignKey('call.id'), primary_key=True),
    Column('user_id', Integer, ForeignKey('user.id'), primary_key=True)
)

class User(Base):
    __tablename__ = "user"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    google_id = Column(String, unique=True, nullable=True)
    avatar_url = Column(String, nullable=True)
    status = Column(String, default="offline")  # online, offline, in_call
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    direct_messages = relationship("DirectMessage", foreign_keys="DirectMessage.sender_id")
    group_messages = relationship("GroupMessage", foreign_keys="GroupMessage.sender_id")
    groups = relationship("Group", secondary=group_members, back_populates="members")
    calls = relationship("Call", secondary=call_participants, back_populates="participants")
    game_votes = relationship("GameVote", back_populates="user")

class DirectMessage(Base):
    __tablename__ = "direct_message"

    id = Column(Integer, primary_key=True, index=True)
    sender_id = Column(Integer, ForeignKey("user.id"))
    recipient_id = Column(Integer, ForeignKey("user.id"))
    content = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    sender = relationship("User", foreign_keys=[sender_id], backref="sent_messages")
    recipient = relationship("User", foreign_keys=[recipient_id], backref="received_messages")

class Group(Base):
    __tablename__ = "group"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(Text, nullable=True)
    created_by = Column(Integer, ForeignKey("user.id"))
    created_at = Column(DateTime, default=datetime.utcnow)

    members = relationship("User", secondary=group_members, back_populates="groups")
    messages = relationship("GroupMessage", back_populates="group", cascade="all, delete-orphan")

class GroupMessage(Base):
    __tablename__ = "group_message"

    id = Column(Integer, primary_key=True, index=True)
    group_id = Column(Integer, ForeignKey("group.id"))
    sender_id = Column(Integer, ForeignKey("user.id"))
    content = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    group = relationship("Group", back_populates="messages")
    sender = relationship("User", foreign_keys=[sender_id], backref="group_messages_sent")

class Call(Base):
    __tablename__ = "call"

    id = Column(Integer, primary_key=True, index=True)
    initiator_id = Column(Integer, ForeignKey("user.id"))
    started_at = Column(DateTime, default=datetime.utcnow)
    ended_at = Column(DateTime, nullable=True)
    max_participants = Column(Integer, default=30)
    is_active = Column(Boolean, default=True)

    participants = relationship("User", secondary=call_participants, back_populates="calls")
    initiator = relationship("User", foreign_keys=[initiator_id], backref="initiated_calls")

class GameVote(Base):
    __tablename__ = "game_vote"

    id = Column(Integer, primary_key=True, index=True)
    game_name = Column(String, index=True)
    user_id = Column(Integer, ForeignKey("user.id"))
    voted_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="game_votes")
