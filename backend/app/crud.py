from sqlalchemy.orm import Session
from . import models, schemas
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = pwd_context.hash(user.password)
    db_user = models.User(
        name=user.name,
        email=user.email,
        password_hash=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_widgets(db: Session):
    return db.query(models.Widget).all()

def add_user_widget(db: Session, user_id: int, widget: schemas.UserWidgetBase):
    db_user_widget = models.UserWidget(
        user_id=user_id,
        widget_id=widget.widget_id,
        position=widget.position,
        config=widget.config
    )
    db.add(db_user_widget)
    db.commit()
    db.refresh(db_user_widget)
    return db_user_widget

def get_user_dashboard(db: Session, user_id: int):
    return db.query(models.UserWidget).filter(models.UserWidget.user_id == user_id).all()