import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import "../styles/adminComponents.css";
import LayoutAdmin from "../components/LayoutAdmin";
import Cookies from 'js-cookie';
import "../styles/modalAdmin.css";
import ResultadosAdmin from './ResultAdmin';

const token = Cookies.get("authToken");
const apiUrl = process.env.REACT_APP_API_URL;

const Depuration = () => {
  const [selectedTab, setSelectedTab] = useState('users');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [showSystemClean, setShowSystemClean] = useState(false);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [historial, setHistorial] = useState([]);
  const [filteredHistorial, setFilteredHistorial] = useState([]);
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [logActionFilter, setLogActionFilter] = useState('all');
  const [logErrorFilter, setLogErrorFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');

  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedPartidaId, setSelectedPartidaId] = useState(null);
  const [modalAnimation, setModalAnimation] = useState('');

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedResultId, setSelectedResultId] = useState(null);

  const navigate = useNavigate();


  const handleViewDetails = (partidaId) => {
    console.log("Partida ID recibida:", partidaId, typeof partidaId);
    const idNumber = Number(partidaId);
    if (isNaN(idNumber)) {
      console.error("ID de partida no es un número válido:", partidaId);
      return;
    }
    setSelectedResultId(idNumber);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedResultId(null);
  };

  // Fetch users from API
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const apiUrl = process.env.REACT_APP_API_URL;
      const response = await fetch(`${apiUrl}/usuarios_D`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error('Error al obtener usuarios');
      }

      const data = await response.json();
      console.log("Users data received:", data);
      const normalizedUsers = data.users.map(user => ({
        ...user,
        id: user.Usuario_ID_PK || user.id
      })).reverse();
      setUsers(normalizedUsers || []);
      setFilteredUsers(normalizedUsers || []);
    } catch (error) {
      console.error("Error al obtener usuarios:", error);
      Swal.fire('Error', 'No se pudieron obtener los usuarios', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Fetch courses from API
  const fetchCourses = async () => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL;
      const response = await fetch(`${apiUrl}/cursos`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error('Error al obtener cursos');
      }

      const data = await response.json();
      setCourses(data.courses || []);
    } catch (error) {
      console.error("Error al obtener cursos:", error);
    }
  };

  // Filter users based on search and filters
  useEffect(() => {
    let result = users;

    // Filter by role
    if (roleFilter !== 'all') {
      result = result.filter(user => user.Rol === roleFilter);
    }

    // Filter by status
    if (statusFilter !== 'all') {
      const statusValue = statusFilter === 'Activo' ? 1 : 0;
      result = result.filter(user => user.Estado === statusValue);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(user =>
        (user.Nombre && user.Nombre.toLowerCase().includes(query)) ||
        (user.Apellido1 && user.Apellido1.toLowerCase().includes(query)) ||
        (user.Apellido2 && user.Apellido2.toLowerCase().includes(query)) ||
        (user.Correo && user.Correo.toLowerCase().includes(query))
      );
    }

    setFilteredUsers(result);
    setCurrentPage(1);
  }, [users, roleFilter, statusFilter, searchQuery]);

  // Load data when component mounts or tab changes
  useEffect(() => {
    if (selectedTab === 'users') {
      fetchUsers();
      fetchCourses();
    } else if (selectedTab === 'history') {
      fetchHistorial();
    } else if (selectedTab === 'logs') {
      fetchLogs();
    }
  }, [selectedTab]);

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  // Handle page change
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Handle tab change
  const handleTabChange = (tab) => {
    setSelectedTab(tab);
    setCurrentPage(1);
  };

  // Handle search input change
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  // Handle role filter change
  const handleRoleFilterChange = (event) => {
    setRoleFilter(event.target.value);
  };

  // Handle status filter change
  const handleStatusFilterChange = (event) => {
    setStatusFilter(event.target.value);
  };

  // Agregar estas funciones dentro del componente Depuration

// Limpiar todas las personalizaciones
const handleCleanCustomizations = async () => {
  let timerInterval;
  const result = await Swal.fire({
    title: '¿Limpiar todas las personalizaciones?',
    html: `
      <div style="text-align: left; margin: 15px 0;">
        <p>Esta acción eliminará <strong>TODAS</strong> las personalizaciones del sistema, incluyendo:</p>
        <ul>
          <li>Configuraciones de juego</li>
          <li>Partidas relacionadas</li>
          <li>Resultados asociados</li>
        </ul>
        <p style="color: #dc3545; font-weight: bold;">Esta acción no se puede deshacer.</p>
      </div>
      <div id="timer" style="font-weight: bold; color: #dc3545; margin: 10px 0;">
        El botón se habilitará en 5 segundos...
      </div>
    `,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Confirmar (5s)',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#d33',
    allowOutsideClick: false,
    allowEscapeKey: false,
    focusConfirm: false,
    didOpen: () => {
      const confirmButton = Swal.getConfirmButton();
      confirmButton.disabled = true;
      
      let seconds = 5;
      timerInterval = setInterval(() => {
        Swal.getHtmlContainer().querySelector('#timer').textContent = 
          `El botón se habilitará en ${seconds} segundo${seconds !== 1 ? 's' : ''}...`;
        seconds--;
        
        if (seconds < 0) {
          clearInterval(timerInterval);
          confirmButton.disabled = false;
          confirmButton.textContent = 'Confirmar';
          Swal.getHtmlContainer().querySelector('#timer').textContent = '¡Ahora puedes confirmar!';
        }
      }, 1000);
    },
    willClose: () => {
      clearInterval(timerInterval);
    }
  });

  if (result.isConfirmed) {
    try {
      const apiUrl = process.env.REACT_APP_API_URL;
      const response = await fetch(`${apiUrl}/personalizaciones_D`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error('Error al limpiar personalizaciones');
      }

      Swal.fire('Éxito', 'Todas las personalizaciones han sido eliminadas', 'success');
    } catch (error) {
      console.error("Error al limpiar personalizaciones:", error);
      Swal.fire('Error', 'No se pudieron eliminar las personalizaciones', 'error');
    }
  }
};

// Limpiar toda la bitácora
const handleCleanLogs = async () => {
  let timerInterval;
  const result = await Swal.fire({
    title: '¿Limpiar toda la bitácora?',
    html: `
      <div style="text-align: left; margin: 15px 0;">
        <p>Esta acción eliminará <strong>TODOS</strong> los registros de actividad del sistema.</p>
        <p style="color: #dc3545; font-weight: bold;">Esta acción no se puede deshacer.</p>
      </div>
      <div id="timer" style="font-weight: bold; color: #dc3545; margin: 10px 0;">
        El botón se habilitará en 5 segundos...
      </div>
    `,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Confirmar (5s)',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#d33',
    allowOutsideClick: false,
    allowEscapeKey: false,
    focusConfirm: false,
    didOpen: () => {
      const confirmButton = Swal.getConfirmButton();
      confirmButton.disabled = true;
      
      let seconds = 5;
      timerInterval = setInterval(() => {
        Swal.getHtmlContainer().querySelector('#timer').textContent = 
          `El botón se habilitará en ${seconds} segundo${seconds !== 1 ? 's' : ''}...`;
        seconds--;
        
        if (seconds < 0) {
          clearInterval(timerInterval);
          confirmButton.disabled = false;
          confirmButton.textContent = 'Confirmar';
          Swal.getHtmlContainer().querySelector('#timer').textContent = '¡Ahora puedes confirmar!';
        }
      }, 1000);
    },
    willClose: () => {
      clearInterval(timerInterval);
    }
  });

  if (result.isConfirmed) {
    try {
      const apiUrl = process.env.REACT_APP_API_URL;
      const response = await fetch(`${apiUrl}/bitacora_D`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error('Error al limpiar bitácora');
      }

      Swal.fire('Éxito', 'Toda la bitácora ha sido eliminada', 'success');
    } catch (error) {
      console.error("Error al limpiar bitácora:", error);
      Swal.fire('Error', 'No se pudo eliminar la bitácora', 'error');
    }
  }
};


// Eliminar todo el historial
const handleCleanHistory = async () => {
  let timerInterval;
  const result = await Swal.fire({
    title: '¿Eliminar todo el historial?',
    html: `
      <div style="text-align: left; margin: 15px 0;">
        <p>Esta acción eliminará <strong>TODO</strong> el historial de partidas del sistema, incluyendo:</p>
        <ul>
          <li>Resultados de partidas</li>
          <li>Participaciones</li>
          <li>Logros obtenidos</li>
        </ul>
        <p style="color: #dc3545; font-weight: bold;">Esta acción no se puede deshacer.</p>
      </div>
      <div id="timer" style="font-weight: bold; color: #dc3545; margin: 10px 0;">
        El botón se habilitará en 5 segundos...
      </div>
    `,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Confirmar (5s)',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#d33',
    allowOutsideClick: false,
    allowEscapeKey: false,
    focusConfirm: false,
    didOpen: () => {
      const confirmButton = Swal.getConfirmButton();
      confirmButton.disabled = true;
      
      let seconds = 5;
      timerInterval = setInterval(() => {
        Swal.getHtmlContainer().querySelector('#timer').textContent = 
          `El botón se habilitará en ${seconds} segundo${seconds !== 1 ? 's' : ''}...`;
        seconds--;
        
        if (seconds < 0) {
          clearInterval(timerInterval);
          confirmButton.disabled = false;
          confirmButton.textContent = 'Confirmar';
          Swal.getHtmlContainer().querySelector('#timer').textContent = '¡Ahora puedes confirmar!';
        }
      }, 1000);
    },
    willClose: () => {
      clearInterval(timerInterval);
    }
  });

  if (result.isConfirmed) {
    try {
      const apiUrl = process.env.REACT_APP_API_URL;
      const response = await fetch(`${apiUrl}/historial_D`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error('Error al limpiar historial');
      }

      Swal.fire('Éxito', 'Todo el historial ha sido eliminado', 'success');
      fetchHistorial(); // Actualizar la vista si estamos en la pestaña de historial
    } catch (error) {
      console.error("Error al limpiar historial:", error);
      Swal.fire('Error', 'No se pudo eliminar el historial', 'error');
    }
  }
};

