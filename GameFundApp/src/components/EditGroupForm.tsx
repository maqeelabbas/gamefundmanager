import React, { useState, useEffect } from 'react';
import { ActivityIndicator } from 'react-native';
import {
  StyledView,
  StyledText,
  StyledTextInput,
  StyledTouchableOpacity
} from '../utils/StyledComponents';
import { Group, CreateGroupRequest } from '../models';

// Available days for contribution due date
const dueDays = Array.from({ length: 28 }, (_, i) => i + 1);

interface EditGroupFormProps {
  group: Group;
  isLoading: boolean;
  onSave: (groupData: Partial<CreateGroupRequest>) => void;
  onCancel: () => void;
}

export const EditGroupForm: React.FC<EditGroupFormProps> = ({
  group,
  isLoading,
  onSave,
  onCancel
}) => {  const [formData, setFormData] = useState<Partial<CreateGroupRequest>>({
    name: group.name,
    description: group.description,
    targetAmount: group.targetAmount ? Number(group.targetAmount) : 0,
    currency: group.currency,
    contributionDueDay: group.contributionDueDay ? Number(group.contributionDueDay) : 1
  });

  // Update form data if group changes
  useEffect(() => {
    setFormData({
      name: group.name,
      description: group.description,
      targetAmount: Number(group.targetAmount) || 0,
      currency: group.currency,
      contributionDueDay: Number(group.contributionDueDay) || 1
    });
  }, [group]);
  const handleChange = (field: keyof CreateGroupRequest, value: string | number) => {
    if (field === 'targetAmount') {
      // Ensure target amount is a valid number
      const numValue = typeof value === 'string' ? parseFloat(value) : value;
      setFormData((prev) => ({ ...prev, [field]: isNaN(numValue) ? 0 : numValue }));
    } else if (field === 'contributionDueDay') {
      // Ensure contribution due day is a valid number
      const numValue = typeof value === 'string' ? parseInt(value, 10) : value;
      setFormData((prev) => ({ ...prev, [field]: isNaN(numValue) ? 1 : numValue }));
    } else {
      // Handle string fields normally
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };  const handleSubmit = () => {
    // Get the contribution due day (with fallback)
    const contributionDay = formData.contributionDueDay !== undefined && formData.contributionDueDay !== null
      ? Number(formData.contributionDueDay)
      : (group.contributionDueDay ? Number(group.contributionDueDay) : 1);
    
    // Create a due date based on the contributionDueDay
    // Use the current month, but set the day to the contributionDueDay
    const today = new Date();
    let dueDate = new Date(today.getFullYear(), today.getMonth(), contributionDay);
    
    // If the calculated date is in the past, move to next month
    if (dueDate < today) {
      dueDate = new Date(today.getFullYear(), today.getMonth() + 1, contributionDay);
    }
    
    // Ensure contributionDueDay is a number and not null
    const updatedFormData = {
      ...formData,
      // Make sure contributionDueDay is a valid number between 1 and 28
      contributionDueDay: contributionDay,
      // Make sure targetAmount is a valid number
      targetAmount: formData.targetAmount !== undefined && formData.targetAmount !== null
        ? Number(formData.targetAmount)
        : (group.targetAmount ? Number(group.targetAmount) : 0),
      // Include the calculated due date
      dueDate: dueDate
    };
    
    // Log the submitted data for debugging
    console.log('Submitting group form data:', updatedFormData);
    onSave(updatedFormData);
  };

  return (
    <StyledView className="bg-white rounded-xl p-4 shadow-sm mb-4">
      <StyledText className="text-lg font-bold text-gray-800 mb-4">
        Edit Group
      </StyledText>

      {/* Group Name Input */}
      <StyledText className="text-sm font-medium text-text mb-2">Group Name *</StyledText>
      <StyledTextInput
        className="border border-gray-300 rounded-lg p-3 mb-4 text-text"
        placeholder="Enter group name"
        value={formData.name}
        onChangeText={(value) => handleChange('name', value)}
      />

      {/* Description Input */}
      <StyledText className="text-sm font-medium text-text mb-2">Description</StyledText>
      <StyledTextInput
        className="border border-gray-300 rounded-lg p-3 mb-4 text-text h-24"
        placeholder="Describe your group"
        multiline
        textAlignVertical="top"
        value={formData.description}
        onChangeText={(value) => handleChange('description', value)}
      />

      {/* Target Amount Input */}
      <StyledText className="text-sm font-medium text-text mb-2">Target Amount</StyledText>
      <StyledView className="flex-row items-center mb-4">
        <StyledView className="border border-gray-300 rounded-lg p-3 pr-0 w-24 mr-2 justify-center">
          <StyledText className="text-text">{"€"}</StyledText>
        </StyledView>
        <StyledTextInput
          className="border border-gray-300 rounded-lg p-3 flex-1 text-text"
          placeholder="0.00"
          keyboardType="decimal-pad"
          value={formData.targetAmount?.toString()}
          onChangeText={(value) => handleChange('targetAmount', parseFloat(value) || 0)}
        />
      </StyledView>

      {/* Contribution Due Day Selection */}
      <StyledText className="text-sm font-medium text-text mb-2">Monthly Due Day</StyledText>
      <StyledView className="flex-row flex-wrap mb-4">
        {dueDays.map(day => (
          <StyledTouchableOpacity
            key={day}
            className={`border rounded-full w-10 h-10 items-center justify-center mr-2 mb-2 ${
              formData.contributionDueDay === day ? 'border-primary bg-primary' : 'border-gray-300'
            }`}
            onPress={() => handleChange('contributionDueDay', day)}
          >
            <StyledText 
              className={`${formData.contributionDueDay === day ? 'text-white font-medium' : 'text-text'}`}
            >
              {day}
            </StyledText>
          </StyledTouchableOpacity>
        ))}
      </StyledView>

      {/* Action Buttons */}
      <StyledView className="flex-row justify-end mt-4">
        <StyledTouchableOpacity
          className="bg-gray-300 py-2 px-6 rounded-lg mr-2"
          onPress={onCancel}
          disabled={isLoading}
        >
          <StyledText className="text-gray-700 font-medium">
            Cancel
          </StyledText>
        </StyledTouchableOpacity>
        
        <StyledTouchableOpacity
          className="bg-primary py-2 px-6 rounded-lg"
          onPress={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <StyledText className="text-white font-bold">
              Save Changes
            </StyledText>
          )}
        </StyledTouchableOpacity>
      </StyledView>
    </StyledView>
  );
};
