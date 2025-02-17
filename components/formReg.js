import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { NativeBaseProvider, Box, Input, Button, Text, FormControl } from "native-base";

export default function Reg() {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [passConf, setPassConf] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    // Verificar si los campos están completos
    if (!email || !pass || !passConf) {
      setError("Por favor, complete todos los campos.");
      return;
    }
  
    // Expresión regular para validar el formato del correo electrónico
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  
    // Validar el correo electrónico
    if (!emailRegex.test(email)) {
      setError("Por favor, ingrese un correo electrónico válido.");
      return;
    }
  
    // Validar que las contraseñas coincidan
    if (pass !== passConf) {
      setError("Las contraseñas no coinciden.");
      return;
    }
  
    // Expresión regular para validar la contraseña
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{10,}$/;
  
    // Validar la contraseña con la expresión regular
    if (!passwordRegex.test(pass)) {
      setError("La contraseña debe tener al menos 10 caracteres, una mayúscula, una minúscula, un número y un carácter especial.");
      return;
    }
  
    // Si todo está correcto, vaciar el mensaje de error y proceder
    setError("");
    
    // Aquí podrías agregar la lógica de registro (por ejemplo, enviar los datos a un servidor)
    console.log("Email:", email, "Password:", pass);
  };
  

  return (
    <View style={styles.container}>
      <Box width="100%" maxWidth="400px">

        {/* Campo de Usuario */}
        <FormControl isInvalid={error}>
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
        <FormControl isInvalid={error}>
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

        {/* Campo de Contraseña */}
        <FormControl isInvalid={error}>
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
        <Button style={styles.button} onPress={handleSubmit}>
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
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
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
