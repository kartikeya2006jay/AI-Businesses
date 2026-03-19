from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
import pandas as pd
import os
from app.models.user_model import User, UserCreate, UserInDB, Token
from app.utils.auth_utils import (
    verify_password,
    get_password_hash,
    create_access_token,
    SECRET_KEY,
    ALGORITHM
)

router = APIRouter(prefix="/auth", tags=["auth"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

USERS_FILE = "data/users.csv"

def get_users_df():
    if not os.path.exists(USERS_FILE):
        return pd.DataFrame(columns=["username", "email", "hashed_password", "full_name", "disabled"])
    return pd.read_csv(USERS_FILE)

def save_users_df(df):
    df.to_csv(USERS_FILE, index=False)

def get_user(username: str):
    df = get_users_df()
    user_row = df[df["username"] == username]
    if user_row.empty:
        return None
    user_dict = user_row.iloc[0].to_dict()
    return UserInDB(**user_dict)

@router.post("/signup", response_model=User)
async def signup(user_in: UserCreate):
    df = get_users_df()
    if user_in.username in df["username"].values:
        raise HTTPException(status_code=400, detail="Username already registered")
    if user_in.email in df["email"].values:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = get_password_hash(user_in.password)
    new_user = {
        "username": user_in.username,
        "email": user_in.email,
        "hashed_password": hashed_password,
        "full_name": user_in.full_name,
        "disabled": False
    }
    
    # Efficiently add new user
    df = pd.concat([df, pd.DataFrame([new_user])], ignore_index=True)
    save_users_df(df)
    
    return User(**new_user)

@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = get_user(form_data.username)
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = get_user(username)
    if user is None:
        raise credentials_exception
    return user

@router.get("/me", response_model=User)
async def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user
