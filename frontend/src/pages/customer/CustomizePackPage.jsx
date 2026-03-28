import React, { useState } from "react";
import { useCart } from "../../context/CartContext";
import { FiPlus, FiMinus } from "react-icons/fi";

/*const itemsData = [
  { id: 1, name: "Rice", price: 60, img: "https://via.placeholder.com/100" },
  { id: 2, name: "Dal", price: 120, img: "https://via.placeholder.com/100" },
  { id: 3, name: "Oil", price: 150, img: "https://via.placeholder.com/100" },
  { id: 4, name: "Milk", price: 50, img: "https://via.placeholder.com/100" },
  { id: 5, name: "Eggs", price: 80, img: "https://via.placeholder.com/100" },
];*/

const itemsData = [
  {
    id: 1,
    name: "Rice",
    price: 60,
    img: "https://images.unsplash.com/photo-1586201375761-83865001e31c"
  },
  {
    id: 2,
    name: "Dal",
    price: 120,
    img: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5"
  },
  /*{
  id: 3,
  name: "Oil",
  price: 150,
  img: "https://cdn.pixabay.com/photo/2017/01/06/19/15/olive-oil-1958500_1280.jpg"
  },*/
  {
    id: 4,
    name: "Milk",
    price: 50,
    img: "https://images.unsplash.com/photo-1582719471384-894fbb16e074"
  },
  {
    id: 5,
    name: "Eggs",
    price: 80,
    img: "https://images.unsplash.com/photo-1608032077018-c9aad9565d29"
  }
];

const CustomizePackPage = () => {
  const { addToCart } = useCart();

  const [selected, setSelected] = useState([]);

  const toggleItem = (item) => {
    setSelected((prev) => {
      const exists = prev.find((i) => i.id === item.id);

      if (exists) {
        return prev.filter((i) => i.id !== item.id);
      } else {
        return [...prev, { ...item, qty: 1 }];
      }
    });
  };

  const changeQty = (id, type) => {
    setSelected((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              qty: type === "inc" ? item.qty + 1 : Math.max(1, item.qty - 1),
            }
          : item
      )
    );
  };

  //const total = selected.reduce((sum, item) => sum + item.price * item.qty, 0);
  const total = selected.reduce(
  (sum, i) => sum + Number(i.price || 0) * Number(i.qty || 1),
  0
);

  const handleAddPack = () => {
    if (selected.length === 0) {
      alert("Select at least one item");
      return;
    }
    const customPack = {
    _id: "custom-" + Date.now(),
    productName: "Custom Subscription Pack",
    price: total,
    discountedPrice: total,

    // ✅ MAIN IMAGE (first item)
    images: [selected[0]?.img],

    qty: 1,
    type: "subscription",

    // ✅ FULL ITEMS WITH IMAGES
    items: selected
  };

    addToCart(customPack);

    alert("Custom Pack added to cart ✅");
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">

      {/* HEADER */}
      <div className="bg-green-100 p-6 rounded-2xl mb-6 text-center">
        <h1 className="text-2xl font-bold text-green-800">
          Build Your Own Pack 🛒
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Select items & create your personalized subscription
        </p>
      </div>

      {/* ITEMS GRID */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {itemsData.map((item) => {
          const isSelected = selected.find((i) => i.id === item.id);

          return (
            <div
              key={item.id}
              className={`border rounded-xl p-3 cursor-pointer transition ${
                isSelected ? "border-green-500 bg-green-50" : "border-gray-200"
              }`}
              onClick={() => toggleItem(item)}
            >
              <img src={item.img} className="w-full h-24 object-cover rounded" />
              <h3 className="font-semibold mt-2 text-sm">{item.name}</h3>
              <p className="text-green-700 font-bold text-sm">₹{item.price}</p>

              {/* QTY CONTROL */}
              {isSelected && (
                <div className="flex items-center justify-between mt-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      changeQty(item.id, "dec");
                    }}
                    className="p-1 border rounded"
                  >
                    <FiMinus size={14} />
                  </button>

                  <span className="text-sm font-bold">
                    {isSelected.qty}
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      changeQty(item.id, "inc");
                    }}
                    className="p-1 border rounded"
                  >
                    <FiPlus size={14} />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* SUMMARY */}
      <div className="mt-6 p-4 border rounded-xl bg-white shadow">
        <h2 className="font-bold mb-2">Selected Items</h2>

        {selected.length === 0 ? (
          <p className="text-gray-400 text-sm">No items selected</p>
        ) : (
          <div className="space-y-1 text-sm">
            {selected.map((item) => (
              <div key={item.id} className="flex justify-between">
                <span>{item.name} x {item.qty}</span>
                <span>₹{item.price * item.qty}</span>
              </div>
            ))}
          </div>
        )}

        <div className="border-t mt-3 pt-3 flex justify-between font-bold">
          <span>Total</span>
          <span className="text-green-700">₹{total}</span>
        </div>

        <button
          onClick={handleAddPack}
          className="w-full mt-4 bg-green-500 text-white py-2 rounded-xl"
        >
          Add Pack to Cart
        </button>
      </div>
    </div>
  );
};

export default CustomizePackPage;