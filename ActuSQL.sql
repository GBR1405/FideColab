----------------------
--     Grupo #6     -- 
-- BD - Normalizada --
----------------------

CREATE DATABASE FideColab;
Go

USE FideColab;
Go

-- Tabla CodigoCurso - T

CREATE TABLE CodigoCurso_TB (
    CodigoCurso_ID_PK INT PRIMARY KEY IDENTITY,
	Nombre_Curso NVARCHAR(100) NOT NULL,
	Codigo_Curso NVARCHAR(100) NOT NULL
);

-- Tabla GrupoCurso - T

CREATE TABLE GrupoCurso_TB (
    GrupoCurso_ID_PK INT PRIMARY KEY IDENTITY,
	Codigo_Grupo INT NOT NULL,
	Curso_ID_FK INT NOT NULL,
	FOREIGN KEY (Curso_ID_FK) REFERENCES CodigoCurso_TB(CodigoCurso_ID_PK)
);

-- Tabla Genero - T

CREATE TABLE Genero_TB (
    Genero_ID_PK INT PRIMARY KEY IDENTITY,
	Tipo_Genero NVARCHAR(100) NOT NULL
);

-- Tabla Rol - T

CREATE TABLE Rol_TB (
    Rol_ID_PK INT PRIMARY KEY IDENTITY,
	Rol NVARCHAR(100) NOT NULL
);

-- Tabla Tipo_Juego - T

CREATE TABLE Tipo_Juego_TB (
    Tipo_Juego_ID_PK INT PRIMARY KEY IDENTITY,
	Juego NVARCHAR(100) NOT NULL
);

-- Tabla Tema_Juego - T

CREATE TABLE Tema_Juego_TB (
    Tema_Juego_ID_PK INT PRIMARY KEY IDENTITY,
	Tipo_Juego_ID_FK INT NOT NULL,
	Contenido NVARCHAR(512) NOT NULL,

	FOREIGN KEY (Tipo_Juego_ID_FK) REFERENCES Tipo_Juego_TB(Tipo_Juego_ID_PK)
);

-- Tabla Equipo - T

CREATE TABLE Equipo_TB (
    Equipo_ID_PK INT PRIMARY KEY IDENTITY,
	Numero_Equipo INT NOT NULL,
    Nombre_Equipo NVARCHAR(100) NOT NULL
);

-- Tabla Usuario

CREATE TABLE Usuario_TB (
    Usuario_ID_PK INT PRIMARY KEY IDENTITY,
    Nombre NVARCHAR(100) NOT NULL,
    Correo NVARCHAR(100) NOT NULL UNIQUE,
    Contraseña NVARCHAR(100) NOT NULL,
	Rol_ID_FK INT NOT NULL,
	Genero_ID_FK INT NOT NULL,

	FOREIGN KEY (Rol_ID_FK) REFERENCES Rol_TB(Rol_ID_PK),
	FOREIGN KEY (Genero_ID_FK) REFERENCES Genero_TB(Genero_ID_PK)
);

-- Tabla Personalizacion

CREATE TABLE Personalizacion_TB (
    Personalizacion_ID_PK INT PRIMARY KEY IDENTITY,
	Nombre_Personalizacion NVARCHAR(100) NOT NULL,
	Usuario_ID_FK INT NOT NULL,
	FOREIGN KEY (Usuario_ID_FK) REFERENCES Usuario_TB(Usuario_ID_PK)
);

-- Tabla ConfiguracionJuego

CREATE TABLE ConfiguracionJuego_TB (
    ConfiguracionJuego_ID_PK INT PRIMARY KEY IDENTITY,
	Tipo_Juego_ID_FK INT NOT NULL,
	Personalizacion_ID_PK INT NOT NULL,
	Orden INT NOT NULL,
	Dificultad INT NOT NULL,
	Tema_Juego_ID_FK INT NOT NULL,
	FOREIGN KEY (Tipo_Juego_ID_FK) REFERENCES Tipo_Juego_TB(Tipo_Juego_ID_PK),
	FOREIGN KEY (Tema_Juego_ID_FK) REFERENCES Tema_Juego_TB(Tema_Juego_ID_PK),
	FOREIGN KEY (Personalizacion_ID_PK) REFERENCES Personalizacion_TB(Personalizacion_ID_PK)
);


