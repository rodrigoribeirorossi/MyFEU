import React, { useState } from "react";

export default function WidgetShoppingList({ data }) {
  const [items, setItems] = useState(data?.config?.items || []);
  const [newItem, setNewItem] = useState("");

  const addItem = () => {
    if (newItem.trim() === "") return;
    setItems([...items, { id: Date.now(), name: newItem, completed: false }]);
    setNewItem("");
  };

  const toggleItem = (id) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const removeItem = (id) => {
    setItems(items.filter(item => item.id !== id));
  };

  return (
    <div className="widget-shopping-list">
      <div className="shopping-input">
        <input
          type="text"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          placeholder="Adicionar item..."
          onKeyPress={(e) => e.key === 'Enter' && addItem()}
        />
        <button onClick={addItem}>+</button>
      </div>
      
      <ul className="shopping-items">
        {items.length === 0 ? (
          <li className="empty-list">Sua lista está vazia</li>
        ) : (
          items.map(item => (
            <li key={item.id} className={item.completed ? "completed" : ""}>
              <input
                type="checkbox"
                checked={item.completed}
                onChange={() => toggleItem(item.id)}
              />
              <span>{item.name}</span>
              <button onClick={() => removeItem(item.id)}>×</button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}