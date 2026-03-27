"""
Script para crear 10 reservas de prueba con distintos estados, destinos y fechas.
Ejecutar desde /backend:  python seed_bookings.py
"""

from app.db.session import SessionLocal, engine, Base
from app.models.booking import Reserva, Pasajero, ReservaStatus
from app.models.package import Paquete
from app.models.user import User
from datetime import date

Base.metadata.create_all(bind=engine)

CLIENTES = [
    {"nombre": "Claudia Patricia Paletta",  "email": "claudia@gmail.com",   "tel": "1155441122"},
    {"nombre": "Martín Rodríguez",          "email": "martin@gmail.com",    "tel": "1144332211"},
    {"nombre": "Valeria Sánchez",           "email": "valeria@gmail.com",   "tel": "1166778899"},
    {"nombre": "Jorge Luis Boretti",        "email": "jorge@gmail.com",     "tel": "1177889900"},
    {"nombre": "Ana Laura Giménez",         "email": "ana@gmail.com",       "tel": "1188990011"},
]

RESERVAS_DATA = [
    # (cliente_idx, paquete_idx_1based, adultos, menores, estado, motivo_rechazo, precio_total, pasajeros)
    (0, 1, 2, 0, ReservaStatus.PENDIENTE,  None,          270000, [("Claudia", "Paletta"), ("Roberto", "Paletta")]),
    (0, 1, 2, 0, ReservaStatus.APROBADA,   None,          270000, [("Claudia", "Paletta"), ("Roberto", "Paletta")]),
    (0, 1, 2, 0, ReservaStatus.RECHAZADA,  "Falta cupo",  270000, [("Claudia", "Paletta"), ("Roberto", "Paletta")]),
    (1, 3, 1, 1, ReservaStatus.PENDIENTE,  None,          190000, [("Martín",  "Rodríguez"), ("Lucía", "Rodríguez")]),
    (1, 3, 1, 1, ReservaStatus.APROBADA,   None,          190000, [("Martín",  "Rodríguez"), ("Lucía", "Rodríguez")]),
    (2, 2, 3, 0, ReservaStatus.RECHAZADA,  "Documentación incompleta", 405000, [("Valeria", "Sánchez"), ("Pedro", "Sánchez"), ("Tomás", "Sánchez")]),
    (2, 1, 2, 1, ReservaStatus.PENDIENTE,  None,          345000, [("Valeria", "Sánchez"), ("Pedro", "Sánchez"), ("Tomás", "Sánchez")]),
    (3, 3, 2, 2, ReservaStatus.APROBADA,   None,          520000, [("Jorge", "Boretti"), ("Sandra", "Boretti"), ("Sofía", "Boretti"), ("Nico", "Boretti")]),
    (4, 1, 1, 0, ReservaStatus.PENDIENTE,  None,          135000, [("Ana Laura", "Giménez")]),
    (4, 3, 2, 0, ReservaStatus.RECHAZADA,  "Sin disponibilidad en las fechas solicitadas", 370000, [("Ana Laura", "Giménez"), ("Carlos", "Giménez")]),
]

def run():
    db = SessionLocal()
    try:
        # Evitar duplicados: si ya hay reservas, no insertar
        existing = db.query(Reserva).count()
        if existing >= 10:
            print(f"[seed_bookings] Ya existen {existing} reservas. Saliendo sin insertar.")
            return

        vendedor = db.query(User).first()
        if not vendedor:
            print("[seed_bookings] ERROR: No hay usuarios en la BD. Ejecutá el seed principal primero.")
            return

        paquetes = db.query(Paquete).order_by(Paquete.id).all()
        if not paquetes:
            print("[seed_bookings] ERROR: No hay paquetes en la BD. Ejecutá el seed principal primero.")
            return

        for (cli_idx, paq_pos, adultos, menores, estado, motivo, precio, pasajeros_list) in RESERVAS_DATA:
            c = CLIENTES[cli_idx]
            paq = paquetes[min(paq_pos - 1, len(paquetes) - 1)]

            reserva = Reserva(
                vendedor_id=vendedor.id,
                paquete_id=paq.id,
                cliente_nombre=c["nombre"],
                cliente_email=c["email"],
                cliente_telefono=c["tel"],
                pasajeros_adultos=adultos,
                pasajeros_menores=menores,
                estado_reserva=estado,
                motivo_rechazo=motivo,
                precio_total=precio,
            )

            for nombre, apellido in pasajeros_list:
                reserva.pasajeros.append(Pasajero(nombre=nombre, apellido=apellido))

            db.add(reserva)

        db.commit()
        print(f"[seed_bookings] 10 reservas de prueba creadas correctamente.")

    except Exception as e:
        db.rollback()
        print(f"[seed_bookings] Error: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    run()
