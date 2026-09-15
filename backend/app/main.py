from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.users import router as user_router
from app.routes.company import router as company_router
from app.routes.customer import router as customer_router
from app.routes.ticket import router as ticket_router
from app.routes.comments import router as comment_router
from app.routes.history import router as history_router

app = FastAPI(title="AI SaaS Customer Support")


@app.get("/")
def root():
    return {"message": "AI Support SaaS API is running"}


app.include_router(user_router)
app.include_router(company_router)
app.include_router(customer_router)
app.include_router(ticket_router)
app.include_router(comment_router)
app.include_router(history_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)