// ProductDetail.jsx
import React, { useEffect, useState } from "react";
import {
  useNavigate,
  useParams,
  useOutletContext
} from "react-router-dom";
import ProductItemLarge from "../components/ProductItemLarge";
import ProductService from "../services/ProductService";
import RatingService from "../services/RatingService";
import {
  Button,
  Typography,
  TextField,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Box,
  Divider,
  LinearProgress
} from "@mui/material";
import Rating from "@mui/material/Rating";

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Hämta callback & customerId från Outlet context
  const { updateCartCount, customerId } = useOutletContext();

  const [product, setProduct] = useState(null);
  const [message, setMessage] = useState("");
  const [amount, setAmount] = useState(1);
  const [userRating, setUserRating] = useState(0);

  useEffect(() => {
    ProductService.getProductById(id)
      .then((data) => setProduct(data))
      .catch((err) => console.error("Error fetching product:", err));
  }, [id]);

  if (!product) return <p className="p-5">Laddar...</p>;

  // Betygslogik
  const totalRatings = product.ratings?.length || 0;
  const averageRating =
    totalRatings > 0
      ? product.ratings.reduce((sum, r) => sum + r.rating, 0) / totalRatings
      : 0;

  const getDistribution = (ratings) => {
    const dist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    (ratings || []).forEach((r) => {
      const star = Math.round(r.rating);
      if (star >= 1 && star <= 5) dist[star]++;
    });
    return dist;
  };
  const distribution = getDistribution(product.ratings);

  // Lägg till i varukorgen
  const handleAddToCart = async () => {
    try {
      await ProductService.addToCart(customerId, product.id, amount);
      setMessage("Produkten har lagts till i varukorgen!");

      // Uppdatera varukorgsantalet i App.jsx
      updateCartCount();
    } catch (error) {
      console.error("Misslyckades att lägga till i varukorgen:", error);
      setMessage("Kunde inte lägga till i varukorgen.");
    }
  };

  // Skicka in nytt betyg
  const handleSubmitRating = async () => {
    try {
      await RatingService.addRating(product.id, userRating);
      const updatedProduct = await ProductService.getProductById(id);
      setProduct(updatedProduct);
      setUserRating(0);
    } catch (error) {
      console.error("Kunde inte spara betyg:", error);
    }
  };

  return (
    <Grid container spacing={3} sx={{ mt: 2 }}>
      {/* Vänster kolumn – Produktinfo */}
      <Grid item xs={12} md={8}>
        <ProductItemLarge product={product} />
        <Box sx={{ mt: 3, display: "flex", alignItems: "center" }}>
          <TextField
            label="Antal"
            type="number"
            value={amount}
            onChange={(e) => setAmount(parseInt(e.target.value) || 1)}
            inputProps={{ min: 1 }}
            sx={{ width: "100px" }}
          />
          <Button variant="contained" onClick={handleAddToCart} sx={{ ml: 2 }}>
            Lägg till i varukorgen
          </Button>
          <Button variant="outlined" onClick={() => navigate(-1)} sx={{ ml: 2 }}>
            Tillbaka
          </Button>
        </Box>
        {message && (
          <Typography variant="body1" sx={{ mt: 2 }}>
            {message}
          </Typography>
        )}
      </Grid>

      {/* Höger kolumn – Betyg */}
      <Grid item xs={12} md={4}>
        <Card>
          <CardHeader title="Kundbetyg" />
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <Rating
                name="average-rating"
                value={averageRating}
                precision={0.1}
                readOnly
              />
              <Typography variant="h6" sx={{ ml: 1 }}>
                {averageRating.toFixed(1)} / 5
              </Typography>
            </Box>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
              {totalRatings} kundbetyg totalt
            </Typography>

            <Divider sx={{ mb: 2 }} />

            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              Sätt ditt betyg:
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <Rating
                name="user-rating"
                value={userRating}
                onChange={(event, newValue) => setUserRating(newValue)}
              />
              <Button
                variant="contained"
                sx={{ ml: 2 }}
                onClick={handleSubmitRating}
                disabled={userRating === 0}
              >
                Skicka
              </Button>
            </Box>

            <Divider sx={{ mb: 2 }} />

            {[5, 4, 3, 2, 1].map((star) => {
              const count = distribution[star];
              const percent =
                totalRatings === 0 ? 0 : (count / totalRatings) * 100;
              return (
                <Box
                  key={star}
                  sx={{ display: "flex", alignItems: "center", mb: 1 }}
                >
                  <Typography variant="body2" sx={{ width: 65 }}>
                    {star} stjärnor
                  </Typography>
                  <Box sx={{ flexGrow: 1, mx: 2 }}>
                    <LinearProgress variant="determinate" value={percent} />
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{ width: 25, textAlign: "right" }}
                  >
                    {count}
                  </Typography>
                </Box>
              );
            })}
          </CardContent>
        </Card>

        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 4 }}>
          <Button
            variant="outlined"
            onClick={() => navigate(`/products/${id}/edit`)}
          >
            Ändra produkt
          </Button>
        </Box>
      </Grid>
    </Grid>
  );
}

export default ProductDetail;
