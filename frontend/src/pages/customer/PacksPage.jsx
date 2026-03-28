import React, { useState } from "react";
import { useCart } from "../../context/CartContext"; // ✅ added
import { useNavigate } from "react-router-dom";
const packsData = [
  {
    id: 1,
    title: "Daily Essentials Pack",
    category: "grocery",
    type: "Monthly • Essentials",
    desc: "Your everyday grocery needs delivered fresh",
    items: ["Rice (5kg)", "Dal (2kg)", "Oil (2L)"],
    more: "+3 more items",
    price: 999,
    oldPrice: 1299,
    tagLeft: "🔥 Popular",
    tagRight: "Save ₹300",
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e",
  },
  {
    id: 2,
    title: "Fresh Veggies Weekly",
    category: "vegetables",
    type: "Weekly • Vegetables",
    desc: "Farm-fresh vegetables every week",
    items: ["Tomatoes (1kg)", "Onions (1kg)", "Potatoes (2kg)"],
    more: "+2 more items",
    price: 399,
    oldPrice: 499,
    tagLeft: "🔥 Popular",
    tagRight: "Save ₹100",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd",
  },
  {
    id: 3,
    title: "Dairy Delight",
    category: "dairy",
    type: "Monthly • Dairy",
    desc: "Fresh dairy products at your doorstep",
    items: ["Milk (30L)", "Curd (4kg)", "Paneer (1kg)"],
    more: "+2 more items",
    price: 599,
    oldPrice: 749,
    tagLeft: "",
    tagRight: "Save ₹150",
    image: "https://images.unsplash.com/photo-1580910051074-3eb694886505",
  },
];

const PacksPage = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("all");

  const { addToCart } = useCart(); // ✅ added

  // ✅ subscribe handler
  const handleSubscribe = (pack) => {
    addToCart({
      _id: pack.id,
      productName: pack.title,
      price: pack.price,
      discountedPrice: pack.price,
      images: [pack.image],
      qty: 1,
      shop: { shopName: "Subscription Pack" },
      type: "subscription",
    });
  };

  const filteredPacks =
    filter === "all"
      ? packsData
      : packsData.filter((p) => p.category === filter);

  return (
    <div style={{ padding: "20px", background: "#f5f5f5" }}>

      {/* HEADER */}
      <div style={header}>
        <h1 style={{ marginBottom: "10px" }}>Subscription Packs</h1>
        <p>
          Save up to 25% with our curated grocery bundles. <br />
          Customize your pack and get regular deliveries!
        </p>
      </div>

      {/* FILTER BAR */}
      <div style={filterBar}>
        <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
          
          <button
            style={filter === "all" ? activeFilter : filterBtn}
            onClick={() => setFilter("all")}
          >
            All
          </button>

          <button
            style={filter === "vegetables" ? activeFilter : filterBtn}
            onClick={() => setFilter("vegetables")}
          >
            Vegetables
          </button>

          <button
            style={filter === "grocery" ? activeFilter : filterBtn}
            onClick={() => setFilter("grocery")}
          >
            Grocery
          </button>

          <button
            style={filter === "dairy" ? activeFilter : filterBtn}
            onClick={() => setFilter("dairy")}
          >
            Dairy
          </button>
        </div>

        <button style={customizeBtn} onClick={() => navigate("/customize")}>
  + Customize
</button>
      </div>

      {/* CARDS */}
      <div style={grid}>
        {filteredPacks.map((p) => (
          <div key={p.id} style={card}>

            <div style={{ position: "relative" }}>
              <img src={p.image} style={img} />
              {p.tagLeft && <span style={tagLeft}>{p.tagLeft}</span>}
              {p.tagRight && <span style={tagRight}>{p.tagRight}</span>}
            </div>

            <div style={content}>
              <p style={subText}>{p.type}</p>
              <h3>{p.title}</h3>
              <p style={desc}>{p.desc}</p>

              <ul style={list}>
                {p.items.map((item, i) => (
                  <li key={i}>✔ {item}</li>
                ))}
                <li style={{ color: "green" }}>{p.more}</li>
              </ul>

              <div style={bottomRow}>
                <div>
                  <h3>
                    ₹{p.price} <span style={strike}>₹{p.oldPrice}</span>
                  </h3>
                  <p style={small}>
                    /{p.category === "vegetables" ? "weekly" : "monthly"}
                  </p>
                </div>

                {/* ✅ UPDATED BUTTON */}
                <button style={btn} onClick={() => handleSubscribe(p)}>
  Subscribe
</button>

              </div>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
};

export default PacksPage;

//////////////////// STYLES ////////////////////

const header = {
  background: "#6bd36b",
  padding: "40px",
  borderRadius: "10px",
  textAlign: "center"
};

const filterBar = {
  display: "flex",
  justifyContent: "space-between",
  marginTop: "20px",
  marginBottom: "20px"
};

const activeFilter = {
  background: "#6bd36b",
  border: "none",
  padding: "8px 15px",
  borderRadius: "20px"
};

const filterBtn = {
  padding: "8px 15px",
  borderRadius: "20px",
  border: "none",
  background: "transparent",
  cursor: "pointer"
};

const customizeBtn = {
  background: "#6bd36b",
  border: "none",
  padding: "10px 20px",
  borderRadius: "20px",
  cursor: "pointer"
};

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: "20px"
};

const card = {
  background: "#fff",
  borderRadius: "12px",
  overflow: "hidden",
  boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
};

const img = {
  width: "100%",
  height: "180px",
  objectFit: "cover"
};

const content = {
  padding: "15px"
};

const subText = {
  fontSize: "12px",
  color: "gray"
};

const desc = {
  fontSize: "13px",
  color: "#555"
};

const list = {
  fontSize: "13px",
  marginTop: "10px"
};

const bottomRow = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginTop: "15px"
};

const btn = {
  background: "#2e7d32",
  color: "white",
  padding: "8px 15px",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer"
};

const strike = {
  textDecoration: "line-through",
  color: "gray",
  marginLeft: "8px",
  fontSize: "14px"
};

const small = {
  fontSize: "12px",
  color: "gray"
};

const tagLeft = {
  position: "absolute",
  top: "10px",
  left: "10px",
  background: "orange",
  color: "white",
  padding: "4px 8px",
  borderRadius: "10px",
  fontSize: "12px"
};

const tagRight = {
  position: "absolute",
  top: "10px",
  right: "10px",
  background: "#2e7d32",
  color: "white",
  padding: "4px 8px",
  borderRadius: "10px",
  fontSize: "12px"
};