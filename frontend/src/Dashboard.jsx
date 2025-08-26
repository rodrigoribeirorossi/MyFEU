import React, { useState, useEffect } from "react";
import WidgetCard from "./WidgetCard";
import AddWidgetModal from "./AddWidgetModal";
import AppearanceModal from "./AppearanceModal";
import Notification from './Notification';
import "./styles.css";

export default function Dashboard() {
  const [userWidgets, setUserWidgets] = useState(Array(12).fill(null));
  const [showModal, setShowModal] = useState(false);
  const [showAppearance, setShowAppearance] = useState(false);
  const [bgColor, setBgColor] = useState("#f6f8fc");
  const [frontendName, setFrontendName] = useState("Seu Front End");
  const [editingName, setEditingName] = useState(false);
  const [tempName, setTempName] = useState(frontendName);
  const [context, setContext] = useState({
    location: "",
    temperature: "",
    datetime: ""
  });
  const [addWidgetSlot, setAddWidgetSlot] = useState(null);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Data/Hora
    const updateDateTime = () => {
      const now = new Date();
      setContext(ctx => ({
        ...ctx,
        datetime: now.toLocaleString()
      }));
    };
    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);

    // Localização
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async position => {
        const { latitude, longitude } = position.coords;
        // Busca cidade/estado via API pública
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
        const data = await res.json();
        const city = data.address.city || data.address.town || data.address.village || "";
        const state = data.address.state || "";
        const country = data.address.country || "";
        setContext(ctx => ({
          ...ctx,
          location: `${city} | ${state} | ${country}`
        }));

        // Busca temperatura via Open-Meteo
        const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`);
        const weatherData = await weatherRes.json();
        const temp = weatherData.current_weather?.temperature;
        setContext(ctx => ({
          ...ctx,
          temperature: temp ? `${temp}°C` : ""
        }));
      });
    }

    return () => clearInterval(interval);
  }, []);

  const showNotification = (message, type = 'success') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    return id;
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const handleWidgetAdded = (newWidget, slot) => {
    try {
      console.log("Adicionando widget ao slot:", slot, newWidget);
      
      if (!newWidget) {
        showNotification('Erro ao adicionar widget: Dados inválidos', 'error');
        return;
      }
      
      // Clone o array atual de widgets
      const newWidgets = [...userWidgets];
      
      // Adicione o novo widget ao slot específico
      newWidgets[slot] = newWidget;
      
      // Atualize o estado com o novo array
      setUserWidgets(newWidgets);
      
      // Mostrar notificação de sucesso
      showNotification(`Widget "${newWidget.name}" adicionado com sucesso!`, 'success');
      
      // Fechar o modal
      setAddWidgetSlot(null);
    } catch (error) {
      console.error("Erro ao adicionar widget:", error);
      showNotification(`Erro ao adicionar widget: ${error.message}`, 'error');
    }
  };

  const removeWidgetAt = (index) => {
    try {
      const newWidgets = [...userWidgets];
      const removed = newWidgets[index];
      newWidgets[index] = null;
      setUserWidgets(newWidgets);
      showNotification(`Widget "${removed?.name || 'Widget'}" removido`, 'success');
    } catch (error) {
      console.error("Erro ao remover widget:", error);
      showNotification(`Erro ao remover widget: ${error.message}`, 'error');
    }
  };

  return (
    <div className="dashboard-container" style={{ background: bgColor }}>
      <header className="dashboard-header">
        <div>
          <strong>Localidade:</strong> {context.location}
        </div>
        <div>
          <strong>Temperatura:</strong> {context.temperature}
        </div>
        <div>
          <strong>Data/Hora:</strong> {context.datetime}
        </div>
      </header>
      <div style={{ marginBottom: "12px" }}>
        {editingName ? (
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <input
              type="text"
              value={tempName}
              onChange={e => setTempName(e.target.value)}
              style={{ fontSize: "2rem", padding: "4px 8px" }}
            />
            <button
              className="btn-primary"
              onClick={() => {
                setFrontendName(tempName);
                setEditingName(false);
              }}
            >
              Salvar
            </button>
            <button
              className="btn-secondary"
              onClick={() => {
                setTempName(frontendName);
                setEditingName(false);
              }}
            >
              Cancelar
            </button>
          </div>
        ) : (
          <h1
            className="dashboard-title"
            style={{ cursor: "pointer" }}
            onClick={() => setEditingName(true)}
          >
            {frontendName}
          </h1>
        )}
      </div>
      <div style={{ display: "flex", gap: "12px", marginBottom: "12px" }}>
        <button className="add-widget-btn" onClick={() => setShowModal(true)}>
          + Adicionar Widget
        </button>
        <button
          className="add-widget-btn"
          onClick={() => setShowAppearance(true)}
        >
          Aparência
        </button>
      </div>
      {addWidgetSlot !== null && (
        <AddWidgetModal
          onClose={() => setAddWidgetSlot(null)}
          userId={1}
          userWidgets={userWidgets}
          setUserWidgets={setUserWidgets} // Passar a função diretamente
          slot={addWidgetSlot}
          onWidgetAdded={handleWidgetAdded}
        />
      )}
      {showAppearance && (
        <AppearanceModal
          currentColor={bgColor}
          onClose={() => setShowAppearance(false)}
          onSave={(color) => {
            setBgColor(color);
            setShowAppearance(false);
          }}
        />
      )}
      <div className="dashboard-grid">
        {userWidgets.map((widget, idx) => (
          <div key={idx} className={`dashboard-slot slot-${idx + 1}`}>
            <WidgetCard
              widget={widget}
              slot={idx + 1}
              onAdd={() => setAddWidgetSlot(idx)}
              onRemove={() => removeWidgetAt(idx)}
            />
          </div>
        ))}
      </div>
      {notifications.map(({ id, message, type }) => (
        <Notification 
          key={id}
          message={message}
          type={type}
          onClose={() => removeNotification(id)}
        />
      ))}
      <footer className="dashboard-footer">
        <span>Source: themycanvas.com - made by Bram Kanstein (@bramk)</span>
      </footer>
    </div>
  );
}