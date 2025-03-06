import React, { useState } from "react";
import { View, Image, TouchableOpacity, ActivityIndicator, Text } from "react-native";
import * as ImagePicker from "expo-image-picker";

const ImageUploader = ({ onUploadComplete }) => {
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 4],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      uploadImageToCloudinary(result.assets[0].uri);
    }
  };

  const uploadImageToCloudinary = async (imageUri) => {
    setUploading(true);
    let formData = new FormData();
    formData.append("file", { uri: imageUri, name: "profile.jpg", type: "image/jpeg" });
    formData.append("upload_preset", "your_upload_preset");
    formData.append("cloud_name", "your_cloud_name");

    try {
      let response = await fetch("https://api.cloudinary.com/v1_1/your_cloud_name/image/upload", {
        method: "POST",
        body: formData,
      });
      let data = await response.json();
      if (data.secure_url) {
        onUploadComplete(data.secure_url);
      }
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={{ alignItems: "center", marginVertical: 10 }}>
      <TouchableOpacity onPress={pickImage} style={{ padding: 10, backgroundColor: "#ccc" }}>
        <Text>{uploading ? "Uploading..." : "Pick a Profile Picture"}</Text>
      </TouchableOpacity>
      {image && !uploading && <Image source={{ uri: image }} style={{ width: 100, height: 100, borderRadius: 50, marginTop: 10 }} />}
      {uploading && <ActivityIndicator size="small" color="#0000ff" />}
    </View>
  );
};

export default ImageUploader;
