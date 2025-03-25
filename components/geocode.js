import axios from "axios";

const API_KEY = "4af1b341beed4a1aa1e4cded9af75ed1"; // Clave de la API de OpenCage

const reverseGeocode = async (latitude, longitude) => {
  try {
    const response = await axios.get(
      `https://api.opencagedata.com/geocode/v1/json`,
      {
        params: {
          key: API_KEY,
          q: `${latitude},${longitude}`,
          language: "es", // Idioma de la respuesta (español)
        },
      }
    );
    
    // Si hay resultados
    if (response.data.results.length > 0) {
      return response.data.results[0].formatted; // Devuelve la dirección completa
    } else {
      throw new Error("No se pudo obtener la dirección.");
    }
  } catch (error) {
    console.error("Error en geocodificación inversa:", error);
    throw new Error("Error al obtener la dirección.");
  }
};

export default reverseGeocode;
