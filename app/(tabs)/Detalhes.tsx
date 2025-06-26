import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const Detalhes = () => {
  const route = useRoute();
  const navigation = useNavigation();
  
  // RECEBEMOS APENAS O ID E AS FUNÇÕES DE CONTROLE DA TELA ANTERIOR
  const { mealId, isFavorite: initialIsFavorite, onToggleFavorite } = route.params;

  // ESTADOS ESPECÍFICOS DESTA TELA
  const [mealDetails, setMealDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  // ESTADOS PARA O BOTÃO DE FAVORITO
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [isSaving, setIsSaving] = useState(false);

  // FUNÇÃO PARA BUSCAR OS DETALHES DA RECEITA PELA API
  const fetchDetails = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const response = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealId}`);
      const data = await response.json();
      if (data.meals && data.meals[0]) {
        setMealDetails(data.meals[0]);
      } else {
        throw new Error("Receita não encontrada.");
      }
    } catch (e) {
      console.error("Erro ao buscar detalhes da receita:", e);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [mealId]); // A função depende do mealId

  // BUSCA OS DADOS QUANDO O COMPONENTE É MONTADO
  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  // FUNÇÃO PARA LIDAR COM O CLIQUE NO BOTÃO DE FAVORITO
  const handleToggleFavorite = async () => {
    if (isSaving) return;

    setIsSaving(true);
    try {
      await onToggleFavorite(); // Chama a função da HomeScreen
      setIsFavorite((prev) => !prev);
    } catch (e) {
      console.error("Erro ao favoritar na tela de detalhes:", e);
      // Aqui você pode adicionar um Alert para o usuário
    } finally {
      setIsSaving(false);
    }
  };

  // FUNÇÃO PARA EXTRAIR INGREDIENTES (helper)
  const getIngredients = (meal) => {
    const ingredients = [];
    if (!meal) return ingredients;
    for (let i = 1; i <= 20; i++) {
      const ingredient = meal[`strIngredient${i}`];
      const measure = meal[`strMeasure${i}`];
      if (ingredient && ingredient.trim() !== "") {
        ingredients.push(`${measure} ${ingredient}`);
      }
    }
    return ingredients;
  };
  
  // ===================================================================
  // RENDERIZAÇÃO CONDICIONAL (LOADING, ERROR, SUCCESS)
  // ===================================================================

  // 1. ESTADO DE CARREGAMENTO
  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={styles.loadingText}>Carregando detalhes...</Text>
      </SafeAreaView>
    );
  }

  // 2. ESTADO DE ERRO
  if (error) {
    return (
      <SafeAreaView style={[styles.container, styles.center]}>
        <Ionicons name="alert-circle-outline" size={60} color="rgba(255,255,255,0.7)" />
        <Text style={styles.errorTitle}>Erro ao Carregar</Text>
        <Text style={styles.errorSubtitle}>Não foi possível buscar os detalhes da receita.</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchDetails}>
          <Text style={styles.retryButtonText}>Tentar Novamente</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.backButtonError} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonErrorText}>Voltar</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // 3. ESTADO DE SUCESSO (CONTEÚDO PRINCIPAL)
  const ingredients = getIngredients(mealDetails);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.headerTitle} numberOfLines={1}>{mealDetails.strMeal}</Text>

        <TouchableOpacity style={styles.headerButton} onPress={handleToggleFavorite} disabled={isSaving}>
          {isSaving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons
              name={isFavorite ? "heart" : "heart-outline"}
              size={28}
              color={isFavorite ? "#ff4757" : "#fff"}
            />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView>
        <Image source={{ uri: mealDetails.strMealThumb }} style={styles.image} />
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>Ingredientes</Text>
          {ingredients.map((item, index) => (
            <Text key={index} style={styles.ingredient}>
              • {item}
            </Text>
          ))}

          <Text style={styles.sectionTitle}>Modo de Preparo</Text>
          <Text style={styles.instructions}>{mealDetails.strInstructions}</Text>
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
  center: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    color: '#fff',
    fontSize: 16,
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
    marginBottom: 24,
  },
  retryButton: {
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
  backButtonError: {
      marginTop: 20,
  },
  backButtonErrorText: {
      color: '#fff',
      fontSize: 16,
      textDecorationLine: 'underline',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 10,
    height: 60,
  },
  headerButton: {
    padding: 6,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginHorizontal: 10,
  },
  image: {
    width: "100%",
    height: 250,
  },
  content: {
    padding: 20,
    backgroundColor: "#fff9f5",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -20,
    minHeight: '100%'
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#65001f",
    marginTop: 16,
    marginBottom: 12,
  },
  ingredient: {
    fontSize: 16,
    color: "#333",
    marginBottom: 6,
  },
  instructions: {
    fontSize: 16,
    color: "#333",
    marginTop: 4,
    lineHeight: 24,
    textAlign: "justify",
  },
});

export default Detalhes;