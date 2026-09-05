from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List
import os

class Settings(BaseSettings):
    # App
    PROJECT_NAME: str = "RakshaNet"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    DEBUG: bool = True
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    CORS_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173"

    # PostgreSQL + PostGIS
    POSTGRES_USER: str = "rakshanet"
    POSTGRES_PASSWORD: str = "rakshanet_secret"
    POSTGRES_HOST: str = "localhost"
    POSTGRES_PORT: int = 5432
    POSTGRES_DB: str = "rakshanet_db"
    DATABASE_URL: str = "postgresql+asyncpg://rakshanet:rakshanet_secret@localhost:5432/rakshanet_db"
    SYNC_DATABASE_URL: str = "postgresql://rakshanet:rakshanet_secret@localhost:5432/rakshanet_db"

    # Neo4j Graph DB
    NEO4J_URI: str = "bolt://localhost:7687"
    NEO4J_USER: str = "neo4j"
    NEO4J_PASSWORD: str = "rakshanet_secret"

    # Redis
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_URL: str = "redis://localhost:6379/0"

    # Risk Fusion Tunable Weights
    GRAPH_WEIGHT: float = 0.6
    GEO_WEIGHT: float = 0.4

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

settings = Settings()
