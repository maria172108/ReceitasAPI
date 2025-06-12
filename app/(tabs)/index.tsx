import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from '@expo/vector-icons'; // Importando ícones

// Componentes internos permanecem os mesmos
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
      <Ionicons name={isFavorite ? "heart" : "heart-outline"} size={24} color={isFavorite ? 'red' : '#ccc'} />
    </TouchableOpacity>
  );
};

const HomeScreen = () => {
  const [allMeals, setAllMeals] = useState([]); 
  const [areas, setAreas] = useState([]);
  const [selectedArea, setSelectedArea] = useState(null);
  const [ratings, setRatings] = useState({});
  const [favorites, setFavorites] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigation = useNavigation();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [mealsResponse, areasResponse] = await Promise.all([
          fetch("https://www.themealdb.com/api/json/v1/1/search.php?s="),
          fetch("https://www.themealdb.com/api/json/v1/1/list.php?a=list"),
        ]);
        
        const mealsData = await mealsResponse.json();
        const areasData = await areasResponse.json();

        setAllMeals(mealsData.meals || []);
        setAreas([{ strArea: "Todos" }, ...(areasData.meals || [])]);

      } catch (error) {
        console.error("Erro ao buscar os dados:", error);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleRatingChange = (mealId, rating) => {
    setRatings((prev) => ({ ...prev, [mealId]: rating }));
  };

  const toggleFavorite = (mealId) => {
    setFavorites((prev) => ({ ...prev, [mealId]: !prev[mealId] }));
  };

  const handleClearSearch = () => {
    setSearchQuery("");
  };
  
  const handleAreaSelect = (area) => {
    setSelectedArea(area === "Todos" ? null : area);
  };

  const mealsToDisplay = (() => {
    let filtered = allMeals;

    if (selectedArea) {
      filtered = allMeals.filter(meal => meal.strArea === selectedArea);
    }

    if (searchQuery) {
      filtered = filtered.filter((meal) =>
        meal.strMeal.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return filtered;
  })();

  if (loading) {
    return <SafeAreaView style={styles.loadingContainer}><ActivityIndicator size="large" color="#ffffff" /><Text style={styles.loadingText}>Carregando...</Text></SafeAreaView>;
  }

  if (error) {
    return <SafeAreaView style={styles.errorContainer}><Text style={styles.errorText}>Erro ao carregar dados.</Text></SafeAreaView>;
  }

  // Componente para o cabeçalho da lista principal
  const ListHeader = () => (
    <>
      <Text style={styles.title}>CATÁLOGO DE RECEITAS</Text>

      {/* ÁREA DE PESQUISA REPOSICIONADA E COM NOVO ESTILO */}
      <View style={styles.searchWrapper}>
        <Ionicons name="search" size={20} color="#65001f" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Pesquisar por nome da receita..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={handleClearSearch} style={styles.clearButton}>
            <Ionicons name="close-circle" size={22} color="#aaa" />
          </TouchableOpacity>
        )}
      </View>

      {/* SEÇÃO DE PAÍSES */}
      <Text style={styles.sectionTitle}>Filtrar por País</Text>
      <FlatList
        data={areas}
        keyExtractor={(item) => item.strArea}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.areaListContainer}
        renderItem={({ item }) => {
            const areaName = item.strArea;
            const isSelected = selectedArea === areaName || (!selectedArea && areaName === "Todos");
            return (
                <TouchableOpacity
                    style={[styles.areaButton, isSelected && styles.areaButtonSelected]}
                    onPress={() => handleAreaSelect(areaName)}
                >
                    <Text style={[styles.areaButtonText, isSelected && styles.areaButtonTextSelected]}>{areaName}</Text>
                </TouchableOpacity>
            )
        }}
      />
    </>
  );
  
  // Componente para quando a lista está vazia
  const EmptyListComponent = () => (
    <View style={styles.emptyContainer}>
        <Ionicons name="sad-outline" size={60} color="rgba(255,255,255,0.5)" />
        <Text style={styles.emptyText}>Nenhuma receita encontrada</Text>
        <Text style={styles.emptySubText}>Tente uma busca diferente ou altere o filtro de país.</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        ListHeaderComponent={ListHeader}
        data={mealsToDisplay}
        keyExtractor={(item) => String(item.idMeal)}
        ListEmptyComponent={EmptyListComponent} // Adicionado
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("Detalhes", {
                meal: item,
                isFavorite: !!favorites[item.idMeal],
                onToggleFavorite: () => toggleFavorite(item.idMeal),
              })
            }
          >
            <View style={styles.card}>
              <Image source={{ uri: item.strMealThumb }} style={styles.cardImage} />
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle} numberOfLines={2}>{item.strMeal}</Text>
                <Text style={styles.cardCategory}>{item.strCategory}</Text>
                <StarRating
                  rating={ratings[item.idMeal] || 0}
                  setRating={(r) => handleRatingChange(item.idMeal, r)}
                />
              </View>
              <FavoriteButton
                isFavorite={!!favorites[item.idMeal]}
                toggleFavorite={() => toggleFavorite(item.idMeal)}
              />
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#65001f",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff0f5",
    marginTop: 20,
    marginBottom: 20,
    textAlign: "center",
    letterSpacing: 1,
    paddingHorizontal: 16,
  },
  // --- ESTILOS DE PESQUISA MELHORADOS ---
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff9f5',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginHorizontal: 16,
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  clearButton: {
    padding: 4,
  },
  // --- FIM DOS ESTILOS DE PESQUISA ---
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff0f5',
    marginBottom: 10,
    paddingHorizontal: 16,
  },
  areaListContainer: {
    paddingHorizontal: 16,
    paddingBottom: 25,
  },
  areaButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 10,
  },
  areaButtonSelected: {
    backgroundColor: '#fff9f5',
  },
  areaButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  areaButtonTextSelected: {
    color: '#65001f',
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#fff9f5",
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
    marginHorizontal: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  cardImage: {
    width: 90,
    height: 90,
    borderRadius: 12,
    marginRight: 12,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'space-between',
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
    marginBottom: 8,
  },
  starsContainer: {
    flexDirection: "row",
  },
  starFilled: { fontSize: 20, color: "#ffd700", marginRight: 4 },
  starEmpty: { fontSize: 20, color: "#ccc", marginRight: 4 },
  favoriteButton: {
    padding: 8,
    marginLeft: 8,
    alignSelf: 'flex-start'
  },
  loadingContainer: { flex: 1, backgroundColor: "#65001f", justifyContent: "center", alignItems: "center" },
  loadingText: { color: "#fff", marginTop: 10, fontSize: 16 },
  errorContainer: { flex: 1, backgroundColor: "#65001f", justifyContent: "center", alignItems: "center" },
  errorText: { fontSize: 16, color: "#ffcccc", textAlign: "center", paddingHorizontal: 16 },
  // --- ESTILOS PARA LISTA VAZIA ---
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'rgba(255,255,255,0.8)',
    marginTop: 10,
  },
  emptySubText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 4,
    textAlign: 'center',
  },
});

export default HomeScreen;