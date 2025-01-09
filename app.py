from fastapi import FastAPI
from routes import user_routes
from routes import offer_routes

app = FastAPI()

app.include_router(user_routes.router)
app.include_router(offer_routes.router)

