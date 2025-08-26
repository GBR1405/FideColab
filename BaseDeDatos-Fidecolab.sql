----------------------
--     Grupo #6     -- 
-- BD - Normalizada --
----------------------

CREATE DATABASE FideColab;
Go

USE FideColab;
Go

-- Tabla CodigoCurso - REVISADO

CREATE TABLE CodigoCurso_TB (
    CodigoCurso_ID_PK INT PRIMARY KEY IDENTITY,
	Nombre_Curso NVARCHAR(100) NOT NULL,
	Codigo_Curso NVARCHAR(100) NOT NULL
);

-- Tabla GrupoCurso - REVISADO

CREATE TABLE GrupoCurso_TB (
    GrupoCurso_ID_PK INT PRIMARY KEY IDENTITY,
	Codigo_Grupo INT NOT NULL,
	Curso_ID_FK INT NOT NULL,
	FOREIGN KEY (Curso_ID_FK) REFERENCES CodigoCurso_TB(CodigoCurso_ID_PK)
);

-- Tabla Genero - REVISADO

CREATE TABLE Genero_TB (
    Genero_ID_PK INT PRIMARY KEY IDENTITY,
	Tipo_Genero NVARCHAR(100) NOT NULL
);

-- Tabla Rol - REVISADO

CREATE TABLE Rol_TB (
    Rol_ID_PK INT PRIMARY KEY IDENTITY,
	Rol NVARCHAR(100) NOT NULL
);

-- Tabla Tipo_Juego - REVISADO

CREATE TABLE Tipo_Juego_TB (
    Tipo_Juego_ID_PK INT PRIMARY KEY IDENTITY,
	Juego NVARCHAR(100) NOT NULL
);

INSERT INTO Tipo_Juego_TB (Juego) 
VALUES 
    ('Rompecabezas'), 
    ('Memoria'), 
    ('Dibujo'), 
    ('Ahorcado');


-- Tabla Tema_Juego - REVISADO

CREATE TABLE Tema_Juego_TB (
    Tema_Juego_ID_PK INT PRIMARY KEY IDENTITY,
	Tipo_Juego_ID_FK INT NOT NULL,
	Contenido NVARCHAR(512) NOT NULL,
	Estado BIT NOT NULL,

	FOREIGN KEY (Tipo_Juego_ID_FK) REFERENCES Tipo_Juego_TB(Tipo_Juego_ID_PK)
);

-- Tabla Usuario - REVISADO

CREATE TABLE Usuario_TB (
    Usuario_ID_PK INT PRIMARY KEY IDENTITY,
    Nombre NVARCHAR(100) NOT NULL,
	Apellido1 NVARCHAR(100) NOT NULL,
	Apellido2 NVARCHAR(100) NOT NULL,
    Correo NVARCHAR(100) NOT NULL UNIQUE,
    Contraseña NVARCHAR(100) NOT NULL,
	Rol_ID_FK INT NOT NULL,
	Genero_ID_FK INT NOT NULL,
	Estado BIT NOT NULL,

	FOREIGN KEY (Rol_ID_FK) REFERENCES Rol_TB(Rol_ID_PK),
	FOREIGN KEY (Genero_ID_FK) REFERENCES Genero_TB(Genero_ID_PK),
);



-- Tabla Personalizacion - REVISADO

CREATE TABLE Personalizacion_TB (
    Personalizacion_ID_PK INT PRIMARY KEY IDENTITY,
	Nombre_Personalizacion NVARCHAR(100) NOT NULL,
	Usuario_ID_FK INT NOT NULL,
	Estado INT,
	FOREIGN KEY (Usuario_ID_FK) REFERENCES Usuario_TB(Usuario_ID_PK)
);

-- Tabla ConfiguracionJuego - REVISADO

CREATE TABLE ConfiguracionJuego_TB (
    ConfiguracionJuego_ID_PK INT PRIMARY KEY IDENTITY,
	Tipo_Juego_ID_FK INT NOT NULL,
	Personalizacion_ID_PK INT NOT NULL,
	Dificultad INT NOT NULL,
	Orden INT NOT NULL,
	Tema_Juego_ID_FK INT NULL,
	FOREIGN KEY (Tipo_Juego_ID_FK) REFERENCES Tipo_Juego_TB(Tipo_Juego_ID_PK),
	FOREIGN KEY (Tema_Juego_ID_FK) REFERENCES Tema_Juego_TB(Tema_Juego_ID_PK),
	FOREIGN KEY (Personalizacion_ID_PK) REFERENCES Personalizacion_TB(Personalizacion_ID_PK)
);

-- Tabla GrupoVinculado - REVISADO

