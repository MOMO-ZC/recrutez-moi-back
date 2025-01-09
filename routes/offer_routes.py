from fastapi import APIRouter, HTTPException
from services.offer_service import get_all_offers, get_offer_by_id, create_offer, delete_offer, update_offer
from models import Offer, UpdateOffer

router = APIRouter()

@router.get("/offers/")
def get_offers():
    try:
        offers = get_all_offers()
        return {"offers": offers}
    except HTTPException as e:
        raise e

@router.get("/offers/{offer_id}")
def get_offer(offer_id: str):
    try:
        offer = get_offer_by_id(offer_id)
        return {"offer": offer}
    except HTTPException as e:
        raise e

@router.post("/offers/")
def create_new_offer(offer: Offer):
    try:
        created_offer = create_offer(offer)
        return {"message": "Offer created successfully", "user": created_offer}
    except HTTPException as e:
        raise e

@router.delete("/offers/{offer_id}")
def delete_offer_by_id(offer_id: str):
    try:
        delete_offer(offer_id)
        return {"message": f"Offer with id {offer_id} deleted successfully"}
    except HTTPException as e:
        raise e

@router.put("/offers/{offer_id}")
def update_offer_route(offer_id: str, offer_update: UpdateOffer):
    try:
        updated_offer = update_offer(offer_id, offer_update)  
        return {"message": "Offer updated successfully", "updated_offer": updated_offer}
    except HTTPException as e:
        raise e

