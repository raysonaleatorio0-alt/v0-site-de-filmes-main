"use client";

import { useState, useEffect } from "react";
import { database, auth } from "@/lib/firebase";
import { ref, set, remove, onValue } from "firebase/database";
import { onAuthStateChanged } from "firebase/auth";

export interface FavoriteItem {
  id: string;
  type: "movie" | "tv";
  addedAt: string;
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<Map<string, FavoriteItem>>(new Map());
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribeAuth();
  }, []);

  // Listen to favorites
  useEffect(() => {
    if (!user) {
      setFavorites(new Map());
      setLoading(false);
      return;
    }

    setLoading(true);
    const favoritesRef = ref(database, `users/${user.uid}/favorites`);

    const unsubscribe = onValue(
      favoritesRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          const favoriteMap = new Map<string, FavoriteItem>();
          Object.entries(data || {}).forEach(([key, value]: [string, any]) => {
            favoriteMap.set(key, {
              id: key,
              type: value.type || "movie",
              addedAt: value.addedAt || new Date().toISOString(),
            });
          });
          setFavorites(favoriteMap);
        } else {
          setFavorites(new Map());
        }
        setLoading(false);
      },
      (error) => {
        console.error("Erro ao carregar favoritos:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const addFavorite = async (contentId: string | number, type: "movie" | "tv" = "movie") => {
    if (!user) {
      alert("Faça login para adicionar favoritos");
      return;
    }

    try {
      const favRef = ref(database, `users/${user.uid}/favorites/${contentId}`);
      await set(favRef, {
        type,
        addedAt: new Date().toISOString(),
      });
      setFavorites((prev) => {
        const newMap = new Map(prev);
        newMap.set(String(contentId), {
          id: String(contentId),
          type,
          addedAt: new Date().toISOString(),
        });
        return newMap;
      });
    } catch (error) {
      console.error("Erro ao adicionar favorito:", error);
      throw error;
    }
  };

  const removeFavorite = async (contentId: string | number) => {
    if (!user) return;

    try {
      const favRef = ref(database, `users/${user.uid}/favorites/${contentId}`);
      await remove(favRef);
      setFavorites((prev) => {
        const newMap = new Map(prev);
        newMap.delete(String(contentId));
        return newMap;
      });
    } catch (error) {
      console.error("Erro ao remover favorito:", error);
      throw error;
    }
  };

  const isFavorite = (contentId: string | number) => {
    return favorites.has(String(contentId));
  };

  return {
    favorites,
    loading,
    addFavorite,
    removeFavorite,
    isFavorite,
  };
}