CREATE TABLE GrupoVinculado_TB (
    GruposEncargados_ID_PK INT PRIMARY KEY IDENTITY,
	Usuario_ID_FK INT NOT NULL,
    GrupoCurso_ID_FK INT NOT NULL,
	FOREIGN KEY (Usuario_ID_FK) REFERENCES Usuario_TB(Usuario_ID_PK),
	FOREIGN KEY (GrupoCurso_ID_FK) REFERENCES GrupoCurso_TB(GrupoCurso_ID_PK)
);


-- Tabla Partida - REVISADO

CREATE TABLE Partida_TB (
    Partida_ID_PK INT PRIMARY KEY IDENTITY,
    FechaInicio DATETIME NOT NULL,
    FechaFin DATETIME,
    Profesor_ID_FK INT NOT NULL,
	Grupo_ID_FK INT NULL,
    EstadoPartida NVARCHAR(20) NOT NULL CHECK (EstadoPartida IN ('en espera', 'iniciada', 'finalizada', 'en proceso')),
    Personalizacion_ID_FK INT NOT NULL,  
    FOREIGN KEY (Profesor_ID_FK) REFERENCES Usuario_TB(Usuario_ID_PK),
    FOREIGN KEY (Personalizacion_ID_FK) REFERENCES Personalizacion_TB(Personalizacion_ID_PK),
	FOREIGN KEY (Grupo_ID_FK) REFERENCES GrupoCurso_TB(GrupoCurso_ID_PK)
);

-- Tabla Participantes - REVISADO

CREATE TABLE Participantes_TB (
	Participantes_ID_PK INT PRIMARY KEY IDENTITY,
	Usuario_ID_FK INT NOT NULL,
	Equipo_Numero INT NOT NULL,
	Partida_ID_FK INT NOT NULL,
	Fecha_Ingreso DATETIME

	FOREIGN KEY (Usuario_ID_FK) REFERENCES Usuario_TB(Usuario_ID_PK),
	FOREIGN KEY (Partida_ID_FK) REFERENCES Partida_TB(Partida_ID_PK)
);

-- Tabla Resultados - REVISADO

CREATE TABLE Resultados_TB (
	Resultados_ID_PK INT PRIMARY KEY IDENTITY,
	Equipo INT NOT NULL,
	Partida_ID_FK INT NOT NULL,
	Resultados varchar(max) NOT NULL,
	Comentario varchar(300)
	
	FOREIGN KEY (Partida_ID_FK) REFERENCES Partida_TB(Partida_ID_PK)
);

-- Tabla Logros - REVISADO

CREATE TABLE Logros_TB (
  Logro_ID_PK INT IDENTITY(1,1) PRIMARY KEY,
  Nombre NVARCHAR(100) NOT NULL UNIQUE,
  Descripcion NVARCHAR(255),
  Repetible BIT DEFAULT 0,       -- True si puede repetirse (ej. 1er lugar en varias partidas)
  Tipo NVARCHAR(50)              -- 'grupo', 'usuario', 'especial'
);

-- Tabla Logros Usuario - REVISADO

CREATE TABLE Usuario_Logros_TB (
  UsuarioLogro_ID_PK INT IDENTITY(1,1) PRIMARY KEY,
  Usuario_ID_FK INT NOT NULL,
  Logro_ID_FK INT NOT NULL,
  FechaObtenido DATETIME DEFAULT GETDATE(),
  Partida_ID_FK INT,
  UNIQUE (Usuario_ID_FK, Logro_ID_FK),   -- ← aquí faltaba la coma

  FOREIGN KEY (Usuario_ID_FK) REFERENCES Usuario_TB(Usuario_ID_PK),
  FOREIGN KEY (Logro_ID_FK) REFERENCES Logros_TB(Logro_ID_PK)
);
-- Tabla Bitacora - REVISADO

CREATE TABLE Bitacora_TB (
	Bitacora_ID_PK INT PRIMARY KEY IDENTITY,
	Usuario_ID_FK INT NOT NULL,
	Accion VARCHAR(200) NOT NULL,
	Error VARCHAR(512) NOT NULL,
	Fecha DATETIME

	FOREIGN KEY (Usuario_ID_FK) REFERENCES Usuario_TB(Usuario_ID_PK)
);

-- Crear el usuario (PARA USO LOCAL)

Use master
CREATE LOGIN FideColab WITH PASSWORD = 'FideColab';

-- Cambia a la base de datos
USE FideColab;
CREATE USER FideColab FOR LOGIN FideColab;
ALTER ROLE db_owner ADD MEMBER FideColab;

-- SOLO HACERLO EN AZURE
USE master;
GO
CREATE LOGIN Fidecolab_Usuario WITH PASSWORD = 'Fide_Colab_2025*';
GO

USE fidecolab;
GO

-- 4. Crear el usuario dentro de la base (vinculado al login)
CREATE USER Fidecolab_Usuario FOR LOGIN Fidecolab_Usuario;
GO

