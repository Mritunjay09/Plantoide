import psycopg
import os
from dotenv import load_dotenv
import psycopg.errors
import bcrypt

load_dotenv()
db_url = os.getenv("DB_URL")


def hashed_password(password: str):
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt())


def verify_password(password: str, hashed: bytes):
    return bcrypt.checkpw(password.encode(), hashed)


def get_connection():
    return psycopg.connect(db_url)


def create_table():
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
               CREATE TABLE IF NOT EXISTS users (
                    id SERIAL PRIMARY KEY,
                    name TEXT NOT NULL,
                    user_name TEXT UNIQUE NOT NULL,
                    email TEXT UNIQUE NOT NULL,
                    password_hash BYTEA NOT NULL,
                    farm_name TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
                """)


def create_table_scan():
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
               CREATE TABLE IF NOT EXISTS scans (
                    id SERIAL PRIMARY KEY,
                    user_id INTEGER NOT NULL,
                    scan_data JSONB NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
                );
                """)


def create_user(name, user_name, password, email, farm_name):
    hashed = hashed_password(password)
    email = email.strip().lower()
    user_name = user_name.strip().lower()
    try:
        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """INSERT INTO users (name, user_name, email, farm_name, password_hash)
                    VALUES (%s, %s, %s, %s, %s) RETURNING id;""",
                    (name, user_name, email, farm_name, hashed)
                )
                return cur.fetchone()[0]
    except psycopg.errors.UniqueViolation:
        return "User name or email already exists"


def remove_user(user_name):
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                "DELETE FROM users WHERE user_name = %s;",
                (user_name,)
            )
            return "User removed successfully"


def authenticate_user(user_name, password):
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT password_hash FROM users WHERE user_name = %s;",
                (user_name,)
            )
            result = cur.fetchone()

            if not result:
                return False

            return verify_password(password, result[0])
