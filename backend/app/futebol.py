import os
import time
import asyncio
import logging
from typing import Dict, List, Optional, Any, Tuple

import httpx  # type: ignore
from fastapi import APIRouter, HTTPException, BackgroundTasks, Query
from pydantic import BaseModel
from datetime import datetime, timezone
import unicodedata

# ------------------------------------------------------------------------------
# Config & Logging
# ------------------------------------------------------------------------------

# Configure more detailed logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger("futebol_api")
logger.setLevel(logging.INFO)

router = APIRouter(prefix="/api/futebol", tags=["futebol"])

FOOTBALL_DATA_BASE_URL = os.getenv("FOOTBALL_DATA_BASE_URL", "https://api.football-data.org/v4")
FOOTBALL_DATA_API_TOKEN = os.getenv("FOOTBALL_DATA_API_TOKEN", "").strip()
# Brasileirão Série A (BSA) competition ID on Football-Data.org
COMPETITION_ID = int(os.getenv("FOOTBALL_DATA_COMPETITION_ID", "2013"))
DEFAULT_LIMIT = int(os.getenv("FOOTBALL_DATA_DEFAULT_LIMIT", "5"))
CACHE_TTL_SECONDS = int(os.getenv("FOOTBALL_DATA_CACHE_TTL", "180"))  # 3 min para dados dinâmicos

if not FOOTBALL_DATA_API_TOKEN:
    logger.warning(
        "FOOTBALL_DATA_API_TOKEN não definido no ambiente. "
        "Defina para evitar erros de autenticação (X-Auth-Token)."
    )

# ------------------------------------------------------------------------------
# Modelos Pydantic (compatíveis com seu app atual)
# ------------------------------------------------------------------------------

class Time(BaseModel):
    id: int
    nome_popular: str
    escudo: str
    slug: str

class Estadio(BaseModel):
    nome_popular: str

class Campeonato(BaseModel):
    nome: str

class Partida(BaseModel):
    id: str
    time_mandante: Time
    time_visitante: Time
    placar_mandante_final: Optional[int] = None
    placar_visitante_final: Optional[int] = None
    data_realizacao: str  # YYYY-MM-DD (UTC)
    hora_realizacao: str  # HH:MM:SS (UTC)
    estadio: Estadio
    campeonato: Campeonato

# ------------------------------------------------------------------------------
# Utilitários
# ------------------------------------------------------------------------------

PLACEHOLDER_CREST = "https://via.placeholder.com/80x80.png?text=badge"

def map_fd_team_to_time(team: Dict[str, Any]) -> Time:
    # campos mínimos esperados: id + (name or shortName)
    if not team or not team.get("id"):
        # gerar um objeto fallback mínimo para evitar quebra na UI
        return Time(id=0, nome_popular=str(team or ""), escudo=PLACEHOLDER_CREST, slug=slugify(str(team or "")))
    name = team.get("name") or team.get("shortName") or team.get("tla") or f"Time {team.get('id')}"
    crest = team.get("crest") or team.get("logo") or PLACEHOLDER_CREST
    return Time(
        id=team.get("id"),
        nome_popular=name,
        escudo=crest,
        slug=slugify(name)
    )

def map_fd_match_to_partida(match: Dict[str, Any]) -> Optional[Partida]:
    # Valida campos obrigatórios mínimos
    if not match or not match.get("id") or not match.get("utcDate") or not match.get("status"):
        logger.warning(f"Partida ignorada por dados insuficientes: {match.get('id') if match else 'None'}")
        return None

    comp = match.get("competition") or {}
    home = match.get("homeTeam") or {}
    away = match.get("awayTeam") or {}
    score_full = (match.get("score") or {}).get("fullTime") or {}
    status = match.get("status")

    date_str, time_str = iso_to_date_time_strings(match.get("utcDate", ""))

    time_mandante = map_fd_team_to_time(home)
    time_visitante = map_fd_team_to_time(away)

    estadio = Estadio(nome_popular="")  # API /matches não fornece estádio consistentemente
    campeonato = Campeonato(nome=comp.get("name") or "")

    # Placar e winner
    mand_goals = score_full.get("home")
    visit_goals = score_full.get("away")

    # Para jogos agendados/timed, marcadores ficam None e winner "unknown"
    return Partida(
        id=str(match.get("id")),
        time_mandante=time_mandante,
        time_visitante=time_visitante,
        placar_mandante_final=(mand_goals if mand_goals is not None else None),
        placar_visitante_final=(visit_goals if visit_goals is not None else None),
        data_realizacao=date_str,
        hora_realizacao=time_str,
        estadio=estadio,
        campeonato=campeonato,
    )

