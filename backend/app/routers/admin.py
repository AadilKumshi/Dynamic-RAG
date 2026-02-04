from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.orm import Session
from app.database import models, database, schemas
from app.security import Oauth2
from app.rag.storage import delete_assistant_data
from typing import List
import os
import shutil



router = APIRouter(prefix="/admin", tags=["Admin"]) 

@router.get("/users", response_model=List[schemas.UserOut])
def get_all_users(db: Session = Depends(database.get_db), 
                  current_user: models.User = Depends(Oauth2.get_admin_user)):
    users = db.query(models.User).all()
    return users

@router.delete("/user/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(user_id: int, db: Session = Depends(database.get_db),   
                current_user: models.User = Depends(Oauth2.get_admin_user)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    db.delete(user)
    db.commit()
    return

@router.delete("/assistant/{assistant_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_assistant(assistant_id: int, db: Session = Depends(database.get_db),   
                current_user: models.User = Depends(Oauth2.get_admin_user)):
    assistant = db.query(models.Assistant).filter(models.Assistant.id == assistant_id).first()
    if not assistant:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assistant not found")
    
    # Clean up cloud storage
    delete_assistant_data(str(assistant_id))
    
    # Clean up local temp files
    local_path = os.path.join("temp_rag_data", str(assistant_id))
    if os.path.exists(local_path):
        shutil.rmtree(local_path)
    
    db.delete(assistant)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)

@router.post("/grant-admin/{user_id}", status_code=status.HTTP_200_OK)
def grant_admin_privileges(user_id: int, db: Session = Depends(database.get_db),
                           current_user: models.User = Depends(Oauth2.get_admin_user)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    if user.role == models.UserRole.ADMIN:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User is already an admin")
    
    user.role = models.UserRole.ADMIN
    db.commit()
    return {"message": f"User '{user.username}' has been granted admin privileges"}