import { createContext, useContext, useState } from "react"

const FavoritesContext = createContext(undefined)

export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState([
    {
      id: "1",
      title: "Handwoven Basket",
      artist: "Sarah Chen",
      image: "/placeholder.svg?height=300&width=300",
      price: 45,
      category: "Home Decor",
    },
    {
      id: "2",
      title: "Ceramic Vase",
      artist: "Mike Johnson",
      image: "/placeholder.svg?height=300&width=300",
      price: 65,
      category: "Pottery",
    },
  ])

  const addToFavorites = (craft) => {
    setFavorites((prev) => [...prev, craft])
  }

  const removeFromFavorites = (craftId) => {
    setFavorites((prev) => prev.filter((craft) => craft.id !== craftId))
  }

  const isFavorite = (craftId) => {
    return favorites.some((craft) => craft.id === craftId)
  }

  const clearFavorites = () => {
    setFavorites([])
  }

  return (
    <FavoritesContext.Provider
      value={{ favorites, addToFavorites, removeFromFavorites, isFavorite, clearFavorites }}
    >
      {children}
    </FavoritesContext.Provider>
  )
}

export function useFavorites() {
  const context = useContext(FavoritesContext)
  if (context === undefined) {
    throw new Error("useFavorites must be used within a FavoritesProvider")
  }
  return context
}