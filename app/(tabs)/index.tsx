import React, { useCallback, useEffect, useState } from "react";
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
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FAVORITES_KEY = '@myApp:favorites';

// RE-ADICIONADO: Definição do componente StarRating
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

const FavoriteButton = ({ isFavorite, toggleFavorite, isLoading }) => {
  if (isLoading) {
    return (
      <View style={styles.favoriteButton}>
        <ActivityIndicator size="small" color="#ccc" />
      </View>
    );
  }
  return (
    <TouchableOpacity onPress={toggleFavorite} style={styles.favoriteButton}>
      <Ionicons name={isFavorite ? "heart" : "heart-outline"} size={24} color={isFavorite ? 'red' : '#ccc'} />
    </TouchableOpacity>
  );
};

const HomeScreen = () => {
  const [allMeals, setAllMeals] = useState([]); 
  const [areas, setAreas] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState("Todos"); 
  const [ratings, setRatings] = useState({}); // Lógica de rating já estava aqui
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [savingFavoriteId, setSavingFavoriteId] = useState<string | null>(null); 
  const navigation = useNavigation();

  // Funções de AsyncStorage
  const loadFavorites = async () => {
    try {
      const storedFavorites = await AsyncStorage.getItem(FAVORITES_KEY);
      if (storedFavorites !== null) {
        setFavorites(JSON.parse(storedFavorites));
      }
    } catch (e) {
      console.error("Erro ao carregar favoritos.", e);
    }
  };
  
  const saveFavorites = async (newFavorites: string[]) => {
    try {
      const jsonValue = JSON.stringify(newFavorites);
      await AsyncStorage.setItem(FAVORITES_KEY, jsonValue);
    } catch (e) {
      console.error("Erro ao salvar favoritos.", e);
    }
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      await loadFavorites();
      const [mealsResponse, areasResponse] = await Promise.all([
        fetch("https://www.themealdb.com/api/json/v1/1/search.php?s="),
        fetch("https://www.themealdb.com/api/json/v1/1/list.php?a=list"),
      ]);
      
      const mealsData = await mealsResponse.json();
      const areasData = await areasResponse.json();

      if (!mealsData.meals || !areasData.meals) {
          throw new Error("Resposta da API inválida");
      }

      setAllMeals(mealsData.meals);
      setAreas([
        { strArea: "Todos" }, 
        { strArea: "Favoritos" }, 
        ...(areasData.meals)
      ]);
    } catch (e) {
      console.error("Erro ao buscar os dados:", e);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // RE-ADICIONADO: A função para lidar com a mudança de avaliação
  const handleRatingChange = (mealId, rating) => {
    setRatings((prev) => ({ ...prev, [mealId]: rating }));
  };

  const toggleFavorite = async (mealId: string) => {
    setSavingFavoriteId(mealId); 
    try {
      const newFavorites = favorites.includes(mealId)
        ? favorites.filter(id => id !== mealId)
        : [...favorites, mealId];
      
      setFavorites(newFavorites);
      await saveFavorites(newFavorites);
    } catch (e) {
      console.error("Erro ao salvar favorito:", e);
    } finally {
      setSavingFavoriteId(null); 
    }
  };
  
  const handleClearSearch = () => { setSearchQuery(""); };
  const handleFilterSelect = (filter: string) => { setSelectedFilter(filter); };

  const mealsToDisplay = (() => {
    let filtered = allMeals;
    if (selectedFilter === "Favoritos") {
      filtered = allMeals.filter(meal => favorites.includes(meal.idMeal));
    } else if (selectedFilter !== "Todos") {
      filtered = allMeals.filter(meal => meal.strArea === selectedFilter);
    }
    if (searchQuery) {
      filtered = filtered.filter((meal) =>
        meal.strMeal.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return filtered;
  })();

  if (loading) {
    return <SafeAreaView style={styles.loadingContainer}><ActivityIndicator size="large" color="#ffffff" /><Text style={styles.loadingText}>Carregando Receitas...</Text></SafeAreaView>;
  }

  if (error) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Ionicons name="cloud-offline-outline" size={60} color="rgba(255,255,255,0.7)" />
        <Text style={styles.errorTitle}>Ops! Algo deu errado.</Text>
        <Text style={styles.errorSubtitle}>Não foi possível carregar as receitas. Verifique sua conexão e tente novamente.</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchData}>
            <Text style={styles.retryButtonText}>Tentar Novamente</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const ListHeader = () => (
    <>
      <Text style={styles.title}>CATÁLOGO DE RECEITAS</Text>
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
      <Text style={styles.sectionTitle}>Filtrar por</Text> 
      <FlatList
        data={areas}
        keyExtractor={(item) => item.strArea}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.areaListContainer}
        renderItem={({ item }) => {
            const filterName = item.strArea;
            const isSelected = selectedFilter === filterName;
            const isFavoritesButton = filterName === 'Favoritos';
            return (
                <TouchableOpacity
                    style={[styles.areaButton, isSelected && styles.areaButtonSelected]}
                    onPress={() => handleFilterSelect(filterName)}
                >
                    {isFavoritesButton && <Ionicons name="heart" size={14} color={isSelected ? '#65001f' : '#fff'} style={{ marginRight: 6 }} />}
                    <Text style={[styles.areaButtonText, isSelected && styles.areaButtonTextSelected]}>{filterName}</Text>
                </TouchableOpacity>
            )
        }}
      />
    </>
  );
  
  const EmptyListComponent = () => (
    <View style={styles.emptyContainer}>
        <Ionicons name="sad-outline" size={60} color="rgba(255,255,255,0.5)" />
        <Text style={styles.emptyText}>Nenhuma receita encontrada</Text>
        {selectedFilter === 'Favoritos' 
          ? <Text style={styles.emptySubText}>Toque no coração de uma receita para adicioná-la aqui.</Text>
          : <Text style={styles.emptySubText}>Tente uma busca diferente ou altere o filtro de país.</Text>
        }
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        ListHeaderComponent={ListHeader}
        data={mealsToDisplay}
        keyExtractor={(item) => String(item.idMeal)}
        ListEmptyComponent={EmptyListComponent}
        renderItem={({ item }) => {
          const isFavorite = favorites.includes(item.idMeal);
          
          return (
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("Detalhes", {
                  mealId: item.idMeal,
                  isFavorite: isFavorite,
                  onToggleFavorite: () => toggleFavorite(item.idMeal),
                })
              }
            >
              <View style={styles.card}>
                <Image source={{ uri: item.strMealThumb }} style={styles.cardImage} />
                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle} numberOfLines={2}>{item.strMeal}</Text>
                  <Text style={styles.cardCategory}>{item.strCategory}</Text>
                  {/* RE-ADICIONADO: O componente StarRating sendo usado aqui */}
                  <StarRating
                    rating={ratings[item.idMeal] || 0}
                    setRating={(r) => handleRatingChange(item.idMeal, r)}
                  />
                </View>
                <FavoriteButton
                  isFavorite={isFavorite}
                  toggleFavorite={() => toggleFavorite(item.idMeal)}
                  isLoading={savingFavoriteId === item.idMeal}
                />
              </View>
            </TouchableOpacity>
          );
        }}
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
  searchIcon: { marginRight: 8 },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  clearButton: { padding: 4 },
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 10,
  },
  areaButtonSelected: { backgroundColor: '#fff9f5' },
  areaButtonText: { color: '#fff', fontWeight: '600' },
  areaButtonTextSelected: { color: '#65001f' },
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
  // RE-ADICIONADO: Os estilos para o componente de estrelas
  starsContainer: {
    flexDirection: "row",
  },
  starFilled: { fontSize: 20, color: "#ffd700", marginRight: 4 },
  starEmpty: { fontSize: 20, color: "#ccc", marginRight: 4 },
  favoriteButton: {
    padding: 8,
    marginLeft: 8,
    alignSelf: 'flex-start',
    width: 40, 
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: { flex: 1, backgroundColor: "#65001f", justifyContent: "center", alignItems: "center" },
  loadingText: { color: "#fff", marginTop: 10, fontSize: 16 },
  errorContainer: { 
    flex: 1, 
    backgroundColor: "#65001f", 
    justifyContent: "center", 
    alignItems: "center",
    paddingHorizontal: 20,
  },
  errorTitle: { 
    fontSize: 22, 
    fontWeight: 'bold',
    color: "#ffcccc", 
    textAlign: "center", 
    marginTop: 16,
  },
  errorSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginTop: 8,
  },
  retryButton: {
    marginTop: 24,
    backgroundColor: '#fff9f5',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  retryButtonText: {
    color: '#65001f',
    fontSize: 16,
    fontWeight: 'bold',
  },
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