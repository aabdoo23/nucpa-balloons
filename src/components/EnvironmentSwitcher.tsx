import React from 'react';
import { environments, getCurrentEnvironment, setCurrentEnvironment } from '../config/environments';

export const EnvironmentSwitcher: React.FC = () => {
  const currentEnv = getCurrentEnvironment();

  const handleEnvironmentChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrentEnvironment(event.target.value);
  };

  return (
    <div style={{ 
      position: 'fixed', 
      bottom: '10px', 
      right: '10px', 
      background: '#f0f0f0', 
      padding: '5px', 
      borderRadius: '4px',
      zIndex: 1000
    }}>
      <select 
        value={Object.keys(environments).find(key => environments[key].apiBaseUrl === currentEnv.apiBaseUrl)} 
        onChange={handleEnvironmentChange}
        style={{ padding: '4px' }}
      >
        {Object.entries(environments).map(([key, env]) => (
          <option key={key} value={key}>
            {env.name}
          </option>
        ))}
      </select>
    </div>
  );
}; 