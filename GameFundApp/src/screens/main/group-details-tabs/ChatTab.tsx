import React from 'react';
import { StyledView, StyledText, StyledImage } from "../../../utils/StyledComponents";

export const ChatTab: React.FC = () => {
  return (
    <StyledView className="px-4 mb-6 items-center justify-center p-10">
      <StyledText className="text-lg font-bold text-gray-800 mb-4">
        Group Chat
      </StyledText>
      <StyledText className="text-gray-500 text-center mb-4">
        This feature will be available soon!
      </StyledText>
      <StyledImage 
        source={require('../../../../assets/icon.png')}
        className="w-32 h-32 opacity-30"
      />
    </StyledView>
  );
};