-- 5. Asignar el rol db_owner para tener todos los permisos en esa base
ALTER ROLE db_owner ADD MEMBER Fidecolab_Usuario;
GO

-- Insertal Roles, Generos 

INSERT INTO Genero_TB (Tipo_Genero) VALUES ('Hombre');
INSERT INTO Genero_TB (Tipo_Genero) VALUES ('Mujer');
INSERT INTO Genero_TB (Tipo_Genero) VALUES ('Indefinido');

INSERT INTO Rol_TB (Rol) VALUES ('Estudiante');
INSERT INTO Rol_TB (Rol) VALUES ('Profesor');
INSERT INTO Rol_TB (Rol) VALUES ('Administrador');

INSERT INTO Logros_TB (Nombre, Descripcion, Repetible, Tipo) VALUES
('Coordinación Perfecta', 'Tu grupo quedó en primer lugar', 1, 'grupo'),
('Trabajo en equipo poderoso', 'Tu grupo quedó en segundo lugar', 1, 'grupo'),
('Apoyo entre todos', 'Tu grupo quedó en tercer lugar', 1, 'grupo'),

-- GRUPALES: POR JUEGO TERMINADO (estos se repiten)
('Artista', 'Terminaste un juego de dibujo', 1, 'grupo'),
('Adivinador (Grupo)', 'Terminaste un juego de ahorcado', 1, 'grupo'),
('Buena vista', 'Terminaste un juego de memoria', 1, 'grupo'),
('Gran talento', 'Terminaste un juego de rompecabezas', 1, 'grupo'),

-- GRUPALES: COMPLETAR TODO
('Final Perfecto', 'Tu equipo completó todos los juegos al 100%', 1, 'grupo'),
('Trabajo en equipo', 'Tu equipo completó todos los juegos (aunque no todos al 100%)', 1, 'grupo'),

-- PERSONALES: PARTICIPACIÓN POR JUEGO
('Diseñador', 'Has jugado un juego de dibujo', 0, 'usuario'),
('Localizador de parejas', 'Has jugado un juego de memoria', 0, 'usuario'),
('Jugador de partidas', 'Has jugado una partida completa', 0, 'usuario'),
('Localizador de detalles pequeños', 'Has jugado un rompecabezas', 0, 'usuario'),
('Adivinador', 'Has jugado un juego de ahorcado', 0, 'usuario'),

-- PERSONALES: PARTICIPACIÓN ACUMULADA (NIVELES)
('Diseñador - Nivel 2', 'Has jugado 3 juegos de dibujo', 0, 'usuario'),
('Diseñador - Nivel 3', 'Has jugado 7 juegos de dibujo', 0, 'usuario'),
('Diseñador - Nivel 4', 'Has jugado 10 juegos de dibujo', 0, 'usuario'),

('Localizador de parejas - Nivel 2', 'Has jugado 3 juegos de memoria', 0, 'usuario'),
('Localizador de parejas - Nivel 3', 'Has jugado 7 juegos de memoria', 0, 'usuario'),
('Localizador de parejas - Nivel 4', 'Has jugado 10 juegos de memoria', 0, 'usuario'),

('Localizador de detalles pequeños - Nivel 2', 'Has jugado 3 rompecabezas', 0, 'usuario'),
('Localizador de detalles pequeños - Nivel 3', 'Has jugado 7 rompecabezas', 0, 'usuario'),
('Localizador de detalles pequeños - Nivel 4', 'Has jugado 10 rompecabezas', 0, 'usuario'),

('Adivinador - Nivel 2', 'Has jugado 3 juegos de ahorcado', 0, 'usuario'),
('Adivinador - Nivel 3', 'Has jugado 7 juegos de ahorcado', 0, 'usuario'),
('Adivinador - Nivel 4', 'Has jugado 10 juegos de ahorcado', 0, 'usuario'),

('Jugador de partidas - Nivel 2', 'Has jugado 3 partidas completas', 0, 'usuario'),
('Jugador de partidas - Nivel 3', 'Has jugado 7 partidas completas', 0, 'usuario'),
('Jugador de partidas - Nivel 4', 'Has jugado 10 partidas completas', 0, 'usuario'),

-- PERSONALES ESPECIALES
('Hola de nuevo - Nivel 1', 'Jugaste otra vez con la misma persona', 0, 'usuario'),
('Hola de nuevo - Nivel 2', 'Jugaste 3 veces con la misma persona', 0, 'usuario'),
('Hola de nuevo - Nivel 3', 'Jugaste 5 veces con la misma persona', 0, 'usuario'),

('Cazador de logros', 'Obtén múltiples logros en una partida', 0, 'usuario'),
('Gracias por jugar', 'Prueba Fidecolab por primera vez', 0, 'usuario');
