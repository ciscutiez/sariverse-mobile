import { useState } from "react";
import { View, Text, TextInput, Alert } from "react-native";
import { Button } from "~/components/nativewindui/Button";
import { useCreateProduct } from "~/hooks/product";

export default function AddProductScreen() {
  const createProduct = useCreateProduct();

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");

  const handleAdd = () => {
    if (!name || !category || !price) {
      Alert.alert("Error", "Please fill out all required fields");
      return;
    }

    createProduct.mutate(
      {
        name,
        category,
        price: parseFloat(price),
        description,
        profile_id: null, 
        product_image: null,
        supplier: null,
      },
      {
        onSuccess: () => {
          Alert.alert("Success", "Product added successfully!");
          setName("");
          setCategory("");
          setPrice("");
          setDescription("");
        },
        onError: (err) => {
          Alert.alert("Error", (err as Error).message);
        },
      }
    );
  };

  return (
    <View className="flex-1 p-5 bg-background">
      <Text className="text-2xl font-bold text-foreground mb-6">
        Add Product
      </Text>

      <TextInput
        className="border border-border rounded-lg px-4 py-2 mb-3 text-foreground"
        placeholder="Name"
        placeholderTextColor="#9ca3af"
        value={name}
        onChangeText={setName}
      />

      <TextInput
        className="border border-border rounded-lg px-4 py-2 mb-3 text-foreground"
        placeholder="Category"
        placeholderTextColor="#9ca3af"
        value={category}
        onChangeText={setCategory}
      />

      <TextInput
        className="border border-border rounded-lg px-4 py-2 mb-3 text-foreground"
        placeholder="Price"
        keyboardType="numeric"
        placeholderTextColor="#9ca3af"
        value={price}
        onChangeText={setPrice}
      />

      <TextInput
        className="border border-border rounded-lg px-4 py-2 mb-4 text-foreground h-24"
        placeholder="Description"
        placeholderTextColor="#9ca3af"
        value={description}
        onChangeText={setDescription}
        multiline
      />

      <Button onPress={handleAdd} disabled={createProduct.isPending}>
        {createProduct.isPending ? "Adding..." : "Add Product"}
      </Button>
    </View>
  );
}
