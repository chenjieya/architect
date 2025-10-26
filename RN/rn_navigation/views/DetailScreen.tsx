import { View, StyleSheet, Text, Pressable, Dimensions } from "react-native";
// import { StackActions } from '@react-navigation/native';
import type { RootStackParamList } from '../types/navigation'
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

const { width } = Dimensions.get('window'); 

type Props = NativeStackScreenProps<RootStackParamList, 'Detail'>;

export default function DetailScreen({ route, navigation }: Props) {

	const { itemId, otherParam } = route.params;

	function onPressFunction() {
		// 跳到到同一个页面时不起作用的，除非使用下面的push方法
		// navigation.navigate('Detail', { itemId: 99, otherParam: 'from Detail' });
		navigation.push('Detail', { itemId: 99, otherParam: 'from Detail' });
		// navigation.dispatch(StackActions.push('Detail'));
	}

	function onPressGoBackFunction() {
		navigation.goBack();
	}

	function onPressPopToFunction() {
		// navigation.dispatch(StackActions.popToTop());
		// 直接返回到首页
		navigation.popToTop()
	}

	function onChangeParamsFunction() {
		navigation.setParams({
			otherParam: 'Updated Param'
		})
	}

	function onPreScreenParamsFunction() {
		navigation.popTo("Home", { post: otherParam })
	}


	return (
		<View style={styles.container}>
			<Text>DetailScreen</Text>
			<Text>参数： {itemId} 参数2：{otherParam}</Text>
			<Pressable onPress={onPressFunction} style={styles.buttonContainer}>
				<Text style={styles.textStyle}>跳转到详情页面</Text>
			</Pressable>

			<Pressable onPress={onPressGoBackFunction} style={styles.buttonContainer}>
				<Text style={styles.textStyle}>返回上一层页面</Text>
			</Pressable>

			<Pressable onPress={onPressPopToFunction} style={styles.buttonContainer}>
				<Text style={styles.textStyle}>返回到指定页面,并关闭中间的堆栈</Text>
			</Pressable>

			<Pressable onPress={onChangeParamsFunction} style={styles.buttonContainer}>
				<Text style={styles.textStyle}>修改传递过来的参数</Text>
			</Pressable>

			<Pressable onPress={onPreScreenParamsFunction} style={styles.buttonContainer}>
				<Text style={styles.textStyle}>将参数传递给上一个屏幕</Text>
			</Pressable>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#fff',
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