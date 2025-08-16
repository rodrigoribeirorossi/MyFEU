import React, { useState, useEffect } from "react";
import WidgetCard from "./WidgetCard";
import AddWidgetModal from "./AddWidgetModal";
import AppearanceModal from "./AppearanceModal";
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
          setUserWidgets={widgets => {
            // Adiciona o widget na posição correta
            const newWidgets = [...userWidgets];
            newWidgets[addWidgetSlot] = widgets[widgets.length - 1];
            setUserWidgets(newWidgets);
            setAddWidgetSlot(null);
          }}
          slot={addWidgetSlot}
        />
      )}
      <div className="dashboard-grid">
        {userWidgets.map((widget, idx) => (
          <div key={idx} className={`dashboard-slot slot-${idx + 1}`}>
            <WidgetCard
              widget={widget}
              slot={idx + 1}
              onAdd={() => setAddWidgetSlot(idx)}
            />
          </div>
        ))}
      </div>
      <footer className="dashboard-footer">
        <span>Source: themycanvas.com - made by Bram Kanstein (@bramk)</span>
      </footer>
    </div>
  );
}