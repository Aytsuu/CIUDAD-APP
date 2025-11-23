import { DrawerView } from "@/components/ui/drawer"
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet"
import React, { createContext, useContext } from "react"

type DrawerContextType = {
  closeDrawer: () => void
  openDrawer: (config: DrawerConfig) => void
}

type DrawerConfig = {
  title?: string,
  description?: string
  content: React.ReactNode
  snapPoints?: string[]
}

// Initialize context
const DrawerContext = createContext<DrawerContextType | null>(null)

// Context provider
export const DrawerProvider = ({children} : {children: React.ReactNode}) => {
  const bottomSheetRef = React.useRef<BottomSheet>(null);
  const [drawerConfig, setDrawerConfig] = React.useState<DrawerConfig | null>(null)

  const openDrawer = (config: DrawerConfig) => {
    setDrawerConfig(config)
    bottomSheetRef.current?.expand();
  }

  const closeDrawer = () => {
    bottomSheetRef.current?.close()
  }

  return (
    <DrawerContext.Provider value={{ openDrawer, closeDrawer}}>
      {children}
      <DrawerView
        bottomSheetRef={bottomSheetRef}
        title={drawerConfig?.title}
        description={drawerConfig?.description}
        snapPoints={drawerConfig?.snapPoints}
      >
        {drawerConfig?.content}
      </DrawerView>
    </DrawerContext.Provider>
  )
}

// Context method
export const useDrawer = () => {
  const context = useContext(DrawerContext);
  if(!context) throw new Error('useDrawer must be used  within DrawerProvider')
  return context;
}