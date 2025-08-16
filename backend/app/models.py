from sqlalchemy import Column, Integer, String, Text, JSON, ForeignKey, TIMESTAMP
from sqlalchemy.orm import relationship, declarative_base

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(TIMESTAMP)

class Widget(Base):
    __tablename__ = "widgets"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    description = Column(Text)
    icon_url = Column(String(255))

class UserWidget(Base):
    __tablename__ = "user_widgets"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    widget_id = Column(Integer, ForeignKey("widgets.id"))
    position = Column(Integer, nullable=False)
    config = Column(JSON)
    created_at = Column(TIMESTAMP)

class WidgetData(Base):
    __tablename__ = "widget_data"
    id = Column(Integer, primary_key=True, index=True)
    user_widget_id = Column(Integer, ForeignKey("user_widgets.id"))
    data = Column(JSON)
    created_at = Column(TIMESTAMP)