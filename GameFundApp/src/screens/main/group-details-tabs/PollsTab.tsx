import React from 'react';
import { ActivityIndicator, Alert } from 'react-native';
import { StyledView, StyledText, StyledTouchableOpacity } from "../../../utils/StyledComponents";
import { Poll } from '../../../models/poll.model';

interface PollsTabProps {
  polls: Poll[];
  loadingPolls: boolean;
  pollsError: Error | null;
  fetchPolls: () => void;
}

// SportyApp theme colors
const COLORS = {
  primary: "#0d7377",
};

export const PollsTab: React.FC<PollsTabProps> = ({
  polls,
  loadingPolls,
  pollsError,
  fetchPolls
}) => {
  return (
    <StyledView className="px-4 mb-6">
      <StyledView className="flex-row justify-between items-center mb-4">
        <StyledText className="text-lg font-bold text-gray-800">
          Polls
        </StyledText>
        <StyledTouchableOpacity 
          className="bg-primary py-2 px-4 rounded-lg"
          onPress={() => {
            Alert.alert("Create Poll", "This feature will be implemented soon!");
          }}
        >
          <StyledText className="text-white font-bold">
            Create
          </StyledText>
        </StyledTouchableOpacity>
      </StyledView>
      
      {loadingPolls ? (
        <StyledView className="items-center justify-center p-10">
          <ActivityIndicator size="large" color={COLORS.primary} />
          <StyledText className="mt-2 text-gray-500">
            Loading polls...
          </StyledText>
        </StyledView>
      ) : pollsError ? (
        <StyledView className="items-center justify-center p-6">
          <StyledText className="text-red-500 mb-3">
            Failed to load polls
          </StyledText>
          <StyledTouchableOpacity
            className="bg-primary py-2 px-4 rounded-lg"
            onPress={() => fetchPolls()}
          >
            <StyledText className="text-white font-bold">
              Try Again
            </StyledText>
          </StyledTouchableOpacity>
        </StyledView>
      ) : polls && polls.length > 0 ? (
        polls.map((poll) => (
          <StyledView 
            key={poll.id} 
            className="bg-white p-4 rounded-xl shadow-sm mb-3"
          >
            <StyledText className="font-bold text-gray-800 mb-2">
              {poll.title}
            </StyledText>
            
            {poll.options?.map((option, index) => (
              <StyledView 
                key={index}
                className="bg-gray-100 p-3 rounded-lg mb-2 flex-row justify-between"
              >
                <StyledText>{option.text}</StyledText>
                <StyledText className="font-medium">
                  {option.voteCount || 0} votes
                </StyledText>
              </StyledView>
            ))}
            <StyledView className="flex-row justify-between mt-2">
              <StyledText className="text-gray-500 text-xs">
                Created by: {poll.createdByUser?.firstName} {poll.createdByUser?.lastName}
              </StyledText>
              <StyledText className="text-gray-500 text-xs">
                {new Date(poll.expiryDate).toLocaleDateString()}
              </StyledText>
            </StyledView>
          </StyledView>
        ))
      ) : (
        <StyledView className="bg-white p-4 rounded-xl shadow-sm items-center">
          <StyledText className="text-gray-500">
            No polls created yet
          </StyledText>
        </StyledView>
      )}
    </StyledView>
  );
};
