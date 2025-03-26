// App.jsx
import React, { useState, useEffect } from "react";
import { Link, Outlet } from "react-router-dom";
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Badge
} from "@mui/material";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import HomeIcon from "@mui/icons-material/Home";
import CartModal from "./components/CartModal";

// Importera CartService (eller ProductService) om du behöver hämta varukorgen
import CartService from "./services/CartService";

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customerId] = useState(1); // Exempel på inloggad användare
  const [cartCount, setCartCount] = useState(0); // <- Varukorgens antal produkter

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  // Hämta varukorgsantalet vid första renderingen
  useEffect(() => {
    updateCartCount();
  }, []);

  // Callback: Hämtar varukorgens antal från servern och uppdaterar cartCount
  const updateCartCount = async () => {
    try {
      // Exempel: om CartService.getCartItems(customerId) returnerar en array av { amount, ... }
      const cartItems = await CartService.getCartItems(customerId);
      const total = cartItems.reduce((sum, item) => sum + item.amount, 0);
      setCartCount(total);
    } catch (error) {
      console.error("Kunde inte hämta varukorgsantal:", error);
    }
  };

  return (
    <>
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static" sx={{ backgroundColor: "gold" }}>
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              <Link
                to="/"
                style={{
                  textDecoration: "none",
                  color: "#003366",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <HomeIcon sx={{ color: "#003366" }} />
                Hem
              </Link>
            </Typography>

            {/* Lägg till produkt-knapp */}
            <Button color="inherit">
              <Link
                to="/products/new"
                style={{ textDecoration: "none", color: "#003366" }}
              >
                Lägg till produkt
              </Link>
            </Button>

            {/* Varukorg med Badge som visar cartCount */}
            <Button
              color="inherit"
              onClick={openModal}
              sx={{ color: "#003366" }}
            >
              <Badge badgeContent={cartCount} color="error" overlap="circular">
                <ShoppingCartIcon sx={{ color: "#003366" }} />
              </Badge>
              &nbsp;Varukorg
            </Button>
          </Toolbar>
        </AppBar>
      </Box>

      {/* 
        Skicka med updateCartCount till barnkomponenter via Outlet Context
        så ProductDetail kan anropa det när en produkt läggs till.
      */}
      <Outlet context={{ updateCartCount, customerId }} />

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          width: "100%",
          bgcolor: "gold",
          color: "#003366",
          textAlign: "center",
          py: 4,
          mt: 4,
        }}
      >
        <Typography variant="body2" sx={{ mb: 2 }}>
          &copy; {new Date().getFullYear()} TeaTime AB. Alla rättigheter reserverade.
        </Typography>

        <Box sx={{ display: "flex", justifyContent: "center", gap: 3, mb: 2 }}>
          <Link to="/privacy-policy" style={{ textDecoration: "none", color: "#003366" }}>
            Sekretesspolicy
          </Link>
          <Link to="/terms" style={{ textDecoration: "none", color: "#003366" }}>
            Användarvillkor
          </Link>
          <Link to="/contact" style={{ textDecoration: "none", color: "#003366" }}>
            Kontakt
          </Link>
        </Box>

        <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
          <Link to="#" style={{ textDecoration: "none", color: "black" }}>
            <i className="fab fa-facebook" style={{ fontSize: "24px" }}></i>
          </Link>
          <Link to="#" style={{ textDecoration: "none", color: "black" }}>
            <i className="fab fa-twitter" style={{ fontSize: "24px" }}></i>
          </Link>
          <Link to="#" style={{ textDecoration: "none", color: "black" }}>
            <i className="fab fa-instagram" style={{ fontSize: "24px" }}></i>
          </Link>
        </Box>
      </Box>

      {/* Din varukorgsmodal */}
      <CartModal customerId={customerId} isOpen={isModalOpen} onClose={closeModal} />
    </>
  );
}

export default App;
