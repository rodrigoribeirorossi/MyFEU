import json
import os
from dotenv import load_dotenv
from pathlib import Path

# carregar .env do backend automaticamente ANTES de importar módulos que leem env vars
env_path = Path(__file__).parent.parent / ".env"
if env_path.exists():
    load_dotenv(env_path)
    print(f".env carregado de: {env_path}")
else:
    print(".env não encontrado — variáveis de ambiente podem não estar definidas")

from fastapi import FastAPI, HTTPException, Depends
from typing import List
from sqlalchemy.orm import Session
# agora importar módulos internos (futebol irá ler o token corretamente)
from . import futebol
from . import crud, models, schemas
from .database import SessionLocal, engine

# carregar .env do backend automaticamente
# env_path = Path(__file__).parent.parent / ".env"
# if env_path.exists():
#     load_dotenv(env_path)

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# Incluindo o router do futebol
app.include_router(futebol.router)

# Middleware para CORS
from fastapi.middleware.cors import CORSMiddleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Em produção, defina os domínios permitidos
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Carregar catálogo de widgets
def get_widgets_catalog():
    try:
        # Obter o caminho absoluto usando pathlib
        current_dir = Path(__file__).parent
        catalog_path = current_dir / "widgets_catalog.json"
        
        print(f"Tentando abrir arquivo: {catalog_path}")
        
        # Adicione o parâmetro encoding="utf-8"
        with open(catalog_path, "r", encoding="utf-8") as f:
            data = json.load(f)
            print(f"Catálogo carregado com sucesso: {len(data)} widgets")
            return data
    except Exception as e:
        print(f"Erro ao carregar catálogo: {e}")
        # Retornar widgets padrão em caso de erro
        return [
            {
                "id": 1,
                "name": "Notícias",
                "description": "Últimas notícias",
                "icon": "📝"
            },
            {
                "id": 2,
                "name": "Lista de Compras",
                "description": "Organize suas compras",
                "icon": "🎁"
            }
        ]

@app.get("/widgets/", response_model=List[dict])
def read_widgets():
    return get_widgets_catalog()

@app.get("/user/{user_id}/dashboard/", response_model=List[dict])
def read_user_dashboard(user_id: int, db: Session = Depends(get_db)):
    # Implementação temporária - retornar widgets vazios
    return []

@app.post("/user/{user_id}/widgets/", response_model=dict)
def add_widget_to_user(user_id: int, widget: dict, db: Session = Depends(get_db)):
    # Implementação temporária - retornar o widget enviado
    widget["id"] = 1  # Simula um ID gerado
    return widget