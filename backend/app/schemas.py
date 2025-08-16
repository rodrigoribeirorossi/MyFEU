from pydantic import BaseModel
from typing import Optional, List, Dict

class UserBase(BaseModel):
    name: str
    email: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    class Config:
        orm_mode = True

class WidgetBase(BaseModel):
    name: str
    description: Optional[str]
    icon_url: Optional[str]

class Widget(WidgetBase):
    id: int
    class Config:
        orm_mode = True

class UserWidgetBase(BaseModel):
    widget_id: int
    position: int
    config: Dict

class UserWidget(UserWidgetBase):
    id: int
    user_id: int
    class Config:
        orm_mode = True

class WidgetDataBase(BaseModel):
    data: Dict

class WidgetData(WidgetDataBase):
    id: int
    user_widget_id: int
    class Config:
        orm_mode = True