def slugify(text: str) -> str:
    if not text:
        return ""
    text = unicodedata.normalize("NFKD", text)
    text = "".join([c for c in text if not unicodedata.combining(c)])
    text = text.lower().strip()
    out = []
    prev_dash = False
    for ch in text:
        if ch.isalnum():
            out.append(ch)
            prev_dash = False
        elif ch in (" ", "_", "-", "/"):
            if not prev_dash:
                out.append("-")
                prev_dash = True
        # ignora outros caracteres
    s = "".join(out).strip("-")
    return s

def iso_to_date_time_strings(iso_utc: str) -> Tuple[str, str]:
    """
    Converte 2025-08-31T00:00:00Z para ('2025-08-31', '00:00:00') em UTC.
    """
    if not iso_utc:
        return "", ""
    try:
        dt = datetime.fromisoformat(iso_utc.replace("Z", "+00:00")).astimezone(timezone.utc)
        return dt.date().isoformat(), dt.time().replace(microsecond=0).isoformat()
    except Exception:
        # fallback: tenta separar by 'T'
        if "T" in iso_utc:
            date_part, time_part = iso_utc.split("T", 1)
            time_part = time_part.replace("Z", "").split("+")[0].split(".")[0]
            if len(time_part) == 5:
                time_part += ":00"
            return date_part, time_part
        return iso_utc, ""

# ------------------------------------------------------------------------------
# Cache simples com TTL (segundos)
# ------------------------------------------------------------------------------

class CacheManager:
    def __init__(self, ttl_seconds: int = CACHE_TTL_SECONDS):
        self.cache: Dict[str, Tuple[Any, float]] = {}
        self.ttl = ttl_seconds

    def get(self, key: str):
        if key in self.cache:
            data, ts = self.cache[key]
            if time.time() - ts < self.ttl:
                return data
        return None

    def set(self, key: str, value: Any):
        self.cache[key] = (value, time.time())

    def delete(self, key: str):
        self.cache.pop(key, None)

    def clear(self):
        self.cache.clear()

cache = CacheManager()

# ------------------------------------------------------------------------------
# Cliente Football-Data.org (assíncrono)
# ------------------------------------------------------------------------------

class FootballDataClient:
    def __init__(self, base_url: str, token: str):
        self.base_url = base_url.rstrip("/")
        self.token = token

    def _headers(self) -> Dict[str, str]:
        if not self.token:
            # Permitimos seguir (útil para ambientes de teste), mas próximas chamadas 401/403
            logger.warning("Chamando Football-Data.org sem token definido.")
        return {
            "X-Auth-Token": self.token,
            "Accept": "application/json",
            "User-Agent": "FutebolApp/1.0 (+https://example.com)"
        }

    async def get(self, path: str, params: Optional[Dict[str, Any]] = None) -> Any:
        url = f"{self.base_url}{path}"
        async with httpx.AsyncClient(timeout=15.0, headers=self._headers(), follow_redirects=True) as client:
            try:
                resp = await client.get(url, params=params)
                if resp.status_code == 429:
                    raise HTTPException(status_code=429, detail="Rate limit atingido na Football-Data.org")
                if resp.status_code == 403:
                    raise HTTPException(status_code=403, detail="Recurso restrito ao seu plano na Football-Data.org")
                if resp.status_code == 404:
                    raise HTTPException(status_code=404, detail="Recurso não encontrado na Football-Data.org")
                resp.raise_for_status()
                return resp.json()
            except httpx.HTTPError as e:
                logger.error(f"Erro HTTP ao chamar {url}: {e}")
                raise HTTPException(status_code=502, detail=f"Falha ao consultar Football-Data.org: {str(e)}")

fd_client = FootballDataClient(FOOTBALL_DATA_BASE_URL, FOOTBALL_DATA_API_TOKEN)

# ------------------------------------------------------------------------------
# Mapeamento Football-Data -> modelos do app
# ------------------------------------------------------------------------------

def map_fd_team_to_time(team: Dict[str, Any]) -> Time:
    return Time(
        id=team.get("id"),
        nome_popular=team.get("name") or team.get("shortName") or str(team.get("id")),
        escudo=team.get("crest") or "",
        slug=slugify(team.get("name") or team.get("shortName") or str(team.get("id")))
    )

