import { useState } from "react";
import axios from "axios";

const AssignProfesor = () => {
  const [data, setData] = useState({ profesorId: "", grupoCursoId: "" });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const handleAssign = async () => {
    try {
      const response = await axios.post("http://localhost:5000/api/profesores/asignar", data);
      setMessage(response.data.message);
    } catch (error) {
      setMessage("Error al asignar el profesor.");
    }
  };

  return (
    <div className="p-4 border rounded-lg shadow-md bg-white">
      <h2 className="text-xl font-bold mb-2">Asignar Profesor a Grupo</h2>
      <input type="text" name="profesorId" placeholder="ID Profesor" onChange={handleChange} className="border p-2 w-full"/>
      <input type="text" name="grupoCursoId" placeholder="ID Grupo" onChange={handleChange} className="border p-2 w-full"/>
      <button onClick={handleAssign} className="bg-purple-500 text-white px-4 py-2 rounded">
        Asignar Profesor
      </button>
      {message && <p className="mt-2 text-red-500">{message}</p>}
    </div>
  );
};

export default AssignProfesor;
