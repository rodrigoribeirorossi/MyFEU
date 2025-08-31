import React, { useState } from "react";
import '../styles/widgets/reminders.css';

export default function WidgetReminders({ data }) {
  const [reminders, setReminders] = useState(data?.config?.items || []);
  const [newReminder, setNewReminder] = useState("");

  const addReminder = () => {
    if (newReminder.trim() === "") return;
    setReminders([
      ...reminders,
      { 
        id: Date.now(), 
        text: newReminder, 
        date: new Date().toISOString(), 
        completed: false 
      }
    ]);
    setNewReminder("");
  };

  const toggleReminder = (id) => {
    setReminders(reminders.map(reminder => 
      reminder.id === id ? { ...reminder, completed: !reminder.completed } : reminder
    ));
  };

  const removeReminder = (id) => {
    setReminders(reminders.filter(reminder => reminder.id !== id));
  };

  return (
    <div className="widget-reminders">
      <div className="reminder-input">
        <input
          type="text"
          value={newReminder}
          onChange={(e) => setNewReminder(e.target.value)}
          placeholder="Novo lembrete..."
          onKeyPress={(e) => e.key === 'Enter' && addReminder()}
        />
        <button onClick={addReminder}>+</button>
      </div>
      
      <ul className="reminder-items">
        {reminders.length === 0 ? (
          <li className="empty-list">Sem lembretes</li>
        ) : (
          reminders.map(reminder => (
            <li key={reminder.id} className={reminder.completed ? "completed" : ""}>
              <input
                type="checkbox"
                checked={reminder.completed}
                onChange={() => toggleReminder(reminder.id)}
              />
              <span>{reminder.text}</span>
              <small>{new Date(reminder.date).toLocaleDateString()}</small>
              <button onClick={() => removeReminder(reminder.id)}>×</button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}