def map_fd_match_to_partida(match: Dict[str, Any]) -> Partida:
    comp = match.get("competition") or {}
    home = match.get("homeTeam") or {}
    away = match.get("awayTeam") or {}
    score = (match.get("score") or {}).get("fullTime") or {}

    date_str, time_str = iso_to_date_time_strings(match.get("utcDate", ""))

    time_mandante = map_fd_team_to_time(home)
    time_visitante = map_fd_team_to_time(away)

    # Alguns campos não existem na Football-Data.org, então definimos padrões:
    estadio = Estadio(nome_popular="")  # A API não fornece estádio no endpoint de partidas
    campeonato = Campeonato(nome=comp.get("name") or "")

    return Partida(
        id=str(match.get("id")),
        time_mandante=time_mandante,
        time_visitante=time_visitante,
        placar_mandante_final=score.get("home"),
        placar_visitante_final=score.get("away"),
        data_realizacao=date_str,
        hora_realizacao=time_str,
        estadio=estadio,
        campeonato=campeonato,
    )

# ------------------------------------------------------------------------------
# Endpoints
# ------------------------------------------------------------------------------

@router.get("/times/", response_model=List[Time])
async def listar_times():
    """
    Lista os times da competição configurada (por padrão BSA=2013).
    """
    cache_key = f"teams_{COMPETITION_ID}"
    cached = cache.get(cache_key)
    if cached:
        return cached

    data = await fd_client.get(f"/competitions/{COMPETITION_ID}/teams")
    teams = data.get("teams", [])
    times = [map_fd_team_to_time(t) for t in teams]

    cache.set(cache_key, times)
    return times

@router.get("/times/{time_id}/partidas/ultimas", response_model=List[Partida])
async def ultimas_partidas(
    time_id: int,
    background_tasks: BackgroundTasks,
    limit: int = Query(DEFAULT_LIMIT, ge=1, le=50),
):
    """
    Retorna a última partida finalizada de um time (status=FINISHED) — apenas a mais recente.
    """
    cache_key = f"matches_{time_id}_ultimas"
    cached = cache.get(cache_key)
    if cached is not None:
        return cached

    params = {"status": "FINISHED", "limit": limit}
    try:
        data = await fd_client.get(f"/teams/{time_id}/matches", params=params)
    except HTTPException as e:
        if e.status_code in (403, 404):
            logger.info(f"/teams/{time_id}/matches status=FINISHED restrito/indisponível: {e.detail}")
            cache.set(cache_key, [])
            return []
        raise

    matches = data.get("matches", []) or []
    if not matches:
        cache.set(cache_key, [])
        return []

    # escolher a partida mais recente (maior utcDate)
    def _utc(m):
        try:
            return datetime.fromisoformat(m.get("utcDate", "").replace("Z", "+00:00"))
        except Exception:
            return datetime.min.replace(tzinfo=timezone.utc)
    chosen = max(matches, key=_utc)
    partida = map_fd_match_to_partida(chosen)
    result = [p for p in (partida,) if p]
    cache.set(cache_key, result)
    return result

@router.get("/times/{time_id}/partidas/proximas", response_model=List[Partida])
async def proximas_partidas(
    time_id: int,
    background_tasks: BackgroundTasks,
    limit: int = Query(DEFAULT_LIMIT, ge=1, le=50),
):
    """
    Retorna a próxima partida agendada de um time (status=SCHEDULED) — apenas a mais próxima.
    """
    cache_key = f"matches_{time_id}_proximas"
    cached = cache.get(cache_key)
    if cached is not None:
        return cached

    try:
        data = await fd_client.get(f"/teams/{time_id}/matches", params={"status": "SCHEDULED", "limit": limit})
    except HTTPException as e:
        if e.status_code in (403, 404):
            logger.info(f"/teams/{time_id}/matches status=SCHEDULED restrito/indisponível: {e.detail}")
            cache.set(cache_key, [])
            return []
        raise

    matches = data.get("matches", []) or []
    if not matches:
        cache.set(cache_key, [])
        return []

    # filtrar por datas válidas no futuro e escolher a mais próxima (menor utcDate >= now)
    now = datetime.now(timezone.utc)
    def _utc_or_none(m):
        try:
            return datetime.fromisoformat(m.get("utcDate", "").replace("Z", "+00:00"))
        except Exception:
            return None

    future_matches = []
    for m in matches:
        dt = _utc_or_none(m)
        if dt and dt >= now:
            future_matches.append((dt, m))
    if not future_matches:
        # se não houver partidas futuras válidas, tentar usar a menor utcDate disponível
        chosen_match = min(matches, key=lambda m: _utc_or_none(m) or datetime.max.replace(tzinfo=timezone.utc))
    else:
        chosen_match = min(future_matches, key=lambda t_m: t_m[0])[1]

    partida = map_fd_match_to_partida(chosen_match)
    result = [p for p in (partida,) if p]
    cache.set(cache_key, result)
    return result

