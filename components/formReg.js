import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { NativeBaseProvider, Box, Input, Button, Text, FormControl, Alert } from "native-base";
import { auth } from '../config/fb.js';  // Importamos el objeto auth desde la configuración de Firebase
import { createUserWithEmailAndPassword } from "firebase/auth";  // Importamos la función para crear el usuario

export default function Reg() {
  const [name, setName] = useState("");
  const [midleName, setMidleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [passConf, setPassConf] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");  // Nueva variable de estado para el mensaje de éxito
  
  const handleSubmit = async () => {
    setError("");  // Limpiar cualquier mensaje de error anterior
    setSuccessMessage("");  // Limpiar cualquier mensaje de éxito anterior
    setLoading(true);  // Iniciar el estado de carga

    // Verificar si los campos están completos
    if (!email || !pass || !passConf) {
      setError("Please complete all fields.");
      setLoading(false);
      return;
    }

    // Expresión regular para validar el formato del correo electrónico
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    // Validar el correo electrónico
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      setLoading(false);
      return;
    }

    // Validar que las contraseñas coincidan
    if (pass !== passConf) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    // Comprobar si la contraseña tiene al menos 10 caracteres
    if (pass.length < 10) {
      setError("The password must be at least 10 characters long.");
      setLoading(false);
      return;
    }

    // Expresión regular para validar la contraseña
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*-+]{10,}$/;

    // Validar la contraseña con la expresión regular
    if (!passwordRegex.test(pass)) {
      setError("The password must have at least 10 characters, one uppercase, one lowercase, one number and one special character..");
      setLoading(false);
      return;
    }

    // Si todo está correcto, vaciar el mensaje de error y proceder
    setError(""); 

    try {
      // Intentamos crear un usuario con el correo y la contraseña
      await createUserWithEmailAndPassword(auth, email, pass);
      setSuccessMessage("User successfully registered");  // Mostrar mensaje de éxito
    } catch (error) {
      let errorMessage = error.message;
      
      // Manejo de errores de Firebase con mensajes amigables
      if (errorMessage.includes("email-already-in-use")) {
        setError("The e-mail address is already registered.");
      } else if (errorMessage.includes("weak-password")) {
        setError("Password is too weak.");
      } else if (errorMessage.includes("invalid-email")) {
        setError("The e-mail address is invalid.");
      } else {
        setError("Error registering the user, please try again..");
      }
    } finally {
      setLoading(false);  // Terminar el estado de carga
    }
  };

  return (
    <View style={styles.container}>
      <Box width="100%" maxWidth="400px">
        <FormControl isRequired>
          <FormControl.Label>Name</FormControl.Label>
          <Input
          variant="underlined"
          placeholder="Name"
          value={name}
          onChangeText={setName}
          style={styles.input}
          />
        </FormControl>
        <FormControl>
          <FormControl.Label>Middle Name</FormControl.Label>
          <Input
          variant="underlined"
          placeholder="Middle Name"
          value={midleName}
          onChangeText={setMidleName}
          style={styles.input}
          />
        </FormControl>
        <FormControl >
          <FormControl.Label>Last Name</FormControl.Label>
          <Input
          variant="underlined"
          placeholder="Last Name"
          value={lastName}
          onChangeText={setLastName}
          style={styles.input}
          />
        </FormControl>
        <FormControl isRequired>
          <FormControl.Label>Phone</FormControl.Label>
          <Input
          variant="underlined"
          placeholder="Phone"
          value={phone}
          onChangeText={setPhone}
          style={styles.input}
          />
          </FormControl>

          <FormControl isRequired>
            <FormControl.Label >Address</FormControl.Label>
            <Input
            variant="underlined"
            placeholder="Address"
            value={address}
            onChangeText={setAddress}
            style={styles.input}
            />
          </FormControl>

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

        {/* Mensaje de éxito */}
        {successMessage ? (
          <Alert status="success" colorScheme="success">
            <Text style={styles.successText}>{successMessage}</Text>
          </Alert>
        ) : null}

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
  successText: {
    color: "green",
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
