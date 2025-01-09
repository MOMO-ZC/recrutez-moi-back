from database import get_db_connection
from fastapi import HTTPException
from models import UpdateOffer

def get_all_offers():
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("SELECT * FROM job_offers")
                users = cursor.fetchall()
                return users
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la récupération des offres : {str(e)}")
    
def get_offer_by_id(offer_id: str):
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("SELECT * FROM job_offers WHERE id = %s", (offer_id,))
                offer = cursor.fetchone()
                if offer:
                    return offer
                else:
                    raise HTTPException(status_code=404, detail="Offre non trouvé")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la récupération de l'offre : {str(e)}")


def create_offer(offer):
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("""
                    INSERT INTO job_offers (id, id_entreprise, title, body, salary, remote, status, created_at, modified_at)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                """, (offer.id, offer.id_entreprise, offer.title, offer.body, offer.salary, offer.remote, offer.status, offer.created_at, offer.modified_at))
                conn.commit()

                return offer
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error: {str(e)}")

def delete_offer(offer_id: str):
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("DELETE FROM job_offers WHERE id = %s", (offer_id,))
                conn.commit()

                if cursor.rowcount == 0:
                    raise HTTPException(status_code=404, detail="Offer not found")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error deleting offer: {str(e)}")

def update_offer(offer_id: str, offer_update: UpdateOffer):
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("SELECT * FROM job_offers WHERE id = %s", (offer_id,))
                existing_offer = cursor.fetchone()

                if not existing_offer:
                    raise HTTPException(status_code=404, detail="Job offer not found")

                cursor.execute("""
                    UPDATE job_offers
                    SET title = %s,
                        body = %s,
                        salary = %s,
                        remote = %s,
                        status = %s,
                        modified_at = CURRENT_TIMESTAMP
                    WHERE id = %s
                    RETURNING id, title, body, salary, remote, status, modified_at
                """, (
                    offer_update.title, 
                    offer_update.body, 
                    offer_update.salary, 
                    offer_update.remote, 
                    offer_update.status, 
                    offer_id
                ))

                updated_offer = cursor.fetchone()

                if updated_offer:
                    return {
                        "id": updated_offer['id'],
                        "title": updated_offer['title'],
                        "body": updated_offer['body'],
                        "salary": updated_offer['salary'],
                        "remote": updated_offer['remote'],
                        "status": updated_offer['status'],
                        "modified_at": updated_offer['modified_at']
                    }
                else:
                    raise HTTPException(status_code=404, detail="Offer not found or not updated.")

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error updating job offer: {str(e)}")
