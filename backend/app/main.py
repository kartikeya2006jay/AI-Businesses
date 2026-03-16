from fastapi import FastAPI
from app.api.chat_api import router as chat_router
from app.api.prediction_api import router as prediction_router
from app.api.alerts_api import router as alerts_router

app = FastAPI(
    title="Paytm AI Merchant Copilot",
    description="AI assistant for small business insights"
)

app.include_router(chat_router)
app.include_router(prediction_router)
app.include_router(alerts_router)