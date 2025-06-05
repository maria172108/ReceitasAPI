import React from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons"; // Certifique-se de ter o pacote instalado

const Detalhes = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { meal } = route.params;

  const getIngredients = (meal) => {
    const ingredients = [];
    for (let i = 1; i <= 20; i++) {
      const ingredient = meal[`strIngredient${i}`];
      const measure = meal[`strMeasure${i}`];
      if (ingredient && ingredient.trim() !== "") {
        ingredients.push(`${measure} ${ingredient}`);
      }
    }
    return ingredients;
  };

  const ingredients = getIngredients(meal);

  return (
    <SafeAreaView style={styles.container}>
      {/* Botão de voltar */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color="#fff" />
        <Text style={styles.backText}>Voltar</Text>
      </TouchableOpacity>

      <ScrollView>
        <Image source={{ uri: meal.strMealThumb }} style={styles.image} />
        <View style={styles.content}>
          <Text style={styles.title}>{meal.strMeal}</Text>
          <Text style={styles.subtitle}>
            {meal.strCategory} | {meal.strArea}
          </Text>

          <Text style={styles.sectionTitle}>Ingredientes</Text>
          {ingredients.map((item, index) => (
            <Text key={index} style={styles.ingredient}>
              • {item}
            </Text>
          ))}

          <Text style={styles.sectionTitle}>Modo de Preparo</Text>
          <Text style={styles.instructions}>{meal.strInstructions}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#65001f",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  backText: {
    color: "#fff",
    fontSize: 16,
    marginLeft: 8,
  },
  image: {
    width: "100%",
    height: 250,
  },
  content: {
    padding: 16,
    backgroundColor: "#fff9f5",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#65001f",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "#999",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#65001f",
    marginTop: 16,
    marginBottom: 8,
  },
  ingredient: {
    fontSize: 15,
    color: "#333",
    marginBottom: 4,
  },
  instructions: {
    fontSize: 15,
    color: "#333",
    marginTop: 4,
    lineHeight: 22,
    textAlign: "justify",
  },
});

export default Detalhes;
