from pydantic import BaseModel

class User(BaseModel):
    id: str
    email: str
    firstname: str
    name: str
    phone: str
    password: str
    birthdate: str
    created_at: str
    modified_at: str

class Offer(BaseModel):
    id: str
    id_entreprise: str
    title: str
    body: str
    salary: str
    remote: str
    status: str
    created_at: str
    modified_at: str

class UpdateUser(BaseModel):
    email: str
    firstname: str
    name: str
    phone: str
    password: str
    birthdate: str

class UpdateOffer(BaseModel):
    title: str  
    body: str  
    salary: str
    remote: str 
    status: str 