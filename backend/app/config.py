from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # Secret values come from the .env file. Never put them in code.
    ai_provider: str = "anthropic"  # "anthropic" or "gemini"

    anthropic_api_key: str = ""
    anthropic_model: str = "claude-sonnet-5-5"

    gemini_api_key: str = ""
    gemini_model: str = "gemini-flash-lite-latest"

    secret_key: str = "change-me"
    database_url: str = "sqlite:///./daddy_is_don.db"
    frontend_url: str = "http://localhost:5173"

    model_config = SettingsConfigDict(env_file=".env")


settings = Settings()


