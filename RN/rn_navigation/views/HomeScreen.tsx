import { View, StyleSheet, Text, Pressable, Dimensions } from "react-native";
import { useNavigation } from '@react-navigation/native';
import type { RootStackParamList } from '../types/navigation'
import type { NavigationProp } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

type DetailScreenNavigationProp = NavigationProp<RootStackParamList, 'Detail'>;
type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const { width } = Dimensions.get('window'); 

export default function HomeScreen({ route }: Props) {

	const navigation = useNavigation<DetailScreenNavigationProp>()

	function onPressFunction() {
		navigation.navigate('Detail', {
			itemId: 86,
			otherParam: 'anything you want here',
		});
	}

  return (
		<View style={styles.container}>
			<Text>HomeScreen</Text>
			<Text>回传过来的参数： {route.params?.post}</Text>
			<Pressable onPress={onPressFunction} style={styles.buttonContainer}>
				<Text style={styles.textStyle}>跳转到详情页面</Text>
			</Pressable>
		</View>
	) 
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
	},
	buttonContainer: {
		height: 30,
		width: width - 100,
		backgroundColor: 'skyblue',
		alignItems: 'center',
		justifyContent: 'center',
		marginTop: 20,
	},
	textStyle: {
		color: 'white',
		fontSize: 12,
	}
})