export interface Environment {
  name: string;
  apiBaseUrl: string;
}

export const environments: { [key: string]: Environment } = {
  development: {
    name: 'Development',
    apiBaseUrl: 'http://localhost:5254'
  },
  production: {
    name: 'Production',
    apiBaseUrl: 'https://nucpa-balloons.runasp.net'
  }
};

export const getCurrentEnvironment = (): Environment => {
  const envName = localStorage.getItem('selectedEnvironment') || 'production';
  return environments[envName];
};

export const setCurrentEnvironment = (envName: string): void => {
  if (environments[envName]) {
    localStorage.setItem('selectedEnvironment', envName);
    window.location.reload();
  }
}; 