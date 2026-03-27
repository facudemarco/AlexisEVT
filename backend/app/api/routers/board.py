from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.api.deps import get_db
from app.api.deps_security import get_current_admin_user

from app.schemas.board import BoardItem, BoardItemCreate, BoardItemUpdate
from app.crud import crud_board

router = APIRouter()

@router.get("/", response_model=List[BoardItem])
def read_boards(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    boards = crud_board.get_boards(db, skip=skip, limit=limit)
    return boards

@router.post("/", response_model=BoardItem)
def create_board(
    board: BoardItemCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin_user),
):
    return crud_board.create_board(db=db, board=board)

@router.put("/{board_id}", response_model=BoardItem)
def update_board(
    board_id: int,
    board: BoardItemUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin_user),
):
    db_board = crud_board.update_board(db=db, board_id=board_id, board=board)
    if not db_board:
        raise HTTPException(status_code=404, detail="Cartel no encontrado")
    return db_board

@router.delete("/{board_id}", response_model=BoardItem)
def delete_board(
    board_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin_user),
):
    db_board = crud_board.delete_board(db=db, board_id=board_id)
    if not db_board:
        raise HTTPException(status_code=404, detail="Cartel no encontrado")
    return db_board
