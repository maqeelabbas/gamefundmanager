// src/screens/main/AddExpenseScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Alert, ActivityIndicator } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { 
  StyledView, 
  StyledText, 
  StyledTextInput,
  StyledTouchableOpacity,
  StyledScrollView,
  StyledActivityIndicator
} from '../../utils/StyledComponents';
import { RootStackParamList } from '../../navigation/types';
import { expenseService } from '../../services/expense.service';
import { groupService } from '../../services/group.service';
import { CreateExpenseRequest } from '../../models/expense.model';
import { GroupMember } from '../../models/group.model';
import { useAuth } from '../../context/AuthContext';

type AddExpenseScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;
type AddExpenseScreenRouteProp = RouteProp<RootStackParamList, 'AddExpense'>;

// Expense categories
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
  const route = useRoute<AddExpenseScreenRouteProp>();
  const { groupId } = route.params || {};
  const { user } = useAuth();
  
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Group members state
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(user?.id || null);
  
  // Fetch group members using useCallback to avoid recreation on every render
  const fetchGroupMembers = useCallback(async () => {
    if (!groupId) {
      console.log('Cannot fetch members: No groupId provided');
      return;
    }
    
    console.log('Starting to fetch group members for group:', groupId);
    setLoadingMembers(true);
    try {
      console.log('Calling groupService.getGroupMembers...');
      const members = await groupService.getGroupMembers(groupId);
      console.log('Received members:', members);
      console.log('Members count:', members.length);
      
      setGroupMembers(members);
      
      // If no member is selected yet and we have members, select current user by default
      if (members.length > 0) {
        const currentUserMember = members.find(member => member.user.id === user?.id);
        if (currentUserMember) {
          console.log('Setting current user as selected member:', currentUserMember.user.id);
          setSelectedMemberId(currentUserMember.user.id);
        } else if (!selectedMemberId) {
          console.log('Current user not found in group members, selecting first member');
          setSelectedMemberId(members[0].user.id);
        }
      }
    } catch (error) {
      console.error('Failed to fetch group members:', error);
      Alert.alert('Error', 'Failed to load group members');
    } finally {
      setLoadingMembers(false);
    }
  }, [groupId, user?.id, selectedMemberId]);
  
  // Navigate back if no groupId is provided and fetch members when component mounts
  useEffect(() => {
    console.log('useEffect running with groupId:', groupId, 'and user:', user?.id);
    if (!groupId) {
      Alert.alert(
        'Error',
        'No group specified for this expense.',
        [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]
      );
    } else {
      // Fetch group members when component loads
      console.log('Calling fetchGroupMembers() from useEffect');
      fetchGroupMembers();
    }
  }, [groupId, navigation, fetchGroupMembers]);
  
  const handleAddExpense = async () => {
    if (!title || !amount || !selectedCategory || !selectedMemberId) {
      Alert.alert('Error', 'Please fill in all required fields including who paid for the expense');
      return;
    }

    setIsLoading(true);
    
    try {
      if (!groupId) {
        throw new Error('No group selected for this expense');
      }
      
      // Prepare the expense data
      const expenseData: CreateExpenseRequest = {
        title,
        description: notes, // using notes as the description
        amount: parseFloat(amount),
        expenseDate: new Date(),
        groupId,
        paidByUserId: selectedMemberId,
      };

      // Call the actual expense service to create the expense
      await expenseService.createExpense(expenseData);
      
      setIsLoading(false);
      Alert.alert(
        'Success',
        'Expense added successfully!',
        [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]
      );
    } catch (error) {
      setIsLoading(false);
      console.error('Failed to add expense:', error);
      Alert.alert(
        'Error',
        'Failed to add expense. Please try again.'
      );
    }
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
          
          {/* Paid By Selection - Debug Info */}
          <StyledView>
            <StyledText className="text-sm font-medium text-text mb-2">Paid By *</StyledText>
            <StyledText className="text-xs text-gray-500 mb-2">
              Members loaded: {groupMembers.length}, Loading: {loadingMembers ? 'Yes' : 'No'}
            </StyledText>
            
            {loadingMembers ? (
              <StyledView className="items-center py-4 mb-4">
                <StyledActivityIndicator size="small" color="#0d7377" />
                <StyledText className="text-gray-500 mt-2">Loading members...</StyledText>
              </StyledView>
            ) : groupMembers.length > 0 ? (
              <StyledView className="mb-4">
                {groupMembers.map(member => (
                  <StyledTouchableOpacity
                    key={member.user.id}
                    className={`border p-3 rounded-lg mb-2 ${
                      selectedMemberId === member.user.id ? 'border-primary bg-primary bg-opacity-10' : 'border-gray-300'
                    }`}
                    onPress={() => setSelectedMemberId(member.user.id)}
                  >
                    <StyledText 
                      className={`${selectedMemberId === member.user.id ? 'text-primary font-medium' : 'text-text'}`}
                    >
                      {member.user.firstName} {member.user.lastName}
                      {member.isAdmin ? ' (Admin)' : ''}
                      {member.user.id === user?.id ? ' (You)' : ''}
                    </StyledText>
                  </StyledTouchableOpacity>
                ))}
              </StyledView>
            ) : (
              <StyledView className="bg-white border border-gray-300 rounded-lg p-4 mb-4 items-center">
                <StyledText className="text-gray-500">No members found</StyledText>
                <StyledTouchableOpacity 
                  className="bg-primary py-2 px-4 rounded-lg mt-2"
                  onPress={fetchGroupMembers}
                >
                  <StyledText className="text-white">Retry Loading Members</StyledText>
                </StyledTouchableOpacity>
              </StyledView>
            )}
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
