import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const StarRating = ({ rating, setRating }) => {
  return (
    <View style={styles.starsContainer}>
      {[1, 2, 3, 4, 5].map((i) => (
        <TouchableOpacity key={i} onPress={() => setRating(i)}>
          <Text style={i <= rating ? styles.starFilled : styles.starEmpty}>★</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const FavoriteButton = ({ isFavorite, toggleFavorite }) => {
  return (
    <TouchableOpacity onPress={toggleFavorite} style={styles.favoriteButton}>
      <Text style={isFavorite ? styles.heartFilled : styles.heartEmpty}>
        ♥
      </Text>
    </TouchableOpacity>
  );
};

const HomeScreen = () => {
  const [meals, setMeals] = useState([]);
  const [ratings, setRatings] = useState({});
  const [favorites, setFavorites] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchMeals = async () => {
      try {
        const response = await fetch(
          "https://www.themealdb.com/api/json/v1/1/search.php?s="
        );
        const data = await response.json();
        setMeals(data.meals || []);
      } catch (error) {
        console.error("Erro ao buscar os dados:", error);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchMeals();
  }, []);

  const handleRatingChange = (mealId, rating) => {
    setRatings((prev) => ({ ...prev, [mealId]: rating }));
  };

  const toggleFavorite = (mealId) => {
    setFavorites((prev) => ({
      ...prev,
      [mealId]: !prev[mealId],
    }));
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ffffff" />
        <Text style={styles.loadingText}>Carregando receitas...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>Erro ao carregar os dados. Tente novamente mais tarde.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.greeting}>Olá, usuário! 👋</Text>
      <Text style={styles.title}>CATÁLOGO DE RECEITAS</Text>

      <FlatList
        data={meals}
        keyExtractor={(item) => String(item.idMeal)}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image source={{ uri: item.strMealThumb }} style={styles.cardImage} />
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>{item.strMeal}</Text>
              <Text style={styles.cardCategory}>{item.strCategory}</Text>
              <StarRating
                rating={ratings[item.idMeal] || 0}
                setRating={(r) => handleRatingChange(item.idMeal, r)}
              />
            </View>
            <FavoriteButton
              isFavorite={favorites[item.idMeal]}
              toggleFavorite={() => toggleFavorite(item.idMeal)}
            />
          </View>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#65001f",
    paddingTop: 60,
    paddingHorizontal: 16,
  },
  greeting: {
    fontSize: 18,
    color: "#fff0f5",
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff0f5",
    marginBottom: 20,
    textAlign: "center",
    letterSpacing: 1,
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#fff9f5",
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
    position: "relative",
  },
  cardImage: {
    width: 90,
    height: 90,
    borderRadius: 12,
    marginRight: 10,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  cardCategory: {
    fontSize: 13,
    color: "#999",
    fontStyle: "italic",
    marginBottom: 6,
  },
  starsContainer: {
    flexDirection: "row",
  },
  starFilled: {
    fontSize: 20,
    color: "#ffd700",
    marginRight: 4,
  },
  starEmpty: {
    fontSize: 20,
    color: "#ccc",
    marginRight: 4,
  },
  favoriteButton: {
    padding: 6,
    marginLeft: 8,
  },
  heartFilled: {
    fontSize: 22,
    color: "red",
  },
  heartEmpty: {
    fontSize: 22,
    color: "#ccc",
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#65001f",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#fff",
    marginTop: 8,
  },
  errorContainer: {
    flex: 1,
    backgroundColor: "#65001f",
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 16,
    color: "#ffcccc",
    textAlign: "center",
    paddingHorizontal: 16,
  },
});

export default HomeScreen;