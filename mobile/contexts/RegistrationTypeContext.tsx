import React, { useContext } from "react";

const RegistrationTypeContext = React.createContext<Record<string, any>>({});

export const RegistrationTypeProvider = ({ children } : {
  children: React.ReactNode
}) => {
  const [type, setType] = React.useState<string>('');
  
  return (
    <RegistrationTypeContext.Provider value={{type, setType}}>
      {children}
    </RegistrationTypeContext.Provider>
  )
}

export const useRegistrationTypeContext = () => {
  const context = useContext(RegistrationTypeContext);
  if (!context) {
    throw new Error('useRegistrationTypeContext must be used within a ContextProvider')
  }
  return context;
}