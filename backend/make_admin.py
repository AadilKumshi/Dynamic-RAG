from app.database.database import get_db
from app.database.models import User, UserRole

# Get database session
db = next(get_db())

# Find user by username
user = db.query(User).filter(User.username == "Aadil").first()

if user:
    user.role = UserRole.ADMIN
    db.commit()
    print(f"✅ User '{user.username}' has been granted admin privileges!")
    print(f"Role: {user.role}")
else:
    print("❌ User 'Aadil' not found in database")

db.close()
