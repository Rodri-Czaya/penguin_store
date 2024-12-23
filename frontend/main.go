package main

import (
	"context"
	"html/template"
	"log"
	"net/http"
	"strconv"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type Product struct {
	ID          string  `bson:"_id"`
	Name        string  `bson:"name"`
	Price       float64 `bson:"price"`
	Description string  `bson:"description"`
	ImageUrl    string  `bson:"imageUrl"`
}

type Order struct {
	CustomerName string         `bson:"customerName"`
	Address      string         `bson:"address"`
	Products     []OrderProduct `bson:"products"`
	TotalAmount  float64        `bson:"totalAmount"`
	Status       string         `bson:"status"`
}

type OrderProduct struct {
	ProductID string `bson:"productId"`
	Quantity  int    `bson:"quantity"`
}

var client *mongo.Client
var productsCollection *mongo.Collection
var ordersCollection *mongo.Collection

func main() {
	// Connect to MongoDB
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	clientOptions := options.Client().ApplyURI("mongodb://localhost:27017")
	var err error
	client, err = mongo.Connect(ctx, clientOptions)
	if err != nil {
		log.Fatal(err)
	}

	// Initialize collections
	db := client.Database("ecommerce")
	productsCollection = db.Collection("products")
	ordersCollection = db.Collection("orders")

	// Routes
	http.HandleFunc("/", handleHome)
	http.HandleFunc("/checkout", handleCheckout)
	http.HandleFunc("/place-order", handlePlaceOrder)

	// Start server
	log.Println("Server starting on port 8080...")
	log.Fatal(http.ListenAndServe(":8080", nil))
}

func handleHome(w http.ResponseWriter, r *http.Request) {
	ctx := context.Background()

	// Fetch products from MongoDB
	cursor, err := productsCollection.Find(ctx, bson.M{})
	if err != nil {
		http.Error(w, "Error fetching products", http.StatusInternalServerError)
		return
	}
	defer cursor.Close(ctx)

	var products []Product
	if err = cursor.All(ctx, &products); err != nil {
		http.Error(w, "Error parsing products", http.StatusInternalServerError)
		return
	}

	// Parse and execute template
	tmpl, err := template.ParseFiles("templates/index.html")
	if err != nil {
		http.Error(w, "Error loading template", http.StatusInternalServerError)
		return
	}

	tmpl.Execute(w, products)
}

func handleCheckout(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		http.Redirect(w, r, "/", http.StatusSeeOther)
		return
	}

	// Parse form
	err := r.ParseForm()
	if err != nil {
		http.Error(w, "Error parsing form", http.StatusBadRequest)
		return
	}

	// Get selected products and quantities
	selectedProducts := r.Form["product"]
	quantities := r.Form["quantity"]

	// Parse and execute checkout template
	tmpl, err := template.ParseFiles("templates/checkout.html")
	if err != nil {
		http.Error(w, "Error loading template", http.StatusInternalServerError)
		return
	}

	data := struct {
		Products   []string
		Quantities []string
	}{
		Products:   selectedProducts,
		Quantities: quantities,
	}

	tmpl.Execute(w, data)
}

func handlePlaceOrder(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		http.Redirect(w, r, "/", http.StatusSeeOther)
		return
	}

	err := r.ParseForm()
	if err != nil {
		http.Error(w, "Error parsing form", http.StatusBadRequest)
		return
	}

	// Get products and quantities from form
	productIDs := r.Form["product"]
	quantities := r.Form["quantity"]

	// Create products array for order
	var orderProducts []OrderProduct
	var totalAmount float64

	// Process each product
	for i, productID := range productIDs {
		quantity, err := strconv.Atoi(quantities[i])
		if err != nil || quantity <= 0 {
			continue
		}

		// Find product to get price
		var product Product
		objectID, err := primitive.ObjectIDFromHex(productID)
		if err != nil {
			continue
		}

		err = productsCollection.FindOne(context.Background(), bson.M{"_id": objectID}).Decode(&product)
		if err != nil {
			continue
		}

		orderProducts = append(orderProducts, OrderProduct{
			ProductID: productID,
			Quantity:  quantity,
		})

		totalAmount += product.Price * float64(quantity)
	}

	// Create order with proper structure
	order := bson.M{
		"customerName": r.FormValue("customerName"),
		"address":      r.FormValue("address"),
		"products":     orderProducts,
		"totalAmount":  totalAmount,
		"status":       "completed",
		"orderDate":    time.Now(),
	}

	// Save order to MongoDB
	ctx := context.Background()
	_, err = ordersCollection.InsertOne(ctx, order)
	if err != nil {
		http.Error(w, "Error saving order", http.StatusInternalServerError)
		return
	}

	// Show success page
	tmpl, err := template.ParseFiles("templates/success.html")
	if err != nil {
		http.Error(w, "Error loading template", http.StatusInternalServerError)
		return
	}

	tmpl.Execute(w, nil)
}
