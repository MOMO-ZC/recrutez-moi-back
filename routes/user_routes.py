from fastapi import APIRouter, HTTPException
from services.user_service import get_all_users, get_user_by_id, create_user, delete_user, update_user, get_user_profile
from models import User, UpdateUser

router = APIRouter()

@router.get("/users/")
def get_users():
    try:
        users = get_all_users()
        return {"users": users}
    except HTTPException as e:
        raise e

@router.get("/users/{user_id}")
def get_user(user_id: str):
    try:
        user = get_user_by_id(user_id)
        return {"user": user}
    except HTTPException as e:
        raise e

@router.get("/users/profile/{user_id}")
def get_user_profile_route(user_id: str):
    try:
        user_profile = get_user_profile(user_id)
        return {"user_profile": user_profile}
    except HTTPException as e:
        raise e

@router.post("/users/")
def create_new_user(user: User):
    try:
        created_user = create_user(user)
        return {"message": "User created successfully", "user": created_user}
    except HTTPException as e:
        raise e

@router.delete("/users/{user_id}")
def delete_user_by_id(user_id: str):
    try:
        delete_user(user_id)
        return {"message": f"User with id {user_id} deleted successfully"}
    except HTTPException as e:
        raise e

@router.put("/users/{user_id}")
def update_user_route(user_id: str, user_update: UpdateUser):
    try:
        updated_user = update_user(user_id, user_update) 
        return {"message": "User updated successfully", "updated_user": updated_user}
    except HTTPException as e:
        raise e