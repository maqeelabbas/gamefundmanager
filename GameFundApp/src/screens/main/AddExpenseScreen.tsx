// src/screens/main/AddExpenseScreen.tsx
import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { 
  StyledView, 
  StyledText, 
  StyledTextInput,
  StyledTouchableOpacity,
  StyledScrollView
} from '../../utils/StyledComponents';
import { RootStackParamList } from '../../navigation/types';

type AddExpenseScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

// Mock groups data
const mockGroups = [
  { id: '1', name: 'Badminton Group' },
  { id: '2', name: 'Cricket Team' },
];

// Mock expense categories
const expenseCategories = [
  'Venue Rental', 
  'Equipment', 
  'Refreshments', 
  'Transport', 
  'Tournament Fee',
  'Other'
];

const AddExpenseScreen: React.FC = () => {
  const navigation = useNavigation<AddExpenseScreenNavigationProp>();
  
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAddExpense = () => {
    if (!title || !amount || !selectedGroup || !selectedCategory) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      console.log('Adding expense:', {
        title,
        amount,
        groupId: selectedGroup,
        category: selectedCategory,
        notes
      });
      
      setIsLoading(false);
      Alert.alert(
        'Success',
        'Expense added successfully!',
        [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]
      );
    }, 1000);
  };

  return (
    <StyledView className="flex-1 bg-background">
      <StatusBar style="dark" />
      
      <StyledView className="bg-primary p-6 pt-12">
        <StyledView className="flex-row items-center">
          <StyledTouchableOpacity
            className="mr-2"
            onPress={() => navigation.goBack()}
          >
            <StyledText className="text-white text-xl">←</StyledText>
          </StyledTouchableOpacity>
          
          <StyledText className="text-white text-xl font-bold">Add Expense</StyledText>
        </StyledView>
      </StyledView>

      <StyledScrollView className="flex-1 p-4">
        <StyledView className="bg-white p-6 rounded-xl shadow-sm mb-4">
          {/* Title Input */}
          <StyledText className="text-sm font-medium text-text mb-2">Expense Title *</StyledText>
          <StyledTextInput
            className="border border-gray-300 rounded-lg p-3 mb-4 text-text"
            placeholder="Enter expense title"
            value={title}
            onChangeText={setTitle}
          />
          
          {/* Amount Input */}
          <StyledText className="text-sm font-medium text-text mb-2">Amount (USD) *</StyledText>
          <StyledTextInput
            className="border border-gray-300 rounded-lg p-3 mb-4 text-text"
            placeholder="Enter amount"
            keyboardType="decimal-pad"
            value={amount}
            onChangeText={setAmount}
          />
          
          {/* Group Selection */}
          <StyledText className="text-sm font-medium text-text mb-2">Select Group *</StyledText>
          <StyledView className="mb-4">
            {mockGroups.map(group => (
              <StyledTouchableOpacity
                key={group.id}
                className={`border p-3 rounded-lg mb-2 ${
                  selectedGroup === group.id ? 'border-primary bg-primary bg-opacity-10' : 'border-gray-300'
                }`}
                onPress={() => setSelectedGroup(group.id)}
              >
                <StyledText className={`${selectedGroup === group.id ? 'text-primary font-medium' : 'text-text'}`}>
                  {group.name}
                </StyledText>
              </StyledTouchableOpacity>
            ))}
          </StyledView>

          {/* Category Selection */}
          <StyledText className="text-sm font-medium text-text mb-2">Expense Category *</StyledText>
          <StyledView className="flex-row flex-wrap mb-4">
            {expenseCategories.map(category => (
              <StyledTouchableOpacity
                key={category}
                className={`border rounded-full px-4 py-2 mr-2 mb-2 ${
                  selectedCategory === category ? 'border-primary bg-primary bg-opacity-10' : 'border-gray-300'
                }`}
                onPress={() => setSelectedCategory(category)}
              >
                <StyledText className={`${selectedCategory === category ? 'text-primary font-medium' : 'text-text'}`}>
                  {category}
                </StyledText>
              </StyledTouchableOpacity>
            ))}
          </StyledView>
          
          {/* Notes Input */}
          <StyledText className="text-sm font-medium text-text mb-2">Notes (Optional)</StyledText>
          <StyledTextInput
            className="border border-gray-300 rounded-lg p-3 mb-4 text-text h-24"
            placeholder="Add any additional notes"
            multiline
            value={notes}
            onChangeText={setNotes}
            textAlignVertical="top"
          />
          
          <StyledTouchableOpacity
            className={`rounded-lg p-4 ${isLoading ? 'bg-gray-400' : 'bg-primary'} items-center`}
            onPress={handleAddExpense}
            disabled={isLoading}
          >
            <StyledText className="text-white font-bold">
              {isLoading ? 'Adding...' : 'Add Expense'}
            </StyledText>
          </StyledTouchableOpacity>
        </StyledView>
      </StyledScrollView>
    </StyledView>
  );
};

export default AddExpenseScreen;