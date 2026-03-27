from sqlalchemy.orm import Session
from app.models.board import BoardItem
from app.schemas.board import BoardItemCreate, BoardItemUpdate

def get_boards(db: Session, skip: int = 0, limit: int = 100):
    return db.query(BoardItem).offset(skip).limit(limit).all()

def get_board(db: Session, board_id: int):
    return db.query(BoardItem).filter(BoardItem.id == board_id).first()

def create_board(db: Session, board: BoardItemCreate):
    db_board = BoardItem(**board.model_dump())
    db.add(db_board)
    db.commit()
    db.refresh(db_board)
    return db_board

def update_board(db: Session, board_id: int, board: BoardItemUpdate):
    db_board = get_board(db, board_id)
    if db_board:
        update_data = board.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_board, key, value)
        db.commit()
        db.refresh(db_board)
    return db_board

def delete_board(db: Session, board_id: int):
    db_board = get_board(db, board_id)
    if db_board:
        db.delete(db_board)
        db.commit()
    return db_board
