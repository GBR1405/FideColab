class UserModel {
  constructor(user) {
    this.usuarioId = user.usuarioId; // Correspondiente a Usuario_ID_PK
    this.nombre = user.nombre; // Correspondiente a Nombre
    this.correo = user.correo; // Correspondiente a Correo
    this.contraseña = user.contraseña; // Correspondiente a Contraseña
    this.rolId = user.rolId; // Correspondiente a Rol_ID_FK
    this.generoId = user.generoId; // Correspondiente a Genero_ID_FK
  }
}

export default UserModel;