-- Tabla GrupoVinculado

CREATE TABLE GrupoVinculado_TB (
    GruposEncargados_ID_PK INT PRIMARY KEY IDENTITY,
	Usuario_ID_FK INT NOT NULL,
    GrupoCurso_ID_FK INT NOT NULL,
	FOREIGN KEY (Usuario_ID_FK) REFERENCES Usuario_TB(Usuario_ID_PK),
	FOREIGN KEY (GrupoCurso_ID_FK) REFERENCES GrupoCurso_TB(GrupoCurso_ID_PK)
);


-- Tabla Partida

CREATE TABLE Partida_TB (
    Partida_ID_PK INT PRIMARY KEY IDENTITY,
    FechaInicio DATETIME NOT NULL,
    FechaFin DATETIME,
    Profesor_ID_FK INT,
    EstadoPartida NVARCHAR(20) NOT NULL CHECK (EstadoPartida IN ('en espera', 'iniciada', 'finalizada')),
    Personalizacion_ID_FK INT,  
    FOREIGN KEY (Profesor_ID_FK) REFERENCES Usuario_TB(Usuario_ID_PK),
    FOREIGN KEY (Personalizacion_ID_FK) REFERENCES Personalizacion_TB(Personalizacion_ID_PK)
);

-- Tabla Participantes

CREATE TABLE Participantes_TB (
	Participantes_ID_PK INT PRIMARY KEY IDENTITY,
	Usuario_ID_FK INT NOT NULL,
	Equipo_ID_FK INT NOT NULL,
	Partida_ID_FK INT NOT NULL,
	Fecha_Ingreso DATETIME

	FOREIGN KEY (Usuario_ID_FK) REFERENCES Usuario_TB(Usuario_ID_PK),
	FOREIGN KEY (Equipo_ID_FK) REFERENCES Equipo_TB(Equipo_ID_PK),
	FOREIGN KEY (Partida_ID_FK) REFERENCES Partida_TB(Partida_ID_PK)
);

-- Tabla Resultados

CREATE TABLE Resultados_TB (
	Resultados_ID_PK INT PRIMARY KEY IDENTITY,
	Usuario_ID_FK INT NOT NULL,
	Partida_ID_FK INT NOT NULL,
	Puntuaje INT NOT NULL,
	Fecha DATETIME

	FOREIGN KEY (Usuario_ID_FK) REFERENCES Usuario_TB(Usuario_ID_PK),
	FOREIGN KEY (Partida_ID_FK) REFERENCES Partida_TB(Partida_ID_PK)
);

-- Tabla Bitacora

CREATE TABLE Bitacora_TB (
	Bitacora_ID_PK INT PRIMARY KEY IDENTITY,
	Usuario_ID_FK INT NOT NULL,
	Accion VARCHAR(200) NOT NULL,
	Error VARCHAR(512) NOT NULL,
	Fecha DATETIME

	FOREIGN KEY (Usuario_ID_FK) REFERENCES Usuario_TB(Usuario_ID_PK)
);

-- Crear el usuario

Use master
CREATE LOGIN FideColab WITH PASSWORD = 'FideColab';

-- Cambia a la base de datos
USE FideColab;
CREATE USER FideColab FOR LOGIN FideColab;
ALTER ROLE db_owner ADD MEMBER FideColab;

-- Insertal Roles, Generos 

INSERT INTO Genero_TB (Tipo_Genero) VALUES ('Hombre');
INSERT INTO Genero_TB (Tipo_Genero) VALUES ('Mujer');
INSERT INTO Genero_TB (Tipo_Genero) VALUES ('Indefinido');

INSERT INTO Rol_TB (Rol) VALUES ('Estudiante');
INSERT INTO Rol_TB (Rol) VALUES ('Profesor');
INSERT INTO Rol_TB (Rol) VALUES ('Administrador');