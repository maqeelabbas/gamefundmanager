// src/screens/main/FinancesScreen.tsx
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyledView, StyledText } from '../../utils/StyledComponents';

const FinancesScreen = () => {
  return (
    <StyledView className="flex-1 bg-background p-4">
      <StatusBar style="dark" />
      <StyledView className="mt-12">
        <StyledText className="text-xl font-bold text-primary">Finances</StyledText>
        <StyledText className="text-text mt-2">Track all group expenses and contributions here.</StyledText>
      </StyledView>
    </StyledView>
  );
};

export default FinancesScreen;