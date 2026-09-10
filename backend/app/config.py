import warnings
from typing import List
from pydantic import Field, AliasChoices, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "RakshaNet"
    ENVIRONMENT: str = "development"
    API_V1_PREFIX: str = "/api/v1"

    # PostgreSQL + PostGIS Settings
    DATABASE_URL: str = "postgresql+asyncpg://raksha:rakshanet_secret@localhost:5432/rakshanet"

    @field_validator("DATABASE_URL", mode="before")
    @classmethod
    def format_database_url(cls, v: str) -> str:
        if isinstance(v, str):
            if v.startswith("postgres://"):
                return v.replace("postgres://", "postgresql+asyncpg://", 1)
            elif v.startswith("postgresql://") and not v.startswith("postgresql+asyncpg://"):
                return v.replace("postgresql://", "postgresql+asyncpg://", 1)
        return v

    # Neo4j Graph Database Settings
    NEO4J_URI: str = "bolt://localhost:7687"
    NEO4J_USER: str = Field(default="neo4j", validation_alias=AliasChoices("NEO4J_USER", "NEO4J_USERNAME"))
    NEO4J_PASSWORD: str = "rakshanet_secret"

    # Redis Cache & Pub/Sub Settings
    REDIS_URL: str = "redis://localhost:6379/0"

    # Security & Authentication
    JWT_SECRET: str = "rakshanet_super_secure_jwt_secret_key_2026"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

    # CORS Settings
    CORS_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    @property
    def cors_origin_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # Warn if using the default JWT secret in production
        if self.ENVIRONMENT == "production" and self.JWT_SECRET == "rakshanet_super_secure_jwt_secret_key_2026":
            warnings.warn(
                "⚠️ SECURITY WARNING: Using default JWT_SECRET in production! "
                "Set the JWT_SECRET environment variable to a cryptographically random value.",
                RuntimeWarning,
                stacklevel=2
            )


settings = Settings()
