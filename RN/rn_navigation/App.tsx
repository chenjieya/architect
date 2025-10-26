import { StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList } from './types/navigation'

import HomeScreen from './views/HomeScreen';
import DetailScreen from './views/DetailScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

function RootStack() {
  return (
    <Stack.Navigator initialRouteName="Home" screenOptions={{
      headerStyle: { backgroundColor: 'tomato' },
    }}>
      <Stack.Screen name="Home" component={HomeScreen}  options={{ title: '首页' }}/>
      <Stack.Screen name="Detail" component={DetailScreen} options={{ title: '详情' }} />
    </Stack.Navigator>
  )
}


export default function App() {
  return (
    <NavigationContainer>
      {RootStack()}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({

});
