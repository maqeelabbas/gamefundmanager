import { 
  Text, 
  View, 
  TouchableOpacity, 
  TextInput, 
  ScrollView, 
  Image, 
  FlatList, 
  ActivityIndicator,
  SafeAreaView,
  KeyboardAvoidingView
} from 'react-native';
import { styled } from 'nativewind';

// Create styled versions of React Native components
export const StyledView = styled(View);
export const StyledText = styled(Text);
export const StyledTouchableOpacity = styled(TouchableOpacity);
export const StyledTextInput = styled(TextInput);
export const StyledScrollView = styled(ScrollView);
export const StyledImage = styled(Image);
export const StyledFlatList = styled(FlatList);
export const StyledActivityIndicator = styled(ActivityIndicator);
export const StyledSafeAreaView = styled(SafeAreaView);
export const StyledKeyboardAvoidingView = styled(KeyboardAvoidingView);

// Export fallback for non-styled usage - ensures backward compatibility
export { 
  Text, 
  View, 
  TouchableOpacity, 
  TextInput, 
  ScrollView, 
  Image, 
  FlatList, 
  ActivityIndicator,
  SafeAreaView,
  KeyboardAvoidingView
};