// Eliminar todos los estudiantes
const handleDeleteAllStudents = async () => {
  let timerInterval;
  const result = await Swal.fire({
    title: '¿Eliminar todos los estudiantes?',
    html: `
      <div style="text-align: left; margin: 15px 0;">
        <p>Esta acción eliminará <strong>TODOS</strong> los estudiantes del sistema, incluyendo:</p>
        <ul>
          <li>Sus participaciones en partidas</li>
          <li>Resultados obtenidos</li>
          <li>Logros conseguidos</li>
          <li>Vinculaciones a cursos</li>
        </ul>
        <p style="color: #dc3545; font-weight: bold;">Esta acción no se puede deshacer.</p>
      </div>
      <div id="timer" style="font-weight: bold; color: #dc3545; margin: 10px 0;">
        El botón se habilitará en 5 segundos...
      </div>
    `,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Confirmar (5s)',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#d33',
    allowOutsideClick: false,
    allowEscapeKey: false,
    focusConfirm: false,
    didOpen: () => {
      const confirmButton = Swal.getConfirmButton();
      confirmButton.disabled = true;
      
      let seconds = 5;
      timerInterval = setInterval(() => {
        Swal.getHtmlContainer().querySelector('#timer').textContent = 
          `El botón se habilitará en ${seconds} segundo${seconds !== 1 ? 's' : ''}...`;
        seconds--;
        
        if (seconds < 0) {
          clearInterval(timerInterval);
          confirmButton.disabled = false;
          confirmButton.textContent = 'Confirmar';
          Swal.getHtmlContainer().querySelector('#timer').textContent = '¡Ahora puedes confirmar!';
        }
      }, 1000);
    },
    willClose: () => {
      clearInterval(timerInterval);
    }
  });

  if (result.isConfirmed) {
    try {
      const apiUrl = process.env.REACT_APP_API_URL;
      const response = await fetch(`${apiUrl}/estudiantes_D`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error('Error al eliminar estudiantes');
      }

      Swal.fire('Éxito', 'Todos los estudiantes han sido eliminados', 'success');
      if (selectedTab === 'users') fetchUsers(); // Actualizar lista de usuarios
    } catch (error) {
      console.error("Error al eliminar estudiantes:", error);
      Swal.fire('Error', 'No se pudieron eliminar los estudiantes', 'error');
    }
  }
};

// Eliminar todos los profesores
const handleDeleteAllProfessors = async () => {
  let timerInterval;
  const result = await Swal.fire({
    title: '¿Eliminar todos los profesores?',
    html: `
      <div style="text-align: left; margin: 15px 0;">
        <p>Esta acción eliminará <strong>TODOS</strong> los profesores del sistema, incluyendo:</p>
        <ul>
          <li>Sus personalizaciones</li>
          <li>Partidas creadas</li>
          <li>Resultados asociados</li>
          <li>Vinculaciones a cursos</li>
        </ul>
        <p style="color: #dc3545; font-weight: bold;">Esta acción no se puede deshacer.</p>
      </div>
      <div id="timer" style="font-weight: bold; color: #dc3545; margin: 10px 0;">
        El botón se habilitará en 5 segundos...
      </div>
    `,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Confirmar (5s)',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#d33',
    allowOutsideClick: false,
    allowEscapeKey: false,
    focusConfirm: false,
    didOpen: () => {
      const confirmButton = Swal.getConfirmButton();
      confirmButton.disabled = true;
      
      let seconds = 5;
      timerInterval = setInterval(() => {
        Swal.getHtmlContainer().querySelector('#timer').textContent = 
          `El botón se habilitará en ${seconds} segundo${seconds !== 1 ? 's' : ''}...`;
        seconds--;
        
        if (seconds < 0) {
          clearInterval(timerInterval);
          confirmButton.disabled = false;
          confirmButton.textContent = 'Confirmar';
          Swal.getHtmlContainer().querySelector('#timer').textContent = '¡Ahora puedes confirmar!';
        }
      }, 1000);
    },
    willClose: () => {
      clearInterval(timerInterval);
    }
  });

  if (result.isConfirmed) {
    try {
      const apiUrl = process.env.REACT_APP_API_URL;
      const response = await fetch(`${apiUrl}/profesores_D`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error('Error al eliminar profesores');
      }

      Swal.fire('Éxito', 'Todos los profesores han sido eliminados', 'success');
      if (selectedTab === 'users') fetchUsers(); // Actualizar lista de usuarios
    } catch (error) {
      console.error("Error al eliminar profesores:", error);
      Swal.fire('Error', 'No se pudieron eliminar los profesores', 'error');
    }
  }
};