@router.post("/times/{time_id}/refresh", status_code=202)
async def refresh_team_data(time_id: int, background_tasks: BackgroundTasks):
    """
    Limpa o cache de partidas (últimas e próximas) de um time.
    """
    cache.delete(f"matches_{time_id}_ultimas")
    cache.delete(f"matches_{time_id}_proximas")
    return {"message": f"Atualização de dados para o time {time_id} agendada (cache limpo)."}

@router.delete("/cache/clear", status_code=200)
async def clear_cache():
    """
    Limpa todo o cache.
    """
    cache.clear()
    return {"message": "Cache limpo com sucesso"}

@router.get("/cache/clear/times/{time_id}", status_code=200)
async def clear_team_cache(time_id: int):
    """
    Limpa o cache de um time específico.
    """
    k1 = f"matches_{time_id}_ultimas"
    k2 = f"matches_{time_id}_proximas"
    existed = (cache.get(k1) is not None) or (cache.get(k2) is not None)
    cache.delete(k1)
    cache.delete(k2)
    if existed:
        return {"message": f"Cache do time ID {time_id} limpo com sucesso"}
    return {"message": f"Cache do time ID {time_id} não encontrado"}

# ------------------------------------------------------------------------------
# Opcional: Endpoints por competição (úteis para telas gerais)
# ------------------------------------------------------------------------------

@router.get("/competicoes/{competition_id}/partidas/ultimas", response_model=List[Partida])
async def ultimas_partidas_competicao(
    competition_id: int,
    limit: int = Query(DEFAULT_LIMIT, ge=1, le=100),
):
    """
    Últimas partidas finalizadas da competição.
    """
    cache_key = f"comp_{competition_id}_finished"
    cached = cache.get(cache_key)
    if cached:
        return cached

    data = await fd_client.get(f"/competitions/{competition_id}/matches", params={"status": "FINISHED", "limit": limit})
    partidas = [map_fd_match_to_partida(m) for m in data.get("matches", [])]
    cache.set(cache_key, partidas)
    return partidas

@router.get("/competicoes/{competition_id}/partidas/proximas", response_model=List[Partida])
async def proximas_partidas_competicao(
    competition_id: int,
    limit: int = Query(DEFAULT_LIMIT, ge=1, le=100),
):
    """
    Próximas partidas da competição (pode ser restrito ao plano).
    """
    cache_key = f"comp_{competition_id}_scheduled"
    cached = cache.get(cache_key)
    if cached:
        return cached

    partidas: List[Partida] = []
    for status in ("SCHEDULED", "TIMED"):
        try:
            data = await fd_client.get(
                f"/competitions/{competition_id}/matches", params={"status": status, "limit": limit}
            )
            partidas.extend([map_fd_match_to_partida(m) for m in data.get("matches", [])])
        except HTTPException as e:
            if e.status_code in (403, 404):
                logger.info(f"/competitions/{competition_id}/matches status={status} restrito/indisponível: {e.detail}")
                continue
            raise
    # Ordena
    partidas = sorted(partidas, key=lambda p: f"{p.data_realizacao}T{p.hora_realizacao}")[:limit]
    cache.set(cache_key, partidas)
    return partidas

# Adicionar um middleware para logar detalhes das requisições
#@router.middleware("http")
#async def log_requests(request, call_next):
#    client = request.client.host
#    path = request.url.path
#    query = request.url.query
#    
#    logger.info(f"REQUEST: {client} - {request.method} {path}?{query}")
#    
#    # Processar a requisição e capturar o tempo
#    start_time = time.time()
#    response = await call_next(request)
#    process_time = time.time() - start_time
#    
#    logger.info(f"RESPONSE: {client} - {request.method} {path} - Status: {response.status_code} - Tempo: {process_time:.3f}s")
#    return response

# ------------------------------------------------------------------------------
# Notas:
# - Configure FOOTBALL_DATA_API_TOKEN no ambiente.
# - COMPETITION_ID padrão = 2013 (BSA). Ajuste via FOOTBALL_DATA_COMPETITION_ID se necessário.
# - Alguns recursos (especialmente SCHEDULED/TIMED) podem exigir plano pago.
# - Os horários são retornados em UTC. Converta no frontend conforme fuso do usuário.
# - O campo 'estadio' não é fornecido por esse endpoint; mantemos string vazia para compatibilidade.
# ------------------------------------------------------------------------------

