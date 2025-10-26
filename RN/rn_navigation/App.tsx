import { StyleSheet, Image, Button } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList } from './types/navigation'

import HomeScreen from './views/HomeScreen';
import DetailScreen from './views/DetailScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

function LogoTitle() {
  return (
    <Image
      style={{ width: 50, height: 50 }}
      source={require('./assets/favicon.png')}
    />
  );
}

function RootStack() {
  return (
    <Stack.Navigator 
      initialRouteName="Home" 
      screenOptions={{
        // headerStyle: { backgroundColor: 'tomato' },
        // headerTitle: () => <LogoTitle />,
      }}>
      <Stack.Screen
        name="Home" 
        component={HomeScreen} 
        options={
          {
            title: '首页', 
            headerStyle: {
              backgroundColor: 'skyblue',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            }
          }
        }
      />
      {/* <Stack.Screen name="Detail" component={DetailScreen} options={{ title: '详情' }} /> */}
      <Stack.Screen 
        name="Detail" 
        component={DetailScreen} 
        options={
          ({ route }) => ({
            title: route.params.itemId + '详情页',
            headerRight: () => (
              <Button onPress={() => alert('This is a button!')} title='Info' />
            ),
            headerBackTitle: 'Custom Back',
            headerBackTitleStyle: { fontSize: 30 },
        })} 
      />
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