// Reiniciar sistema completo
const handleResetSystem = async () => {
  let timerInterval;
  const { value: password } = await Swal.fire({
    title: '¡PELIGRO - REINICIAR SISTEMA COMPLETO!',
    html: `
      <div style="text-align: left; margin: 15px 0;">
        <p>Esta acción eliminará <strong>TODOS</strong> los datos del sistema excepto administradores, incluyendo:</p>
        <ul>
          <li>Todos los estudiantes y profesores</li>
          <li>Todas las personalizaciones</li>
          <li>Todas las partidas y resultados</li>
          <li>Toda la bitácora</li>
          <li>Todo el historial</li>
        </ul>
        <p style="color: #dc3545; font-weight: bold;">ESTA ACCIÓN ES IRREVERSIBLE Y DEJA EL SISTEMA EN ESTADO INICIAL.</p>
      </div>
      <div id="timer" style="font-weight: bold; color: #dc3545; margin: 10px 0;">
        El botón se habilitará en 10 segundos...
      </div>
      <input type="password" id="password" class="swal2-input" placeholder="Ingresa 'fidecolab' para confirmar">
    `,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Confirmar (10s)',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#d33',
    allowOutsideClick: false,
    allowEscapeKey: false,
    focusConfirm: false,
    preConfirm: () => {
      const passwordInput = document.getElementById('password').value;
      if (passwordInput.toLowerCase() !== 'fidecolab') {
        Swal.showValidationMessage('Código incorrecto');
        return false;
      }
      return passwordInput;
    },
    didOpen: () => {
      const confirmButton = Swal.getConfirmButton();
      confirmButton.disabled = true;
      
      let seconds = 10;
      timerInterval = setInterval(() => {
        Swal.getHtmlContainer().querySelector('#timer').textContent = 
          `El botón se habilitará en ${seconds} segundo${seconds !== 1 ? 's' : ''}...`;
        seconds--;
        
        if (seconds < 0) {
          clearInterval(timerInterval);
          confirmButton.disabled = false;
          confirmButton.textContent = 'Confirmar';
          Swal.getHtmlContainer().querySelector('#timer').textContent = '¡Ahora puedes confirmar!';
        }
      }, 1000);
    },
    willClose: () => {
      clearInterval(timerInterval);
    }
  });

  if (!password) return;

  try {
    const apiUrl = process.env.REACT_APP_API_URL;
    // Primero eliminamos todo el historial
    await fetch(`${apiUrl}/historial_D`, {
      method: "DELETE",
      credentials: "include",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    // Luego eliminamos toda la bitácora
    await fetch(`${apiUrl}/bitacora_D`, {
      method: "DELETE",
      credentials: "include",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    // Eliminamos todas las personalizaciones
    await fetch(`${apiUrl}/personalizaciones_D`, {
      method: "DELETE",
      credentials: "include",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    // Eliminamos todos los profesores
    await fetch(`${apiUrl}/profesores_D`, {
      method: "DELETE",
      credentials: "include",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    // Finalmente eliminamos todos los estudiantes
    await fetch(`${apiUrl}/estudiantes_D`, {
      method: "DELETE",
      credentials: "include",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    Swal.fire('Sistema Reiniciado', 'El sistema ha sido reiniciado completamente', 'success');
    if (selectedTab === 'users') fetchUsers();
    if (selectedTab === 'history') fetchHistorial();
    if (selectedTab === 'logs') fetchLogs();
  } catch (error) {
    console.error("Error al reiniciar sistema:", error);
    Swal.fire('Error', 'Ocurrió un error al reiniciar el sistema', 'error');
  }
};

  // Add new user
  const handleAddUser = async () => {
  const { value: formValues } = await Swal.fire({
    title: 'Agregar Nuevo Usuario',
    customClass: { popup: 'alert__add' },
    html: `
      <div class="add__form">
        <input id="swal-input1" class="add__input" placeholder="Nombre" required>
        <input id="swal-input2" class="add__input" placeholder="Primer Apellido" required>
        <input id="swal-input3" class="add__input" placeholder="Segundo Apellido" required>
        <input id="swal-input4" class="add__input" placeholder="Correo electrónico" type="email" required>
        <select id="swal-input5" class="add__select">
          <option value="">Género</option>
          <option value="1">Masculino</option>
          <option value="2">Femenino</option>
          <option value="3">Otro</option>
        </select>
        <select id="swal-input6" class="add__select" required>
          <option value="">Seleccione Rol</option>
          <option value="Profesor">Profesor</option>
          <option value="Estudiante">Estudiante</option>
          <option value="Administrador">Administrador</option>
        </select>
      </div>        
    `,
    focusConfirm: false,
    confirmButtonColor: '#1935ca',
    cancelButtonColor: '#f2a007',
    showCancelButton: true,
    confirmButtonText: 'Agregar',
    cancelButtonText: 'Cancelar',
    preConfirm: async () => {
      const nombre = document.getElementById('swal-input1').value.trim();
      const apellido1 = document.getElementById('swal-input2').value.trim();
      const apellido2 = document.getElementById('swal-input3').value.trim();
      const correo = document.getElementById('swal-input4').value.trim();
      const genero = document.getElementById('swal-input5').value;
      const rol = document.getElementById('swal-input6').value;

      if (!nombre || !apellido1 || !apellido2 || !correo || !genero || !rol) {
        Swal.showValidationMessage('Todos los campos son obligatorios');
        return false;
      }

      // 🔑 Si es administrador, pedimos el código ANTES de devolver el objeto
      if (rol === 'Administrador') {
        const { value: code } = await Swal.fire({
          title: 'Confirmación requerida',
          text: 'Para crear un usuario administrador, ingrese el código de seguridad',
          input: 'text',
          inputPlaceholder: 'Código de seguridad',
          width: '600px',
          showCancelButton: true,
          confirmButtonText: 'Confirmar',
          cancelButtonText: 'Cancelar',
          confirmButtonColor: '#3085d6',
          preConfirm: (code) => {
            if (code !== 'fidecolab') {
              Swal.showValidationMessage('Código incorrecto');
              return false;
            }
            return code;
          }
        });

        if (!code) return false; // canceló
      }

      // 🔥 devolver objeto correcto
      return { nombre, apellido1, apellido2, correo, genero: parseInt(genero, 10), rol };
    }
  });

  if (!formValues) return;

  console.log("Agregando usuario:", formValues);

  try {
    const apiUrl = process.env.REACT_APP_API_URL;
    const response = await fetch(`${apiUrl}/usuarios_D`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(formValues)
    });

    if (!response.ok) throw new Error('Error al agregar usuario');

    await response.json();
    Swal.fire('Éxito', 'Usuario agregado correctamente, se le envió un correo al usuario con su contraseña', 'success');
    fetchUsers();
  } catch (error) {
    console.error("Error al agregar usuario:", error);
    Swal.fire('Error', 'No se pudo agregar el usuario', 'error');
  }
};


  const handleDeleteItem = (itemType, id) => {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `Esta acción eliminará el ${itemType} seleccionado`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire('Eliminado', `El ${itemType} ha sido eliminado`, 'success');
      }
    });
  };

  // Edit user
  const handleEditUser = async (user) => {
    // Verificar si el usuario es administrador
    const isAdmin = user.Rol === 'Administrador';

    // Obtener grupos del usuario si no es admin
    let userGroups = [];
    if (!isAdmin) {
      try {
        const apiUrl = process.env.REACT_APP_API_URL;
        const response = await fetch(`${apiUrl}/usuarios_D/${user.id}/grupos`, {
          method: "GET",
          credentials: "include",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });

        if (response.ok) {
          const data = await response.json();
          userGroups = data.grupos || [];
        }
      } catch (error) {
        console.error("Error al obtener grupos del usuario:", error);
      }
    }

    // Verificar si se debe mostrar el botón de agregar curso
    const showAddCourseBtn = !isAdmin && (
      user.Rol === 'Profesor' ||
      (user.Rol === 'Estudiante' && userGroups.length === 0)
    );

    // Crear el HTML para la tabla de grupos
    const groupsTableHtml = !isAdmin ? `
      <div class="edit__courses">
        <div class="courses__row">
          <span class="edit__label">Cursos Vinculados</span>
          ${showAddCourseBtn ? `
            <button id="add-course-btn" class="edit__button">
              <i class="fa-solid fa-plus"></i> Agregar Curso
            </button>
          ` : ''}
        </div>
        <div class="edit__chart">
          <table class="chart__table">
            <thead>
              <tr class="chart__row">
                <th class="chart__heading">Código</th>
                <th class="chart__heading">Nombre</th>
                <th class="chart__heading">Grupo</th>
                <th class="chart__heading">Acciones</th>
              </tr>
            </thead>
            <tbody class="chart__body">
              ${userGroups.length > 0 ?
                userGroups.map(group => `
                  <tr class="chart__row">
                    <td class="chart__data">${group.codigo}</td>
                    <td class="chart__data">${group.nombre}</td>
                    <td class="chart__data">G${group.grupo}</td>
                    <td class="chart__data">
                      <button 
                        data-group-id="${group.id}"
                        class="chart__button danger">
                        <i class="fa-solid fa-link-slash"></i>
                      </button>
                    </td>
                  </tr>
                `).join('') : `
                  <tr>
                    <td colspan="4" class="data__empty">
                      No hay cursos vinculados
                    </td>
                  </tr>
                `}
            </tbody>
          </table>
        </div>
      </div>
    ` : '';

    // Crear el HTML para los botones de acciones especiales
    const specialActionsHtml = !isAdmin ? `
      <div class="buttons__group">
        ${user.Rol === 'Profesor' ? `
          <button id="delete-customizations-btn" class="edit__button danger">
            <i class="fa-solid fa-trash"></i> Eliminar Personalizaciones
          </button>
          <button id="delete-matches-btn" class="edit__button danger">
            <i class="fa-solid fa-gamepad"></i> Eliminar Partidas
          </button>
        ` : ''}
        ${user.Rol === 'Estudiante' ? `
          <button id="reset-achievements-btn" class="edit__button danger">
            <i class="fa-solid fa-trophy"></i> Reiniciar Logros
          </button>
        ` : ''}
      </div>
    ` : '';

    const { value: formValues, isConfirmed } = await Swal.fire({
      title: `Editar Usuario ${user.Nombre}`,
      customClass: {
        popup: 'alert__edituser'
      },
      html: `
        <div class="edit__row">
          <div class="edit__group">
            <label class="edit__label">Nombre</label>
            <input class="edit__input" id="swal-input1" placeholder="Nombre" value="${user.Nombre}" required>
          </div>
          <div class="edit__group">
            <label class="edit__label">Primer Apellido</label>
            <input class="edit__input" id="swal-input2" placeholder="Primer Apellido" value="${user.Apellido1}" required>
          </div>
          <div class="edit__group">
            <label class="edit__label">Segundo Apellido</label>
            <input class="edit__input" id="swal-input3" class="swal2-input" placeholder="Segundo Apellido" value="${user.Apellido2}" required>
          </div>
        </div>
        <div class="edit__row">
          <div class="edit__group">
            <label class="edit__label">Género</label>
            <select class="edit__select" id="swal-input5" required>
              <option value="3">Indefinido</option>
              <option value="1" ${user.Genero === '1' ? 'selected' : ''}>Masculino</option>
              <option value="2" ${user.Genero === '2' ? 'selected' : ''}>Femenino</option>
            </select>
          </div>
          <div class="edit__group">
            <label class="edit__label">Rol</label>
            ${
              user.Rol === 'Administrador'
                ? `
                  <select class="edit__select" id="swal-input6" disabled>
                    <option value="Administrador" selected>Administrador</option>
                  </select>
                `
                : `
                  <select class="edit__select" id="swal-input6" required>
                    <option value="Profesor" ${user.Rol === 'Profesor' ? 'selected' : ''}>Profesor</option>
                    <option value="Estudiante" ${user.Rol === 'Estudiante' ? 'selected' : ''}>Estudiante</option>
                  </select>
                `
            }
          </div>
        </div>
        <div class="edit__row">        
          <div class="edit__group">
            <label class="edit__label">Correo</label>
            <input class="edit__input" id="swal-input4" class="swal2-input" placeholder="Correo" value="${user.Correo}" disabled>
          </div>    
          <div class="edit__group">
            <label class="edit__label">Acciones</label>
            <button id="reset-password-btn" class="edit__button aqua">
              <i class="fa-solid fa-key"></i> Restaurar Contraseña
            </button>
          </div>
        </div>
        ${groupsTableHtml}
        ${specialActionsHtml}        
      `,
      focusConfirm: false,
      confirmButtonText: 'Guardar cambios',
      cancelButtonText: 'Cancelar',
      showDenyButton: true,
      denyButtonText: 'Descartar cambios',
      preConfirm: () => {
        const nombre = document.getElementById('swal-input1').value;
        const apellido1 = document.getElementById('swal-input2').value;
        const apellido2 = document.getElementById('swal-input3').value;
        const genero = document.getElementById('swal-input5').value;
        const rol = document.getElementById('swal-input6').value;

        // Check if any changes were made
        const changesMade =
          nombre !== user.Nombre ||
          apellido1 !== user.Apellido1 ||
          apellido2 !== user.Apellido2 ||
          genero !== user.Genero ||
          rol !== user.Rol;

        if (!changesMade) {
          Swal.showValidationMessage('No se realizaron cambios');
          return false;
        }

        return { nombre, apellido1, apellido2, genero, rol };
      },
      willOpen: () => {
        // Event listener para el botón de restaurar contraseña
        document.getElementById('reset-password-btn').addEventListener('click', async (e) => {
          e.preventDefault();
          const result = await Swal.fire({
            title: '¿Restaurar contraseña?',
            text: 'Se generará una nueva contraseña aleatoria y se enviará al correo del usuario',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Confirmar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#3085d6'
          });

          if (result.isConfirmed) {
            try {
              const apiUrl = process.env.REACT_APP_API_URL;
              const response = await fetch(`${apiUrl}/usuarios_D/${user.id}/restaurar-contrasena`, {
                method: "POST",
                credentials: "include",
                headers: {
                  "Authorization": `Bearer ${token}`,
                  "Content-Type": "application/json"
                }
              });

              if (!response.ok) {
                throw new Error('Error al restaurar contraseña');
              }

              Swal.fire('Éxito', 'Contraseña restablecida y correo enviado al usuario', 'success');
            } catch (error) {
              console.error("Error al restaurar contraseña:", error);
              Swal.fire('Error', 'No se pudo restaurar la contraseña', 'error');
            }
          }
        });

        // Event listeners para los botones de desvincular curso
        document.querySelectorAll('.unlink-course-btn').forEach(btn => {
          btn.addEventListener('click', async (e) => {
            e.preventDefault();
            const groupId = e.currentTarget.getAttribute('data-group-id');

            const result = await Swal.fire({
              title: '¿Desvincular curso?',
              text: '¿Estás seguro que deseas desvincular al usuario de este curso?',
              icon: 'warning',
              showCancelButton: true,
              confirmButtonText: 'Sí, desvincular',
              cancelButtonText: 'Cancelar',
              confirmButtonColor: '#d33'
            });

            if (result.isConfirmed) {
              try {
                const apiUrl = process.env.REACT_APP_API_URL;
                const response = await fetch(`${apiUrl}/usuarios_D/${user.id}/grupos/${groupId}`, {
                  method: "DELETE",
                  credentials: "include",
                  headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                  }
                });

                if (!response.ok) {
                  throw new Error('Error al desvincular curso');
                }

                Swal.fire('Éxito', 'Usuario desvinculado del curso correctamente', 'success');
                handleEditUser(user); // Recargar la ventana de edición
              } catch (error) {
                console.error("Error al desvincular curso:", error);
                Swal.fire('Error', 'No se pudo desvincular el curso', 'error');
              }
            }
          });
        });

        // Event listener para el botón de agregar curso
        if (document.getElementById('add-course-btn')) {
          document.getElementById('add-course-btn').addEventListener('click', async (e) => {
            e.preventDefault();

            try {
              // Obtener todos los grupos disponibles
              const apiUrl = process.env.REACT_APP_API_URL;
              const response = await fetch(`${apiUrl}/grupos_D`, {
                method: "GET",
                credentials: "include",
                headers: {
                  "Authorization": `Bearer ${token}`,
                  "Content-Type": "application/json"
                }
              });

              if (!response.ok) {
                throw new Error('Error al obtener grupos');
              }

              const { grupos } = await response.json();

              // Filtrar grupos a los que el usuario no está vinculado y ordenar alfabéticamente
              const availableGroups = grupos
                .filter(group => !userGroups.some(userGroup => userGroup.id === group.id))
                .sort((a, b) => a.nombreCompleto.localeCompare(b.nombreCompleto));

              if (availableGroups.length === 0) {
                Swal.fire('Info', 'No hay cursos disponibles para vincular', 'info');
                return;
              }

              // Crear un diálogo con buscador para los cursos
              const { value: selectedGroupId } = await Swal.fire({
                title: 'Seleccionar curso',
                html: `
                  <input id="course-search" type="text" placeholder="Buscar curso..." 
                    style="width: 100%; padding: 10px; margin-bottom: 10px; border-radius: 5px; border: 1px solid #ddd;">
                  <div style="max-height: 300px; overflow-y: auto;">
                    <select id="course-select" size="8" style="width: 100%; border-radius: 5px; border: 1px solid #ddd;">
                      ${availableGroups.map(group => `
                        <option value="${group.id}">${group.nombreCompleto}</option>
                      `).join('')}
                    </select>
                  </div>
                `,
                focusConfirm: false,
                showCancelButton: true,
                confirmButtonText: 'Vincular',
                cancelButtonText: 'Cancelar',
                preConfirm: () => {
                  const select = document.getElementById('course-select');
                  return select.value;
                },
                didOpen: () => {
                  const searchInput = document.getElementById('course-search');
                  const select = document.getElementById('course-select');

                  searchInput.addEventListener('input', (e) => {
                    const searchTerm = e.target.value.toLowerCase();
                    Array.from(select.options).forEach(option => {
                      const text = option.text.toLowerCase();
                      option.style.display = text.includes(searchTerm) ? 'block' : 'none';
                    });
                  });
                }
              });

              if (selectedGroupId) {
                // Vincular el usuario al grupo seleccionado
                const linkResponse = await fetch(`${apiUrl}/usuarios_D/${user.id}/grupos/${selectedGroupId}`, {
                  method: "POST",
                  credentials: "include",
                  headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                  }
                });

                if (!linkResponse.ok) {
                  const errorData = await linkResponse.json();
                  throw new Error(errorData.message || 'Error al vincular curso');
                }

                Swal.fire('Éxito', 'Usuario vinculado al curso correctamente', 'success');
                handleEditUser(user); // Recargar la ventana de edición
              }
            } catch (error) {
              console.error("Error al vincular curso:", error);
              Swal.fire('Error', error.message || 'No se pudo vincular el curso', 'error');
            }
          });
        }

        // Event listeners para los botones de acciones especiales
        if (document.getElementById('delete-customizations-btn')) {
          document.getElementById('delete-customizations-btn').addEventListener('click', async (e) => {
            e.preventDefault();
            const result = await Swal.fire({
              title: '¿Eliminar personalizaciones?',
              text: 'Se eliminarán todas las personalizaciones del profesor y sus dependencias',
              icon: 'warning',
              showCancelButton: true,
              confirmButtonText: 'Sí, eliminar',
              cancelButtonText: 'Cancelar',
              confirmButtonColor: '#d33'
            });

            if (result.isConfirmed) {
              try {
                const apiUrl = process.env.REACT_APP_API_URL;
                const response = await fetch(`${apiUrl}/profesores_D/${user.id}/personalizaciones`, {
                  method: "DELETE",
                  credentials: "include",
                  headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                  }
                });

                if (!response.ok) {
                  throw new Error('Error al eliminar personalizaciones');
                }

                Swal.fire('Éxito', 'Personalizaciones eliminadas correctamente', 'success');
              } catch (error) {
                console.error("Error al eliminar personalizaciones:", error);
                Swal.fire('Error', 'No se pudieron eliminar las personalizaciones', 'error');
              }
            }
          });
        }

        if (document.getElementById('delete-matches-btn')) {
          document.getElementById('delete-matches-btn').addEventListener('click', async (e) => {
            e.preventDefault();
            const result = await Swal.fire({
              title: '¿Eliminar partidas?',
              text: 'Se eliminarán todas las partidas del profesor y sus dependencias',
              icon: 'warning',
              showCancelButton: true,
              confirmButtonText: 'Sí, eliminar',
              cancelButtonText: 'Cancelar',
              confirmButtonColor: '#d33'
            });

            if (result.isConfirmed) {
              try {
                const apiUrl = process.env.REACT_APP_API_URL;
                const response = await fetch(`${apiUrl}/profesores_D/${user.id}/partidas`, {
                  method: "DELETE",
                  credentials: "include",
                  headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                  }
                });

                if (!response.ok) {
                  throw new Error('Error al eliminar partidas');
                }

                Swal.fire('Éxito', 'Partidas eliminadas correctamente', 'success');
              } catch (error) {
                console.error("Error al eliminar partidas:", error);
                Swal.fire('Error', 'No se pudieron eliminar las partidas', 'error');
              }
            }
          });
        }

        if (document.getElementById('reset-achievements-btn')) {
          document.getElementById('reset-achievements-btn').addEventListener('click', async (e) => {
            e.preventDefault();
            const result = await Swal.fire({
              title: '¿Reiniciar logros?',
              text: 'Se eliminarán todos los logros del estudiante',
              icon: 'warning',
              showCancelButton: true,
              confirmButtonText: 'Sí, reiniciar',
              cancelButtonText: 'Cancelar',
              confirmButtonColor: '#d33'
            });

            if (result.isConfirmed) {
              try {
                const apiUrl = process.env.REACT_APP_API_URL;
                const response = await fetch(`${apiUrl}/estudiantes_D/${user.id}/logros`, {
                  method: "DELETE",
                  credentials: "include",
                  headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                  }
                });

                if (!response.ok) {
                  throw new Error('Error al reiniciar logros');
                }

                Swal.fire('Éxito', 'Logros reiniciados correctamente', 'success');
              } catch (error) {
                console.error("Error al reiniciar logros:", error);
                Swal.fire('Error', 'No se pudieron reiniciar los logros', 'error');
              }
            }
          });
        }
      }
    });

    if (!formValues || !isConfirmed) return;

    try {
      const apiUrl = process.env.REACT_APP_API_URL;
      const response = await fetch(`${apiUrl}/usuarios_D/${user.id}`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          nombre: formValues.nombre,
          apellido1: formValues.apellido1,
          apellido2: formValues.apellido2,
          rol: formValues.rol,
          genero: formValues.genero
        })
      });

      if (!response.ok) {
        throw new Error('Error al actualizar usuario');
      }

      Swal.fire('Éxito', 'Usuario actualizado correctamente', 'success');
      fetchUsers();
    } catch (error) {
      console.error("Error al actualizar usuario:", error);
      Swal.fire('Error', 'No se pudo actualizar el usuario', 'error');
    }
  };

  // Restore password
  const handleRestorePassword = async (userId) => {
    const result = await Swal.fire({
      title: '¿Restaurar contraseña?',
      text: 'Se generará una nueva contraseña aleatoria y se enviará al correo del usuario',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Confirmar',
      cancelButtonText: 'Cancelar'
    });

    if (!result.isConfirmed) return;

    try {
      const apiUrl = process.env.REACT_APP_API_URL;
      const response = await fetch(`${apiUrl}/usuarios_D/${userId}/restaurar-contrasena`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error('Error al restaurar contraseña');
      }

      Swal.fire('Éxito', 'Contraseña restablecida y correo enviado al usuario', 'success');
    } catch (error) {
      console.error("Error al restaurar contraseña:", error);
      Swal.fire('Error', 'No se pudo restaurar la contraseña', 'error');
    }
  };

  // Toggle user status
  const handleToggleUserStatus = async (user) => {
    const newStatus = user.Estado ? 0 : 1;
    const action = newStatus ? 'activar' : 'desactivar';

    const result = await Swal.fire({
      title: `¿${newStatus ? 'Activar' : 'Desactivar'} usuario?`,
      text: `Estás a punto de ${action} al usuario ${user.Nombre}`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Confirmar',
      cancelButtonText: 'Cancelar'
    });

    if (!result.isConfirmed) return;

    try {
      const apiUrl = process.env.REACT_APP_API_URL;
      const response = await fetch(`${apiUrl}/usuarios_D/${user.id}/desactivar`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          estado: newStatus
        })
      });

      if (!response.ok) {
        throw new Error(`Error al ${action} usuario`);
      }

      Swal.fire('Éxito', `Usuario ${action}do correctamente`, 'success');
      fetchUsers();
    } catch (error) {
      console.error(`Error al ${action} usuario:`, error);
      Swal.fire('Error', `No se pudo ${action} el usuario`, 'error');
    }
  };

  // Delete user
  const handleDeleteUser = async (user) => {
    const result = await Swal.fire({
      title: '¿Eliminar usuario?',
      html: `Estás a punto de eliminar permanentemente al usuario <strong>${user.Nombre} ${user.Apellido1}</strong>.<br><br>
            <strong>ADVERTENCIA:</strong> Esta acción eliminará toda la información asociada al usuario y no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Confirmar eliminación',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33',
      focusCancel: true
    });

    if (!result.isConfirmed) return;

    try {
      const apiUrl = process.env.REACT_APP_API_URL;
      console.log("User ID being sent:", user.id || user.Usuario_ID_PK);
      const response = await fetch(`${apiUrl}/usuarios_D/${user.id}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error('Error al eliminar usuario');
      }

      Swal.fire('Eliminado', 'El usuario ha sido eliminado correctamente', 'success');
      fetchUsers();
    } catch (error) {
      console.error("Error al eliminar usuario:", error);
      Swal.fire('Error', 'No se pudo eliminar el usuario', 'error');
    }
  };

  // View user details
  const viewUserDetails = async (user) => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL;
      const response = await fetch(`${apiUrl}/usuarios_D/${user.id}`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error('Error al obtener detalles del usuario');
      }

      const { data: userDetails } = await response.json();

      // Build HTML content based on user role
      let detailsContent = `
        <div class="details__title">
          <h3>Información Básica</h3>
        </div>
        
        <div class="details__data">
          <p><strong>Nombre:</strong> ${user.Nombre} ${user.Apellido1} ${user.Apellido2 || ''}</p>
          <p><strong>Correo:</strong> ${user.Correo}</p>
          <p><strong>Género:</strong> ${user.Genero === '1' ? 'Masculino' : user.Genero === '2' ? 'Femenino' : 'Otro'}</p>
          <p><strong>Rol:</strong> ${user.Rol}</p>
        </div>
        
        <div class="details__status"
             style="background-color: ${user.Estado ? '#d4edda' : '#f8d7da'}; color: ${user.Estado ? '#155724' : '#721c24'};">
          <strong>Estado:</strong> ${user.Estado ? 'Activo' : 'Inactivo'}
        </div>
      `;

      if (user.Rol === 'Estudiante') {
        detailsContent += `
          <div class="details__title">
            <h3>Estadísticas</h3>
          </div>
          <div class="details__data">
            <p><strong>Partidas jugadas:</strong> ${userDetails.totalPartidas || 0}</p>
            <p><strong>Cursos vinculados:</strong> ${userDetails.cursos || 'Ninguno'}</p>
          </div>
        `;
      } else if (user.Rol === 'Profesor') {
        detailsContent += `
          <div class="details__title">
            <h3>Estadísticas</h3>
          </div>
          <div class="details__data">
            <p><strong>Personalizaciones activas:</strong> ${userDetails.totalPersonalizaciones || 0}</p>
            <p><strong>Cursos que imparte:</strong> ${userDetails.cursos || 'Ninguno'}</p>
          </div>
        `;

        if (userDetails.estudiantes && userDetails.estudiantes.length > 0) {
          detailsContent += `
            <div class="details__students">
              <div class="details__header">
                <h3>Estudiantes Vinculados</h3>
                <input class="details__input" type="text" id="student-search" placeholder="Buscar estudiante...">
              </div>
              <div class="details__chart">
                <table class="details__table">
                  <thead>
                    <tr class="details__row" style="background-color: #17a2b8; color: white;">
                      <th class="details__heading">Nombre</th>
                      <th class="details__heading">Correo</th>
                      <th class="details__heading">Curso</th>
                    </tr>
                  </thead>
                  <tbody class="details__body" id="student-table-body">
                    ${userDetails.estudiantes.map(estudiante => `
                      <tr class="details__row">
                        <td class="details__info">${estudiante.Nombre} ${estudiante.Apellido1} ${estudiante.Apellido2 || ''}</td>
                        <td class="details__info">${estudiante.Correo}</td>
                        <td class="details__info">${estudiante.Nombre_Curso} G${estudiante.Codigo_Grupo}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>
          `;
        }
      }

      // Show user's log
      if (userDetails.bitacora && userDetails.bitacora.length > 0) {
        detailsContent += `
          <div style="text-align: center; background-color: #f8f9fa; padding: 10px; border-radius: 5px;">
            <h3 style="margin: 0; color: #2c3e50;">Bitácora (Últimas 10 acciones)</h3>
          </div>
          <div style="max-height: 300px; overflow-y: auto;">
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background-color: #6c757d; color: white;">
                  <th style="padding: 10px; border: 1px solid #ddd;">Fecha</th>
                  <th style="padding: 10px; border: 1px solid #ddd;">Acción</th>
                  <th style="padding: 10px; border: 1px solid #ddd;">Error</th>
                </tr>
              </thead>
              <tbody>
                ${userDetails.bitacora.map(log => `
                  <tr>
                    <td style="padding: 8px; border: 1px solid #ddd;">${new Date(log.Fecha).toLocaleString()}</td>
                    <td style="padding: 8px; border: 1px solid #ddd;">${log.Accion}</td>
                    <td style="padding: 8px; border: 1px solid #ddd; color: ${log.Error ? '#dc3545' : '#28a745'};">${log.Error || 'Ninguno'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `;
      }

      Swal.fire({
        title: `Detalles de ${user.Nombre}`,
        customClass: {
          popup: 'alert__details'
        },
        html: detailsContent,
        width: '900px',
        confirmButtonText: 'Cerrar',
        confirmButtonColor: '#3085d6',
        willOpen: () => {
          // Add search functionality if there are students
          if (userDetails.estudiantes && userDetails.estudiantes.length > 0) {
            const searchInput = document.getElementById('student-search');
            const tableBody = document.getElementById('student-table-body');
            const rows = tableBody.getElementsByTagName('tr');

            searchInput.addEventListener('input', (e) => {
              const searchTerm = e.target.value.toLowerCase();

              Array.from(rows).forEach(row => {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(searchTerm) ? '' : 'none';
              });
            });
          }
        }
      });
    } catch (error) {
      console.error("Error al obtener detalles del usuario:", error);
      Swal.fire('Error', 'No se pudieron obtener los detalles del usuario', 'error');
    }
  };

  // Unlink users
  const handleUnlinkUsers = () => {
    Swal.fire({
      title: 'Desvincular Usuarios',
      customClass: {
        popup: 'alert__unlink'
      },
      html: `
        <div class="unlink__group">
          <button id="professors-btn" class="unlink__button unlink--teacher">
            <i class="fa-solid fa-user-tie"></i> Desvincular Profesores
          </button>
          <button id="students-btn" class="unlink__button unlink--student">
            <i class="fa-solid fa-user-graduate"></i> Desvincular Estudiantes
          </button>
          <button id="all-users-btn" class="unlink__button unlink--user">
            <i class="fa-solid fa-users-slash"></i> Desvincular Todos los Usuarios
          </button>
        </div>
      `,
      showConfirmButton: false,
      showCancelButton: true,
      cancelButtonText: 'Cancelar',
      willOpen: () => {
        document.getElementById('professors-btn').addEventListener('click', () => {
          Swal.fire('Éxito', 'Todos los profesores han sido desvinculados', 'success');
          Swal.close();
        });

        document.getElementById('students-btn').addEventListener('click', () => {
          Swal.fire('Éxito', 'Todos los estudiantes han sido desvinculados', 'success');
          Swal.close();
        });

        document.getElementById('all-users-btn').addEventListener('click', () => {
          Swal.fire({
            title: '¡PELIGRO!',
            text: 'Esta acción desvinculará TODOS los usuarios y no se puede deshacer',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Confirmar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#d33',
            width: '600px',
            timer: 15000,
            timerProgressBar: true,
          }).then((result) => {
            if (result.isConfirmed) {
              Swal.fire('Éxito', 'Todos los usuarios han sido desvinculados', 'success');
            }
          });
        });
      }
    });
  };

  // Access system clean
  const accessSystemClean = () => {
    Swal.fire({
      title: 'Acceso a Limpieza del Sistema',
      text: 'Ingrese el código de seguridad para continuar',
      input: 'text',
      inputPlaceholder: 'Código',
      showCancelButton: true,
      confirmButtonText: 'Continuar',
      cancelButtonText: 'Cancelar',
      preConfirm: (input) => {
        if (input.toLowerCase() !== 'fidecolab') {
          Swal.showValidationMessage('Código incorrecto');
        }
      }
    }).then((result) => {
      if (result.isConfirmed) {
        setShowSystemClean(true);
      }
    });
  };

  // Fetch historial from API
  const fetchHistorial = async () => {
    setLoading(true);
    try {
      const apiUrl = process.env.REACT_APP_API_URL;
      const response = await fetch(`${apiUrl}/historial_partidas_D`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error('Error al obtener historial de partidas');
      }

      const data = await response.json();
      console.log("Datos crudos del backend:", data);

      // Normalización simplificada y precisa
      const normalizedHistorial = data.map(item => ({
        id: Number(item.id || item.Partida_ID_PK || item.id_partida), // Todos los posibles nombres de id
        fecha: item.fecha || item.FechaInicio,
        profesor: item.profesor || 'Profesor no disponible',
        curso: item.curso || item.curso_grupo || 'Curso no disponible', // <-- Aquí está el cambio clave
        total_estudiantes: item.total_estudiantes || 0
      }));

      console.log("Datos normalizados:", normalizedHistorial);

      setHistorial(normalizedHistorial);
      setFilteredHistorial(normalizedHistorial);
    } catch (error) {
      console.error("Error al obtener historial de partidas:", error);
      Swal.fire('Error', 'No se pudieron obtener los registros de historial', 'error');
    } finally {
      setLoading(false);
    }
  };
  // Fetch logs from API
  const fetchLogs = async () => {
    setLoading(true);
    try {
      const apiUrl = process.env.REACT_APP_API_URL;
      const response = await fetch(`${apiUrl}/bitacora_D`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error('Error al obtener logs');
      }

      const data = await response.json();

      // Verificar si la respuesta tiene la estructura esperada
      if (!data.success) {
        throw new Error(data.message || 'Error en la respuesta del servidor');
      }

      // Normalización de los logs
      const normalizedLogs = data.logs.map(log => ({
        id: log.id,
        Fecha: log.Fecha,
        usuario: log.usuario,
        Accion: log.Accion,
        Error: log.Error || 'No aplica',
        Correo: log.Correo,
        Rol: log.Rol
      }));

      setLogs(normalizedLogs);
      setFilteredLogs(normalizedLogs);
    } catch (error) {
      console.error("Error al obtener logs:", error);
      Swal.fire('Error', 'No se pudieron obtener los registros de bitácora', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Filter historial based on search
  useEffect(() => {
    if (selectedTab === 'history') {
      let result = historial;

      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        result = result.filter(item =>
          (item.curso && item.curso.toLowerCase().includes(query)) ||
          (item.profesor && item.profesor.toLowerCase().includes(query)));
      }

      setFilteredHistorial(result);
      setCurrentPage(1);
    }
  }, [historial, searchQuery, selectedTab]);

  // Filter logs based on search and filters
  useEffect(() => {
    if (selectedTab === 'logs') {
      let result = logs;

      // Filter by action type
      if (logActionFilter !== 'all') {
        result = result.filter(log => {
          if (logActionFilter === 'Descarga') {
            return log.Accion.includes('Descarga');
          } else if (logActionFilter === 'Agregado') {
            return log.Accion.includes('Agregado') || log.Accion.includes('agregado');
          } else if (logActionFilter === 'Eliminado') {
            return log.Accion.includes('Eliminado') || log.Accion.includes('eliminado');
          }
          return true;
        });
      }

      // Filter by error presence
      if (logErrorFilter !== 'all') {
        result = result.filter(log =>
          logErrorFilter === 'conError' ? log.error !== 'No aplica' : log.error === 'No aplica'
        );
      }

      // Filter by date
      if (dateFilter) {
        const filterDate = new Date(dateFilter).toDateString();
        result = result.filter(log => {
          const logDate = new Date(log.Fecha).toDateString();
          return logDate === filterDate;
        });
      }

      // Filter by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        result = result.filter(log =>
          (log.usuario && log.usuario.toLowerCase().includes(query)) ||
          (log.Accion && log.Accion.toLowerCase().includes(query)) ||
          (log.error && log.error.toLowerCase().includes(query))
        )
      }

      setFilteredLogs(result);
      setCurrentPage(1);
    }
  }, [logs, searchQuery, logActionFilter, logErrorFilter, dateFilter, selectedTab]);

  // System clean functions
  const handleSystemClean = (action) => {
    let title, text;

    switch (action) {
      case 'customizations':
        title = 'Limpiar personalizaciones';
        text = '¿Estás seguro que deseas eliminar todas las personalizaciones del sistema?';
        break;
      case 'logs':
        title = 'Limpiar bitácora';
        text = '¿Estás seguro que deseas eliminar todos los registros de la bitácora?';
        break;
      case 'history':
        title = 'Limpiar historial';
        text = '¿Estás seguro que deseas eliminar todo el historial del sistema?';
        break;
      case 'students':
        title = 'Eliminar todos los estudiantes';
        text = '¿Estás seguro que deseas eliminar todos los estudiantes del sistema?';
        break;
      case 'professors':
        title = 'Eliminar todos los profesores';
        text = '¿Estás seguro que deseas eliminar todos los profesores del sistema?';
        break;
      case 'reset':
        title = 'PELIGRO - REINICIAR SISTEMA';
        text = 'Esta acción eliminará TODOS los datos del sistema (excepto administradores) y NO SE PUEDE DESHACER. ¿Estás absolutamente seguro?';
        break;
      default:
        return;
    }

    if (action === 'reset') {
      Swal.fire({
        title: title,
        text: text,
        icon: 'warning',
        input: 'text',
        inputPlaceholder: 'Ingresa "fidecolab" para confirmar',
        showCancelButton: true,
        confirmButtonText: 'Confirmar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#d33',
        preConfirm: (input) => {
          if (input.toLowerCase() !== 'fidecolab') {
            Swal.showValidationMessage('Código incorrecto');
          }
        }
      }).then((result) => {
        if (result.isConfirmed) {
          Swal.fire('Sistema Reiniciado', 'El sistema ha sido reiniciado completamente', 'success');
        }
      });
    } else {
      Swal.fire({
        title: title,
        text: text,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Confirmar',
        cancelButtonText: 'Cancelar'
      }).then((result) => {
        if (result.isConfirmed) {
          Swal.fire('Completado', `La acción "${title}" se ha realizado con éxito`, 'success');
        }
      });
    }
  };

  const handleDeleteHistorial = async (historialId) => {
    const result = await Swal.fire({
      title: '¿Eliminar registro?',
      text: 'Esta acción eliminará permanentemente este registro de historial',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33'
    });

    if (!result.isConfirmed) return;

    try {
      const apiUrl = process.env.REACT_APP_API_URL;
      const response = await fetch(`${apiUrl}/bitacora_D/${historialId}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error('Error al eliminar registro');
      }

      Swal.fire('Eliminado', 'El registro ha sido eliminado correctamente', 'success');
      fetchHistorial();
    } catch (error) {
      console.error("Error al eliminar registro:", error);
      Swal.fire('Error', 'No se pudo eliminar el registro', 'error');
    }
  };


  // Delete log record
  const handleDeleteLog = async (logId) => {
    const result = await Swal.fire({
      title: '¿Eliminar registro?',
      text: 'Esta acción eliminará permanentemente este registro de bitácora',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33'
    });

    if (!result.isConfirmed) return;

    try {
      const apiUrl = process.env.REACT_APP_API_URL;
      const response = await fetch(`${apiUrl}/bitacora_D/${logId}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error('Error al eliminar registro');
      }

      Swal.fire('Eliminado', 'El registro ha sido eliminado correctamente', 'success');
      fetchLogs();
    } catch (error) {
      console.error("Error al eliminar registro:", error);
      Swal.fire('Error', 'No se pudo eliminar el registro', 'error');
    }
  };

  // View error details
  const viewErrorDetails = (error) => {
    Swal.fire({
      title: 'Detalles del error',
      html: `
      <div style="text-align: left; padding: 10px; background-color: #f8f9fa; border-radius: 5px;">
        <pre style="white-space: pre-wrap; word-wrap: break-word; font-family: monospace;">${error}</pre>
      </div>
    `,
      confirmButtonText: 'Cerrar'
    });
  };

  // System clean interface
  if (showSystemClean) {
    return (
      <LayoutAdmin>
        <section className="depuration__container">
          <div className="depuration__title">
            <h3>Depuración</h3>
          </div>
          <div className="depuration__content">
            {/* Left Sidebar */}
            <div className="depuration__left">
              <div
                className={`left__box ${selectedTab === 'users' ? 'active' : ''}`}
                onClick={() => {
                  setShowSystemClean(false);
                  handleTabChange('users');
                }}
              >
                <div className="box__shape shape--users">
                  <i className="fa-solid fa-users"></i>
                </div>
                <div className="right__text">
                  <p className="text__title">Administrar Usuarios</p>
                  <p className="text__description">Gestiona todos los usuarios del sistema (profesores y estudiantes), su edición, eliminación y revisión de actividad</p>
                </div>
              </div>

              <div
                className={`left__box ${selectedTab === 'history' ? 'active' : ''}`}
                onClick={() => {
                  setShowSystemClean(false);
                  handleTabChange('history');
                }}
              >
                <div className="box__shape shape--history">
                  <i className="fa-solid fa-clock-rotate-left"></i>
                </div>
                <div className="right__text">
                  <p className="text__title">Administrar Historial</p>
                  <p className="text__description">Desde acá se administrará todo el historial de cada partida al igual que la opción de una limpieza total o parcial.</p>
                </div>
              </div>

              <div
                className={`left__box ${selectedTab === 'logs' ? 'active' : ''}`}
                onClick={() => {
                  setShowSystemClean(false);
                  handleTabChange('logs');
                }}
              >
                <div className="box__shape shape--log">
                  <i className="fa-solid fa-clipboard-list"></i>
                </div>
                <div className="right__text">
                  <p className="text__title">Administrar Logs</p>
                  <p className="text__description">Registros detallados de todas las acciones del sistema, incluyendo errores y actividad de usuarios.</p>
                </div>
              </div>

              <div
                className="left__box left__box--danger active"
              >
                <div className="box__shape shape--danger">
                  <i className="fa-solid fa-broom"></i>
                </div>
                <div className="right__text">
                  <p className="text__title">Limpieza del Sistema</p>
                  <p className="text__description">Acciones avanzadas de mantenimiento y limpieza del sistema. Requiere código de seguridad.</p>
                </div>
              </div>
            </div>

            {/* Right Content */}
            <div className="depuration__right">
              {/* Options */}
              <div className="depuration__message">
                  <div className="depuration__title">
                    <h3>Limpieza del Sistema</h3>
                  </div>
                  <div className="message__warning">
                    <i className="fa-solid fa-triangle-exclamation"></i>
                    <span style={{ marginLeft: '10px', color: '#dc3545' }}>
                      ADVERTENCIA: Las acciones en esta sección son IRREVERSIBLES
                    </span>
                  </div>
              </div>

              {/* System Clean Content */}
              <div className="system-clean__container">
                <div className="system-clean__buttons">
                  <button
                    className="clean-button clean-button--customizations"
                    onClick={handleCleanCustomizations}
                  >
                    <i className="fa-solid fa-paint-roller"></i>
                    Limpiar personalizaciones
                  </button>
                  <button
                        className="clean-button clean-button--logs"
                        onClick={handleCleanLogs}
                      >
                        <i className="fa-solid fa-clipboard-list"></i>
                        Limpiar bitácora
                  </button>
                  <button
                        className="clean-button clean-button--history"
                        onClick={handleCleanHistory}
                      >
                        <i className="fa-solid fa-clock-rotate-left"></i>
                        Limpiar historial
                  </button>
                  <button
                        className="clean-button clean-button--students"
                        onClick={handleDeleteAllStudents}
                      >
                        <i className="fa-solid fa-user-graduate"></i>
                        Eliminar estudiantes
                  </button>
                  <button
                        className="clean-button clean-button--professors"
                        onClick={handleDeleteAllProfessors}
                      >
                        <i className="fa-solid fa-user-tie"></i>
                        Eliminar profesores
                  </button>
                  <button
                        className="clean-button clean-button--reset"
                        onClick={handleResetSystem}
                      >
                        <i className="fa-solid fa-bomb"></i>
                        REINICIAR SISTEMA COMPLETO
                  </button>
                </div>   
              </div>
            </div>
          </div>
        </section>
      </LayoutAdmin>
    );
  }



  return (
    <LayoutAdmin>
      <section className="depuration__container">
        <div className="depuration__title">
          <h3>Depuración</h3>
        </div>
        <div className="depuration__content">
          {/* Left Sidebar */}
          <div className="depuration__left">
            <div
              className={`left__box ${selectedTab === 'users' ? 'active' : ''}`}
              onClick={() => handleTabChange('users')}
            >
              <div className="box__shape shape--users">
                <i className="fa-solid fa-users"></i>
              </div>
              <div className="right__text">
                <p className="text__title">Administrar Usuarios</p>
                <p className="text__description">Gestiona todos los usuarios del sistema (profesores y estudiantes), su edición, eliminación y revisión de actividad</p>
              </div>
            </div>

            <div
              className={`left__box ${selectedTab === 'history' ? 'active' : ''}`}
              onClick={() => handleTabChange('history')}
            >
              <div className="box__shape shape--history">
                <i className="fa-solid fa-clock-rotate-left"></i>
              </div>
              <div className="right__text">
                <p className="text__title">Administrar Historial</p>
                <p className="text__description">Desde acá se administrará todo el historial de cada partida al igual que la opción de una limpieza total o parcial.</p>
              </div>
            </div>

            <div
              className={`left__box ${selectedTab === 'logs' ? 'active' : ''}`}
              onClick={() => handleTabChange('logs')}
            >
              <div className="box__shape shape--log">
                <i className="fa-solid fa-clipboard-list"></i>
              </div>
              <div className="right__text">
                <p className="text__title">Administrar Logs</p>
                <p className="text__description">Registros detallados de todas las acciones del sistema, incluyendo errores y actividad de usuarios.</p>
              </div>
            </div>

            <div
              className="left__box left__box--danger"
              onClick={accessSystemClean}
            >
              <div className="box__shape shape--danger">
                <i className="fa-solid fa-broom"></i>
              </div>
              <div className="right__text">
                <p className="text__title">Limpieza del Sistema</p>
                <p className="text__description">Acciones avanzadas de mantenimiento y limpieza del sistema. Requiere código de seguridad.</p>
              </div>
            </div>
          </div>

          {/* Right Content */}
          <div className="depuration__right">
            {/* Options */}
            <div className="depuration__top">
              <div className="depuration__options">
                <div className="options__top">
                  <div className="depuration__title">
                    <h3>
                      {selectedTab === 'users' && 'Administrar Usuarios'}
                      {selectedTab === 'history' && 'Administrar Historial'}
                      {selectedTab === 'logs' && 'Administrar Logs'}
                    </h3>
                  </div>

                  {/* Actions based on tab */}
                  {selectedTab === 'users' && (
                    <>
                      <div className="option__button button--unlink">
                        <button type="button" onClick={handleUnlinkUsers}>
                          Desvincular usuario
                        </button>
                      </div>
                      <div className="option__button button--add">
                        <button type="button" onClick={handleAddUser}>
                          Agregar Usuario
                        </button>
                      </div>
                    </>
                  )}
                </div>

                <div className="options__bottom">
                  <div className="option__search">
                    <i className="fa-solid fa-magnifying-glass"></i>
                    <input
                      type="search"
                      placeholder="Buscar elemento"
                      value={searchQuery}
                      onChange={handleSearchChange}
                    />
                  </div>

                  {selectedTab === 'users' && (
                    <>
                      <div className="option__filter">
                        <select
                          value={roleFilter}
                          onChange={handleRoleFilterChange}
                        >
                          <option value="all">Todos los roles</option>
                          <option value="Profesor">Profesores</option>
                          <option value="Estudiante">Estudiantes</option>
                        </select>
                      </div>
                      <div className="option__filter">
                        <select
                          value={statusFilter}
                          onChange={handleStatusFilterChange}
                        >
                          <option value="all">Todos los estados</option>
                          <option value="Activo">Activos</option>
                          <option value="Inactivo">Inactivos</option>
                        </select>
                      </div>
                    </>
                  )} {selectedTab === 'logs' && (
                    <>
                      <div className="option__filter">
                        <select
                          value={logActionFilter}
                          onChange={(e) => setLogActionFilter(e.target.value)}
                        >
                          <option value="all">Todas las acciones</option>
                          <option value="Descarga">Descargas</option>
                          <option value="Agregado">Agregados</option>
                          <option value="Eliminado">Eliminados</option>
                        </select>
                      </div>
                      <div className="option__filter">
                        <select
                          value={logErrorFilter}
                          onChange={(e) => setLogErrorFilter(e.target.value)}
                        >
                          <option value="all">Todos</option>
                          <option value="conError">Con error</option>
                          <option value="sinError">Sin error</option>
                        </select>
                      </div>
                      <div className="option__filter">
                        <input
                          type="date"
                          value={dateFilter}
                          onChange={(e) => setDateFilter(e.target.value)}
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* List to Depurate */}
            <div className="depuration__bottom">
              {selectedTab === 'users' ? (
                <>
                  {loading ? (
                    <div className="loading-container">
                      <div className="loading-spinner"></div>
                      <p>Cargando usuarios...</p>
                    </div>
                  ) : (
                    <>
                      <div className="bottom__title">
                        <h3>Lista de Usuarios</h3>
                      </div>
                      <table className="bottom__table">
                        <thead className="table__head">
                            <th className="table__header">Nombre</th>
                            <th className="table__header">Apellidos</th>
                            <th className="table__header">Correo</th>
                            <th className="table__header">Rol</th>
                            <th className="table__header">Estado</th>
                            <th className="table__header">Acciones</th>
                        </thead>
                        <tbody className="table__body">
                          {currentItems.length > 0 ? (
                            currentItems.map((user, index) => (
                              <tr className="table__row" key={index}>
                                <td className="table__data">{user.Nombre}</td>
                                <td className="table__data">{user.Apellido1} {user.Apellido2}</td>
                                <td className="table__data">{user.Correo}</td>
                                <td className="table__data">{user.Rol}</td>
                                <td className="table__data">
                                  <span className={`status-badge ${user.Estado ? 'active' : 'inactive'}`}>
                                    {user.Estado ? 'Activo' : 'Inactivo'}
                                  </span>
                                </td>
                                <td className="table__data table__data--actions">
                                  <button
                                    className="button__edit"
                                    onClick={() => handleEditUser(user)}
                                    title="Editar"
                                  >
                                    <i className="fa-solid fa-pen-to-square"></i>
                                  </button>
                                  <button
                                    className={`button__ban ${!user.Estado ? 'inactive' : ''}`}
                                    onClick={() => handleToggleUserStatus(user)}
                                    title={user.Estado ? 'Desactivar' : 'Activar'}
                                  >
                                    <i className="fa-solid fa-ban"></i>
                                  </button>
                                  <button
                                    className="button__delete"
                                    onClick={() => handleDeleteUser(user)}
                                    title="Eliminar"
                                  >
                                    <i className="fa-solid fa-trash"></i>
                                  </button>
                                  {user.Rol !== 'Administrador' && (
                                    <button
                                      className="button__view"
                                      onClick={() => viewUserDetails(user)}
                                      title="Ver detalles"
                                    >
                                      <i className="fa-solid fa-eye"></i>
                                    </button>
                                  )}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr className="table__row">
                              <td colSpan="6" className="table__data table__data--empty">
                                No se encontraron usuarios
                              </td>
                            </tr>
                          )}
                        </tbody>
                        <tfoot className="table__foot">
                          {totalPages > 1 && (
                            <div className="foot__buttons">
                              {Array.from({ length: totalPages }, (_, i) => i + 1)
                                .filter(number => {
                                  let pageNumber;
                                  if (currentPage === 1 || currentPage === 2) {
                                    pageNumber = currentPage === 1 ? number <= 5 : number >= currentPage - 1 && number <= currentPage + 3;
                                  }
                                  if (currentPage > 2 && currentPage < totalPages - 1) {
                                    pageNumber = number >= currentPage - 2 && number <= currentPage + 2 && number > 0 && number <= totalPages;
                                  }
                                  if (currentPage === totalPages - 1 || currentPage === totalPages) {
                                    pageNumber = currentPage === totalPages ? number >= currentPage - 4 : number >= currentPage - 3 && number <= currentPage + 1;
                                  }
                                  return pageNumber;
                                })
                                .map(number => (
                                  <button
                                    className={`button__page ${currentPage === number ? "active" : ""}`}
                                    key={number}
                                    onClick={() => paginate(number)}
                                  >
                                    {number}
                                  </button>
                                ))}
                            </div>
                          )}
                        </tfoot>
                      </table>
                    </>
                  )}
                </>
              ) : selectedTab === 'history' ? (
                <>
                  <div className="bottom__title">
                    <h3>Historial de partidas</h3>
                  </div>
                  <table className="bottom__table">
                    <thead className="table__head">
                        <th className="table__header">Fecha</th>
                        <th className="table__header">Curso/Grupo</th>
                        <th className="table__header">Profesor</th>
                        <th className="table__header">Estudiantes</th>
                        <th className="table__header">Acciones</th>
                    </thead>
                    <tbody className="table__body">
                      {loading ? (
                        <tr>
                          <td colSpan="5" className="table__data table__data--loading">
                            <div className="loading-spinner"></div>
                            Cargando historial...
                          </td>
                        </tr>
                      ) : filteredHistorial.length > 0 ? (
                        filteredHistorial.slice(indexOfFirstItem, indexOfLastItem).map((item, index) => (
                          <tr className="table__row" key={index}>
                            <td className="table__data" style={{ width: '20%' }}>
                              {item.fecha ? new Date(item.fecha).toLocaleString() : 'Fecha no disponible'}
                            </td>
                            <td className="table__data" style={{ width: '30%' }}>{item.curso}</td>
                            <td className="table__data" style={{ width: '30%' }}>{item.profesor}</td>
                            <td className="table__data" style={{ width: '10%' }}>{item.total_estudiantes}</td>
                            <td className="table__data table__data--actions" style={{ width: '10%' }}>
                              <button
                                className="button__view"
                                title="Ver detalles"
                                onClick={() => handleViewDetails(item.id)}
                              >
                                <i className="fa-solid fa-eye"></i>
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr className="table__row">
                          <td colSpan="5" className="table__data table__data--empty">
                            No se encontraron registros de historial
                          </td>
                        </tr>
                      )}
                    </tbody>

                    <tfoot className="table__foot">
                      {totalPages > 1 && (
                        <div className="foot__buttons">
                          {Array.from({ length: totalPages }, (_, i) => i + 1)
                            .filter(number => {
                              let pageNumber;
                              if (currentPage === 1 || currentPage === 2) {
                                pageNumber = currentPage === 1 ? number <= 5 : number >= currentPage - 1 && number <= currentPage + 3;
                              }
                              if (currentPage > 2 && currentPage < totalPages - 1) {
                                pageNumber = number >= currentPage - 2 && number <= currentPage + 2 && number > 0 && number <= totalPages;
                              }
                              if (currentPage === totalPages - 1 || currentPage === totalPages) {
                                pageNumber = currentPage === totalPages ? number >= currentPage - 4 : number >= currentPage - 3 && number <= currentPage + 1;
                              }
                              return pageNumber;
                            })
                            .map(number => (
                              <button
                                className={`button__page ${currentPage === number ? "active" : ""}`}
                                key={number}
                                onClick={() => paginate(number)}
                              >
                                {number}
                              </button>
                            ))}
                        </div>
                      )}
                    </tfoot>
                  </table>
                </>
              ) : selectedTab === 'logs' ? (
                <>
                  <div className="bottom__title">
                    <h3>Bitácora de Acciones</h3>
                  </div>
                  <table className="bottom__table">
                    <thead className="table__head">
                        <th className="table__header" style={{ width: '20%' }}>Fecha</th>
                        <th className="table__header" style={{ width: '20%' }}>Usuario</th>
                        <th className="table__header" style={{ width: '36%' }}>Acción</th>
                        <th className="table__header" style={{ width: '12%' }}>Error</th>
                        <th className="table__header" style={{ width: '12%' }}>Acciones</th>
                    </thead>
                    <tbody className="table__body">
                      {loading ? (
                        <tr>
                          <td colSpan="5" className="table__data table__data--loading">
                            <div className="loading-spinner"></div>
                            Cargando registros...
                          </td>
                        </tr>
                      ) : filteredLogs.length > 0 ? (
                        filteredLogs.slice(indexOfFirstItem, indexOfLastItem).map((log, index) => (
                          <tr className="table__row" key={index}>
                            <td className="table__data" style={{ width: '20%' }}>
                              {log.Fecha ? new Date(log.Fecha).toLocaleString() : 'Fecha no disponible'}
                            </td>
                            <td className="table__data" style={{ width: '20%' }}>{log.usuario}</td>
                            <td className="table__data" style={{ width: '36%' }}>{log.Accion}</td>
                            <td className="table__data" style={{ width: '12%' }}>
                              {log.Error === 'No aplica' ? (
                                <span className="status-badge active">No aplica</span>
                              ) : (
                                <button
                                  className="button__view"
                                  onClick={() => viewErrorDetails(log.Error)}
                                  title="Ver detalles"
                                >
                                  <i className="fa-solid fa-eye"></i> Ver
                                </button>
                              )}
                            </td>
                            <td className="table__data table__data--actions" style={{ width: '12%' }}>
                              <button
                                className="button__delete"
                                onClick={() => handleDeleteLog(log.id)}
                                title="Eliminar"
                              >
                                <i className="fa-solid fa-trash"></i>
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr className="table__row">
                          <td colSpan="5" className="table__data table__data--empty">
                            No se encontraron registros de bitácora
                          </td>
                        </tr>
                      )}
                    </tbody>
                    <tfoot className="table__foot">
                      {totalPages > 1 && (
                        <div className="foot__buttons">
                          {Array.from({ length: totalPages }, (_, i) => i + 1)
                            .filter(number => {
                              let pageNumber;
                              if (currentPage === 1 || currentPage === 2) {
                                pageNumber = currentPage === 1 ? number <= 5 : number >= currentPage - 1 && number <= currentPage + 3;
                              }
                              if (currentPage > 2 && currentPage < totalPages - 1) {
                                pageNumber = number >= currentPage - 2 && number <= currentPage + 2 && number > 0 && number <= totalPages;
                              }
                              if (currentPage === totalPages - 1 || currentPage === totalPages) {
                                pageNumber = currentPage === totalPages ? number >= currentPage - 4 : number >= currentPage - 3 && number <= currentPage + 1;
                              }
                              return pageNumber;
                            })
                            .map(number => (
                              <button
                                className={`button__page ${currentPage === number ? "active" : ""}`}
                                key={number}
                                onClick={() => paginate(number)}
                              >
                                {number}
                              </button>
                            ))}
                        </div>
                      )}
                    </tfoot>
                  </table>
                </>
              ) : (
                <div className="depuration__empty">
                  <i className="fa-solid fa-folder-open"></i>
                  <p>Selecciona un módulo para administrar</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {modalVisible && (
        <div className="modal-overlay show" onClick={closeModal}>
          <div
            className="modal-content animated slideIn"
            style={{ width: "90%", height: "90%" }}
            onClick={(e) => e.stopPropagation()}
          >
            <button className="modal-close-btn" onClick={closeModal}>
              ✕
            </button>
            <iframe
              src={`/resultadosAdmin/${selectedResultId}`}
              title="Resultados"
              style={{ width: "100%", height: "100%", border: "none" }}
            ></iframe>
          </div>
        </div>
      )}

    </LayoutAdmin>
  );
};

export default Depuration;