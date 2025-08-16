from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from .database import SessionLocal, engine
from . import models, schemas, crud

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/widgets/", response_model=list[schemas.Widget])
def list_widgets(db: Session = Depends(get_db)):
    return crud.get_widgets(db=db)

@app.post("/user/{user_id}/widgets/", response_model=schemas.UserWidget)
def add_widget(user_id: int, widget: schemas.UserWidgetBase, db: Session = Depends(get_db)):
    return crud.add_user_widget(db, user_id=user_id, widget=widget)

@app.get("/user/{user_id}/dashboard/", response_model=list[schemas.UserWidget])
def get_dashboard(user_id: int, db: Session = Depends(get_db)):
    return crud.get_user_dashboard(db, user_id=user_id)