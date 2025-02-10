class UserModel {
  constructor(user) {
    this.usuarioId = user.usuarioId; 
    this.nombre = user.nombre; 
    this.correo = user.correo;
    this.contraseña = user.contraseña; 
    this.rolId = user.rolId; 
    this.generoId = user.generoId; 
  }
}

export default UserModel;
