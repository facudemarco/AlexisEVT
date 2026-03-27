-- ============================================================
-- AlexisEVT — Schema MySQL para producción
-- Generado desde los modelos SQLAlchemy: 2026-03-27
--
-- Uso:
--   mysql -h HOST -u USER -p DBNAME < init_schema.sql
--
-- IMPORTANTE: ejecutar con la DB vacía.
--             El seed inicial corre automáticamente al
--             arrancar el backend (app/seed.py).
-- ============================================================

SET NAMES utf8mb4;
SET time_zone = '+00:00';
SET foreign_key_checks = 0;

-- ─── users ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `users` (
    `id`                   INT            NOT NULL AUTO_INCREMENT,
    `nombre_sistema`       VARCHAR(255)   NULL,
    `nombre`               VARCHAR(255)   NOT NULL,
    `email`                VARCHAR(255)   NOT NULL,
    `password_hash`        VARCHAR(255)   NOT NULL,
    `telefono`             VARCHAR(50)    NULL,
    `rol`                  ENUM('admin','vendedor') NOT NULL DEFAULT 'vendedor',
    `agencia_nombre`       VARCHAR(255)   NULL,
    `comision_porcentaje`  DOUBLE         NOT NULL DEFAULT 0.0,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_users_email` (`email`),
    INDEX `ix_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── destinos ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `destinos` (
    `id`           INT          NOT NULL AUTO_INCREMENT,
    `nombre`       VARCHAR(255) NOT NULL,
    `sigla`        VARCHAR(20)  NULL,
    `descripcion`  TEXT         NULL,
    `es_combinado` TINYINT(1)   NOT NULL DEFAULT 0,
    `destino_ids`  JSON         NULL,
    PRIMARY KEY (`id`),
    INDEX `ix_destinos_id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── categorias ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `categorias` (
    `id`          INT          NOT NULL AUTO_INCREMENT,
    `nombre`      VARCHAR(255) NOT NULL,
    `slug`        VARCHAR(100) NULL,
    `imagen_url`  VARCHAR(500) NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_categorias_nombre` (`nombre`),
    UNIQUE KEY `uq_categorias_slug`   (`slug`),
    INDEX `ix_categorias_id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── hoteles ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `hoteles` (
    `id`          INT          NOT NULL AUTO_INCREMENT,
    `nombre`      VARCHAR(255) NOT NULL,
    `telefono`    VARCHAR(50)  NULL,
    `destino_id`  INT          NULL,
    `direccion`   VARCHAR(500) NULL,
    `descripcion` TEXT         NULL,
    `imagenes`    JSON         NULL,
    PRIMARY KEY (`id`),
    INDEX `ix_hoteles_id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── transportes ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `transportes` (
    `id`                    INT          NOT NULL AUTO_INCREMENT,
    `nombre`                VARCHAR(255) NOT NULL,
    `razon_social`          VARCHAR(255) NULL,
    `tipo`                  VARCHAR(100) NULL,
    `horario_salida_desde`  VARCHAR(10)  NULL,
    `horario_salida_hasta`  VARCHAR(10)  NULL,
    `horario_regreso`       VARCHAR(10)  NULL,
    PRIMARY KEY (`id`),
    INDEX `ix_transportes_id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── servicios ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `servicios` (
    `id`     INT          NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(255) NOT NULL,
    PRIMARY KEY (`id`),
    INDEX `ix_servicios_id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── puntos_ascenso ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `puntos_ascenso` (
    `id`              INT          NOT NULL AUTO_INCREMENT,
    `nombre_lugar`    VARCHAR(150) NOT NULL,
    `direccion_maps`  VARCHAR(255) NOT NULL DEFAULT '',
    `horario_default` VARCHAR(50)  NOT NULL DEFAULT '00:00',
    PRIMARY KEY (`id`),
    INDEX `ix_puntos_ascenso_id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── paquetes ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `paquetes` (
    `id`                        INT           NOT NULL AUTO_INCREMENT,
    `destino_id`                INT           NULL,
    `categoria_id`              INT           NULL,
    `titulo_subtitulo`          VARCHAR(255)  NOT NULL,
    `fecha_salida`              DATE          NULL,
    `fecha_regreso`             DATE          NULL,
    `duracion_dias`             INT           NOT NULL,
    `duracion_noches`           INT           NOT NULL,
    `precio_base`               DECIMAL(10,2) NOT NULL,
    `precio_adicional`          DOUBLE        NOT NULL DEFAULT 0,
    `moneda`                    VARCHAR(10)   NULL     DEFAULT 'ARS',
    `tipo_salidas`              VARCHAR(20)   NOT NULL DEFAULT 'FECHA_ESPECIFICA',
    `imagen_url`                VARCHAR(500)  NULL,
    `regimen`                   VARCHAR(100)  NULL,
    `gastos_reserva`            DECIMAL(10,2) NOT NULL DEFAULT 0,
    `salidas_diarias`           TINYINT(1)    NOT NULL DEFAULT 0,
    `periodo`                   VARCHAR(100)  NULL,
    `adicionales_json`          JSON          NULL,
    `adicionales`               JSON          NULL,
    `sobre_el_destino`          TEXT          NULL,
    `transporte_incluido`       TINYINT(1)    NOT NULL DEFAULT 0,
    `transporte_empresa`        VARCHAR(150)  NULL,
    `transporte_tipo`           VARCHAR(100)  NULL,
    `horario_salida`            TIME          NULL,
    `horario_regreso`           TIME          NULL,
    `alojamiento_incluido`      TINYINT(1)    NOT NULL DEFAULT 1,
    `alojamiento_noches`        INT           NULL,
    `include_transfer`          TINYINT(1)    NOT NULL DEFAULT 1,
    `include_asistencia_medica` TINYINT(1)    NOT NULL DEFAULT 1,
    `es_borrador`               TINYINT(1)    NOT NULL DEFAULT 0,
    `estado`                    TINYINT(1)    NOT NULL DEFAULT 1,
    `created_at`                DATE          NULL,
    `deleted_at`                DATE          NULL,
    PRIMARY KEY (`id`),
    INDEX `ix_paquetes_id` (`id`),
    CONSTRAINT `fk_paquetes_destino`   FOREIGN KEY (`destino_id`)   REFERENCES `destinos`   (`id`),
    CONSTRAINT `fk_paquetes_categoria` FOREIGN KEY (`categoria_id`) REFERENCES `categorias` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── paquete_hotel (junction con atributos extra: régimen, noches) ────────────
CREATE TABLE IF NOT EXISTS `paquete_hotel` (
    `paquete_id`      INT          NOT NULL,
    `hotel_id`        INT          NOT NULL,
    `regimen`         VARCHAR(100) NULL,
    `cantidad_noches` INT          NULL,
    PRIMARY KEY (`paquete_id`, `hotel_id`),
    CONSTRAINT `fk_ph_paquete` FOREIGN KEY (`paquete_id`) REFERENCES `paquetes` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_ph_hotel`   FOREIGN KEY (`hotel_id`)   REFERENCES `hoteles`  (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── paquetes_hoteles (M2M simple, usado por relationship secondary) ───────────
CREATE TABLE IF NOT EXISTS `paquetes_hoteles` (
    `paquete_id` INT NOT NULL,
    `hotel_id`   INT NOT NULL,
    PRIMARY KEY (`paquete_id`, `hotel_id`),
    CONSTRAINT `fk_paqhot_paquete` FOREIGN KEY (`paquete_id`) REFERENCES `paquetes` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_paqhot_hotel`   FOREIGN KEY (`hotel_id`)   REFERENCES `hoteles`  (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── paquete_transporte (M2M) ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `paquete_transporte` (
    `paquete_id`    INT NOT NULL,
    `transporte_id` INT NOT NULL,
    PRIMARY KEY (`paquete_id`, `transporte_id`),
    CONSTRAINT `fk_pt_paquete`    FOREIGN KEY (`paquete_id`)    REFERENCES `paquetes`    (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_pt_transporte` FOREIGN KEY (`transporte_id`) REFERENCES `transportes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── paquete_servicio (M2M) ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `paquete_servicio` (
    `paquete_id`  INT NOT NULL,
    `servicio_id` INT NOT NULL,
    PRIMARY KEY (`paquete_id`, `servicio_id`),
    CONSTRAINT `fk_ps_paquete`  FOREIGN KEY (`paquete_id`)  REFERENCES `paquetes`  (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_ps_servicio` FOREIGN KEY (`servicio_id`) REFERENCES `servicios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── paquetes_puntoascenso (M2M) ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `paquetes_puntoascenso` (
    `paquete_id` INT NOT NULL,
    `punto_id`   INT NOT NULL,
    PRIMARY KEY (`paquete_id`, `punto_id`),
    CONSTRAINT `fk_ppa_paquete` FOREIGN KEY (`paquete_id`) REFERENCES `paquetes`       (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_ppa_punto`   FOREIGN KEY (`punto_id`)   REFERENCES `puntos_ascenso` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── reservas ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `reservas` (
    `id`                INT          NOT NULL AUTO_INCREMENT,
    `vendedor_id`       INT          NULL,
    `paquete_id`        INT          NULL,
    `cliente_nombre`    VARCHAR(255) NULL,
    `cliente_email`     VARCHAR(255) NULL,
    `cliente_telefono`  VARCHAR(50)  NULL,
    `pasajeros_adultos` INT          NOT NULL DEFAULT 1,
    `pasajeros_menores` INT          NOT NULL DEFAULT 0,
    `estado_reserva`    ENUM('Pendiente','Aprobada','Rechazada') NOT NULL DEFAULT 'Pendiente',
    `motivo_rechazo`    TEXT         NULL,
    `precio_total`      DOUBLE       NOT NULL,
    `fecha_creacion`    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `ix_reservas_id` (`id`),
    CONSTRAINT `fk_reservas_vendedor` FOREIGN KEY (`vendedor_id`) REFERENCES `users`    (`id`),
    CONSTRAINT `fk_reservas_paquete`  FOREIGN KEY (`paquete_id`)  REFERENCES `paquetes` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── pasajeros ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `pasajeros` (
    `id`               INT          NOT NULL AUTO_INCREMENT,
    `reserva_id`       INT          NULL,
    `nombre`           VARCHAR(255) NOT NULL,
    `apellido`         VARCHAR(255) NOT NULL,
    `dni`              VARCHAR(20)  NULL,
    `fecha_nacimiento` DATE         NULL,
    `telefono`         VARCHAR(50)  NULL,
    `punto_ascenso_id` INT          NULL,
    PRIMARY KEY (`id`),
    INDEX `ix_pasajeros_id` (`id`),
    CONSTRAINT `fk_pasajeros_reserva` FOREIGN KEY (`reserva_id`)       REFERENCES `reservas`       (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_pasajeros_punto`   FOREIGN KEY (`punto_ascenso_id`) REFERENCES `puntos_ascenso` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── notificaciones ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `notificaciones` (
    `id`             INT          NOT NULL AUTO_INCREMENT,
    `user_id`        INT          NOT NULL,
    `reserva_id`     INT          NULL,
    `tipo`           VARCHAR(50)  NOT NULL,
    `mensaje`        VARCHAR(500) NOT NULL,
    `leida`          TINYINT(1)   NOT NULL DEFAULT 0,
    `fecha_creacion` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `ix_notificaciones_id` (`id`),
    CONSTRAINT `fk_notif_user`    FOREIGN KEY (`user_id`)    REFERENCES `users`    (`id`),
    CONSTRAINT `fk_notif_reserva` FOREIGN KEY (`reserva_id`) REFERENCES `reservas` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── cartelera ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `cartelera` (
    `id`             INT          NOT NULL AUTO_INCREMENT,
    `nombre`         VARCHAR(255) NOT NULL,
    `periodo`        VARCHAR(100) NOT NULL,
    `imagen_url`     VARCHAR(500) NOT NULL,
    `fecha_creacion` DATE         NOT NULL,
    PRIMARY KEY (`id`),
    INDEX `ix_cartelera_id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── alembic_version ──────────────────────────────────────────────────────────
-- Alembic necesita esta tabla para trackear el estado de migraciones.
-- Se crea vacía; Alembic la poblará al correr `alembic upgrade head`.
CREATE TABLE IF NOT EXISTS `alembic_version` (
    `version_num` VARCHAR(32) NOT NULL,
    PRIMARY KEY (`version_num`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET foreign_key_checks = 1;

-- ============================================================
-- Schema completo creado. Próximo paso en el VPS:
--
--   cd /home/iweb/alexisevt/project/backend
--   pip install -r requirements.txt
--   alembic upgrade head          # sincroniza versión de Alembic
--   uvicorn app.main:app --host 0.0.0.0 --port 8000
--
-- El seed (categorías, destinos, puntos de ascenso, admin user)
-- se ejecuta automáticamente al primer arranque del backend.
-- ============================================================
