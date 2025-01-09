from database import get_db_connection
from fastapi import HTTPException
from models import UpdateUser

def get_all_users():
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("SELECT * FROM users")
                users = cursor.fetchall()
                return users
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la récupération des utilisateurs : {str(e)}")

def get_user_by_id(user_id: str):
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("SELECT * FROM users WHERE id = %s", (user_id,))
                user = cursor.fetchone()
                if user:
                    return user
                else:
                    raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la récupération de l'utilisateur : {str(e)}")


def create_user(user):
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("""
                    INSERT INTO users (id, email, firstname, name, phone, password, birthdate, created_at, modified_at)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                """, (user.id, user.email, user.firstname, user.name, user.phone, user.password, user.birthdate, user.created_at, user.modified_at))
                conn.commit()

                return user
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error: {str(e)}")

def delete_user(user_id: str):
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("DELETE FROM users WHERE id = %s", (user_id,))
                conn.commit()

                if cursor.rowcount == 0:
                    raise HTTPException(status_code=404, detail="User not found")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error deleting user: {str(e)}")
    
def update_user(user_id: str, user_update: UpdateUser):
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cursor:
                # Vérifier si l'utilisateur existe
                cursor.execute("SELECT * FROM users WHERE id = %s", (user_id,))
                existing_user = cursor.fetchone()

                if not existing_user:
                    raise HTTPException(status_code=404, detail="User not found")

                cursor.execute("""
                    UPDATE users
                    SET email = %s,
                        firstname = %s,
                        name = %s,
                        phone = %s,
                        password = %s,
                        birthdate = %s,
                        modified_at = CURRENT_TIMESTAMP
                    WHERE id = %s
                    RETURNING id, email, firstname, name, phone, password, birthdate, modified_at
                """, (
                    user_update.email, 
                    user_update.firstname, 
                    user_update.name, 
                    user_update.phone, 
                    user_update.password, 
                    user_update.birthdate, 
                    user_id
                ))

                updated_user = cursor.fetchone()

                if updated_user:
                    return {
                        "id": updated_user["id"],
                        "email": updated_user["email"],
                        "firstname": updated_user["firstname"],
                        "name": updated_user["name"],
                        "phone": updated_user["phone"],
                        "password": updated_user["password"],
                        "birthdate": updated_user["birthdate"],
                        "modified_at": updated_user["modified_at"]
                    }
                else:
                    raise HTTPException(status_code=404, detail="User update failed")

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error updating user: {str(e)}")

def get_user_profile(user_id: str):
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("""
                    SELECT u.id, 
                               e.description AS Expérience, 
                               p.name AS Projets, 
                               f.diploma AS Diplomes, 
                               s.name AS Compétences, 
                               l.name AS Langues
                    FROM users u
                    JOIN experiences e ON u.id = e.id_user
                    JOIN skills s ON u.id = s.id
                    JOIN languages l on u.id = l.id
                    JOIN projets p on u.id = p.id_user
                    JOIN  formations f on u.id = f.id_user
                    WHERE u.id = %s
                """, (user_id,))
                user = cursor.fetchall() 

                if not user:
                    raise HTTPException(status_code=404, detail="User not found")

                return {"user_profile": user} 

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error fetching user profile: {str(e)}")

