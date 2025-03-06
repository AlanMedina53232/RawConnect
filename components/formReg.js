import React, { useState } from "react";
import { StyleSheet, View, Image, TouchableOpacity } from "react-native";
import { NativeBaseProvider, Box, Input, Button, Text, FormControl, Alert } from "native-base";
import * as ImagePicker from "expo-image-picker";
import { auth } from '../config/fb.js';
import { createUserWithEmailAndPassword } from "firebase/auth";

export default function Reg() {
  const [name, setName] = useState("");
  const [midleName, setMidleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [passConf, setPassConf] = useState("");
  const [image, setImage] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 4],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const uploadImageToCloudinary = async (imageUri) => {
    let formData = new FormData();
    formData.append("file", {
      uri: imageUri,
      type: "image/jpeg",
      name: "profile.jpg",
    });
    formData.append("upload_preset", "testist");
    formData.append("cloud_name", "df5qzxunp");

    try {
      let response = await fetch("https://api.cloudinary.com/v1_1/df5qzxunp/image/upload", {
        method: "POST",
        body: formData,
      });
      let data = await response.json();
      console.log("Cloudinary Response:", data); // Ver qué devuelve Cloudinary
      return data.secure_url || null;x      
    } catch (error) {
      console.error("Error uploading image:", error);
      return null;
    }
  };

  const handleSubmit = async () => {
    setError("");
    setSuccessMessage("");
    setLoading(true);

    if (!email || !pass || !passConf) {
      setError("Please complete all fields.");
      setLoading(false);
      return;
    }

    if (pass !== passConf) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    let imageUrl = null;
    if (image) {
      imageUrl = await uploadImageToCloudinary(image);
      if (!imageUrl) {
        setError("Image upload failed.");
        setLoading(false);
        return;
      }
    }

    try {
      await createUserWithEmailAndPassword(auth, email, pass);
      setSuccessMessage("User successfully registered");
    } catch (error) {
      setError("Error registering the user, please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Box width="100%" maxWidth="400px">
        <FormControl isRequired>
          <FormControl.Label>Name</FormControl.Label>
          <Input value={name} onChangeText={setName} style={styles.input} />
        </FormControl>
        
        <FormControl>
          <FormControl.Label>Middle Name</FormControl.Label>
          <Input value={midleName} onChangeText={setMidleName} style={styles.input} />
        </FormControl>

        <FormControl>
          <FormControl.Label>Last Name</FormControl.Label>
          <Input value={lastName} onChangeText={setLastName} style={styles.input} />
        </FormControl>

        <FormControl isRequired>
          <FormControl.Label>Phone</FormControl.Label>
          <Input value={phone} onChangeText={setPhone} style={styles.input} />
        </FormControl>

        <FormControl isRequired>
          <FormControl.Label>Address</FormControl.Label>
          <Input value={address} onChangeText={setAddress} style={styles.input} />
        </FormControl>
        
        <FormControl isRequired>
          <FormControl.Label>Email</FormControl.Label>
          <Input value={email} onChangeText={setEmail} style={styles.input} />
        </FormControl>

        <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
          <Text>Pick a Profile Picture</Text>
        </TouchableOpacity>
        {image && <Image source={{ uri: image }} style={styles.image} />}

        <FormControl isRequired>
          <FormControl.Label>Password</FormControl.Label>
          <Input value={pass} onChangeText={setPass} secureTextEntry style={styles.input} />
        </FormControl>

        <FormControl isRequired>
          <FormControl.Label>Confirm Password</FormControl.Label>
          <Input value={passConf} onChangeText={setPassConf} secureTextEntry style={styles.input} />
        </FormControl>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        {successMessage ? <Alert status="success"><Text>{successMessage}</Text></Alert> : null}

        <Button onPress={handleSubmit} isLoading={loading}>
          <Text>Register</Text>
        </Button>
      </Box>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '200',padding: 5, justifyContent: 'center', alignItems: 'center' },
  input: { marginBottom: 10, fontSize: 16, marginHorizontal: 10 },
  imagePicker: { marginVertical: 10, padding: 10, backgroundColor: '#ccc', alignItems: 'center' },
  image: { width: 100, height: 100, borderRadius: 50, marginTop: 10 },
  errorText: { color: "red", textAlign: "center", marginBottom: 15 },
});
