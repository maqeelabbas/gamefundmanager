import React, { useState, useEffect } from 'react';
import { Modal, ActivityIndicator, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { StyledView, StyledText, StyledTouchableOpacity, StyledScrollView } from '../utils/StyledComponents';

interface PauseContributionModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (startDate: Date, endDate: Date) => void;
  loading: boolean;
  memberName?: string;
}

const COLORS = {
  primary: "#0d7377",
  secondary: "#14BDEB",
  accent: "#FF8D29",
  success: "#32CD32",
  danger: "#FF4444",
  background: "#F1F9FF",
  text: "#323232",
  lightText: "#5A5A5A"
};

export const PauseContributionModal: React.FC<PauseContributionModalProps> = ({
  visible,
  onClose,
  onConfirm,
  loading,
  memberName = 'member'
}) => {
  const today = new Date();
  const defaultEndDate = new Date();
  defaultEndDate.setMonth(today.getMonth() + 2); // Default 2 months pause

  const [startDate, setStartDate] = useState<Date>(today);
  const [endDate, setEndDate] = useState<Date>(defaultEndDate);
  const [showStartDatePicker, setShowStartDatePicker] = useState<boolean>(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState<boolean>(false);
  const [dateError, setDateError] = useState<string>('');
  const [selectedPreset, setSelectedPreset] = useState<string>('custom');
  
  // Reset dates and errors when modal opens
  useEffect(() => {
    if (visible) {
      const now = new Date();
      const twoMonthsLater = new Date();
      twoMonthsLater.setMonth(now.getMonth() + 2);
      
      setStartDate(now);
      setEndDate(twoMonthsLater);
      setDateError('');
      setSelectedPreset('custom');
    }
  }, [visible]);
  
  // Apply preset durations
  const applyPreset = (preset: string) => {
    const now = new Date();
    const newEndDate = new Date(now);
    
    switch (preset) {
      case '1month':
        newEndDate.setMonth(now.getMonth() + 1);
        break;
      case '3months':
        newEndDate.setMonth(now.getMonth() + 3);
        break;
      case '6months':
        newEndDate.setMonth(now.getMonth() + 6);
        break;
      default:
        // Custom - don't change the end date
        break;
    }
    
    setStartDate(now);
    setEndDate(newEndDate);
    setSelectedPreset(preset);
    validateDates(now, newEndDate);
  };
  
  // Validate the selected dates
  const validateDates = (start: Date, end: Date): boolean => {
    // Check that end date is after start date by at least one day
    if (end.getTime() <= start.getTime()) {
      setDateError('End date must be after the start date');
      return false;
    }
    
    // Check that start date is not in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDay = new Date(start);
    startDay.setHours(0, 0, 0, 0);
    
    if (startDay < today) {
      setDateError('Start date cannot be in the past');
      return false;
    }
    
    // Clear any previous errors
    setDateError('');
    return true;
  };

  // Calculate the duration between dates
  const calculateDuration = (start: Date, end: Date): string => {
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''}`;
    } else {
      const months = Math.floor(diffDays / 30);
      const remainingDays = diffDays % 30;
      return `${months} month${months !== 1 ? 's' : ''}${remainingDays > 0 ? ` and ${remainingDays} day${remainingDays !== 1 ? 's' : ''}` : ''}`;
    }
  };

  const handleConfirm = () => {
    if (validateDates(startDate, endDate)) {
      onConfirm(startDate, endDate);
    }
  };

  // Handle date change
  const handleDateChange = (event: any, selectedDate?: Date, dateType?: 'start' | 'end') => {
    if (Platform.OS === 'android') {
      setShowStartDatePicker(false);
      setShowEndDatePicker(false);
    }
    
    if (selectedDate) {
      if (dateType === 'start') {
        const newStartDate = selectedDate;
        setStartDate(newStartDate);
        
        // Automatically adjust end date if it becomes invalid
        if (endDate <= newStartDate) {
          const newEndDate = new Date(newStartDate);
          newEndDate.setDate(newEndDate.getDate() + 30); // Set end date to 30 days after start date
          setEndDate(newEndDate);
        }
        
        validateDates(newStartDate, endDate);
        setSelectedPreset('custom');
      } else {
        setEndDate(selectedDate);
        validateDates(startDate, selectedDate);
        setSelectedPreset('custom');
      }
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <StyledView className="flex-1 justify-center items-center bg-black/50">
        <StyledView className="w-10/12 bg-white p-5 rounded-xl">
          <StyledText className="text-xl font-bold mb-2 text-center">
            Pause Member Contribution
          </StyledText>
          
          <StyledText className="text-center text-lightText mb-4">
            {memberName ? `Pause contributions for ${memberName}` : 'Select dates to pause contributions'}
          </StyledText>
          
          {/* Preset duration buttons */}
          <StyledView className="mb-4">
            <StyledText className="mb-2 text-text">Preset Durations:</StyledText>
            <StyledView className="flex-row flex-wrap">
              {[
                { id: '1month', label: '1 Month' },
                { id: '3months', label: '3 Months' },
                { id: '6months', label: '6 Months' },
                { id: 'custom', label: 'Custom' }
              ].map(preset => (
                <StyledTouchableOpacity
                  key={preset.id}
                  className={`px-3 py-2 rounded-lg m-1 ${
                    selectedPreset === preset.id ? 'bg-primary' : 'border border-gray-300'
                  }`}
                  onPress={() => applyPreset(preset.id)}
                >
                  <StyledText 
                    className={`${
                      selectedPreset === preset.id ? 'text-white' : 'text-text'
                    }`}
                  >
                    {preset.label}
                  </StyledText>
                </StyledTouchableOpacity>
              ))}
            </StyledView>
          </StyledView>
          
          <StyledView className="mb-4">
            <StyledText className="mb-1 text-lightText">Pause Start Date</StyledText>
            <StyledTouchableOpacity
              className="p-3 border border-gray-300 rounded-lg flex-row justify-between items-center"
              onPress={() => setShowStartDatePicker(true)}
            >
              <StyledText>{startDate.toLocaleDateString()}</StyledText>
              <StyledText className="text-primary">Select</StyledText>
            </StyledTouchableOpacity>
            {showStartDatePicker && (
              <DateTimePicker
                value={startDate}
                mode="date"
                display="default"
                minimumDate={today}
                onChange={(event, selectedDate) => handleDateChange(event, selectedDate, 'start')}
              />
            )}
          </StyledView>

          <StyledView className="mb-4">
            <StyledText className="mb-1 text-lightText">Pause End Date</StyledText>
            <StyledTouchableOpacity
              className="p-3 border border-gray-300 rounded-lg flex-row justify-between items-center"
              onPress={() => setShowEndDatePicker(true)}
            >
              <StyledText>{endDate.toLocaleDateString()}</StyledText>
              <StyledText className="text-primary">Select</StyledText>
            </StyledTouchableOpacity>
            {showEndDatePicker && (
              <DateTimePicker
                value={endDate}
                mode="date"
                display="default"
                minimumDate={new Date(startDate.getTime() + 24*60*60*1000)} // day after start date
                onChange={(event, selectedDate) => handleDateChange(event, selectedDate, 'end')}
              />
            )}
          </StyledView>
          
          {/* Duration summary */}
          <StyledView className="mb-4 bg-background p-3 rounded-lg">
            <StyledText className="text-center">
              Pause Duration: <StyledText className="font-bold">{calculateDuration(startDate, endDate)}</StyledText>
            </StyledText>
          </StyledView>
          
          {/* Error message */}
          {dateError ? (
            <StyledView className="mb-4 bg-danger/10 p-2 rounded-lg">
              <StyledText className="text-danger text-center">{dateError}</StyledText>
            </StyledView>
          ) : null}

          <StyledView className="flex-row justify-between">
            <StyledTouchableOpacity
              className="flex-1 p-3 bg-gray-200 rounded-lg mr-2"
              onPress={onClose}
              disabled={loading}
            >
              <StyledText className="text-center">Cancel</StyledText>
            </StyledTouchableOpacity>
            
            <StyledTouchableOpacity
              className="flex-1 p-3 bg-primary rounded-lg"
              onPress={handleConfirm}
              disabled={loading || !!dateError}
            >
              {loading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <StyledText className="text-center text-white">Confirm</StyledText>
              )}
            </StyledTouchableOpacity>
          </StyledView>
        </StyledView>
      </StyledView>
    </Modal>
  );
};

export default PauseContributionModal;
