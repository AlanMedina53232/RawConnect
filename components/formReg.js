import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { NativeBaseProvider, Box, Input, Button, Text, FormControl } from "native-base";
import { auth } from '../config/fb.js';  // Importamos el objeto auth desde la configuración de Firebase
import { createUserWithEmailAndPassword } from "firebase/auth";  // Importamos la función para crear el usuario

export default function Reg() {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [passConf, setPassConf] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError("");  // Limpiar cualquier mensaje de error anterior
    setLoading(true);  // Iniciar el estado de carga

    // Verificar si los campos están completos
    if (!email || !pass || !passConf) {
      setError("Por favor, complete todos los campos.");
      setLoading(false);
      return;
    }

    // Expresión regular para validar el formato del correo electrónico
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    // Validar el correo electrónico
    if (!emailRegex.test(email)) {
      setError("Por favor, ingrese un correo electrónico válido.");
      setLoading(false);
      return;
    }

    // Validar que las contraseñas coincidan
    if (pass !== passConf) {
      setError("Las contraseñas no coinciden.");
      setLoading(false);
      return;
    }

    // Comprobar si la contraseña tiene al menos 10 caracteres
    if (pass.length < 10) {
      setError("La contraseña debe tener al menos 10 caracteres.");
      setLoading(false);
      return;
    }

    // Expresión regular para validar la contraseña
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*-+]{10,}$/;

    // Validar la contraseña con la expresión regular
    if (!passwordRegex.test(pass)) {
      setError("La contraseña debe tener al menos 10 caracteres, una mayúscula, una minúscula, un número y un carácter especial.");
      setLoading(false);
      return;
    }

    // Si todo está correcto, vaciar el mensaje de error y proceder
    setError(""); 

    try {
      // Intentamos crear un usuario con el correo y la contraseña
      await createUserWithEmailAndPassword(auth, email, pass);
      console.log("Usuario registrado con éxito");
    } catch (error) {
      let errorMessage = error.message;
      
      // Manejo de errores de Firebase con mensajes amigables
      if (errorMessage.includes("email-already-in-use")) {
        setError("El correo electrónico ya está registrado.");
      } else if (errorMessage.includes("weak-password")) {
        setError("La contraseña es demasiado débil.");
      } else if (errorMessage.includes("invalid-email")) {
        setError("El correo electrónico no es válido.");
      } else {
        setError("Error al registrar el usuario, por favor intente nuevamente.");
      }
    } finally {
      setLoading(false);  // Terminar el estado de carga
    }
  };

  return (
    <View style={styles.container}>
      <Box width="100%" maxWidth="400px">
        {/* Campo de Usuario */}
        <FormControl isInvalid={!!error}>
          <FormControl.Label>Email</FormControl.Label>
          <Input
            variant="underlined"
            placeholder="Example: email@gmail.com"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
          />
        </FormControl>

        {/* Campo de Contraseña */}
        <FormControl isInvalid={!!error}>
          <FormControl.Label>Password</FormControl.Label>
          <Input
            variant="underlined"
            placeholder="Type a new password"
            value={pass}
            onChangeText={setPass}
            secureTextEntry={true}
            style={styles.input}
          />
        </FormControl>

        {/* Campo de Confirmar Contraseña */}
        <FormControl isInvalid={!!error}>
          <FormControl.Label>Confirm your Password</FormControl.Label>
          <Input
            variant="underlined"
            placeholder="Type a password"
            value={passConf}
            onChangeText={setPassConf}
            secureTextEntry={true}
            style={styles.input}
          />
        </FormControl>

        {/* Mensaje de error */}
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {/* Botón de Registro */}
        <Button 
          style={styles.button} 
          onPress={handleSubmit} 
          isLoading={loading} 
          isLoadingText="Registrando..." 
          isDisabled={loading} 
        >
          <Text style={styles.buttonText}>Register</Text>
        </Button>
      </Box>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    marginBottom: 15,
    padding: 10,
    fontSize: 16,
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginBottom: 15,
  },
  button: {
    backgroundColor: "#4CAF50",
    marginTop: 20,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
