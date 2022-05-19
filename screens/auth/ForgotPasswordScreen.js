import React, { useEffect, useLayoutEffect, useState, useRef } from 'react';
import {
    View,
    Image,
    Platform,
    StatusBar,
    ImageBackground,
    Text,
    Button,
    TouchableOpacity,
    Modal,
    ScrollView,
    TextInput,
    Keyboard,
    SafeAreaView,
    Alert,
} from 'react-native';
import Colors from '../../constants/Colors';
import Layouts from '../../constants/Layouts';
import LinearGradient from "react-native-linear-gradient";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Functions from '../../constants/Functions';
import * as firebase from 'firebase';
import DisplayLoadingSpinner from '../../constants/DisplayLoadingSpinner';

function ForgotPasswordScreen({ navigation }) {
    const insets = useSafeAreaInsets();
    const [state, setState] = useState({
        loading: false,
        email: '',
    })
    const emailTextField = useRef(null)
    useEffect(() => {
        return () => {};
    }, []);
    useLayoutEffect(() => {
        navigation.setOptions({
            headerStyle: {
                backgroundColor: Colors.background,
                height: 44 + insets.top,
                shadowOpacity: 0,
                borderBottomWidth: 0,
                elevation: 0,
            },
            headerTitle: props => (
                <Text style={{fontSize: 16, color: Colors.white, alignSelf: 'center', fontFamily: 'Gotham-Medium', justifyContent: 'center'}}>
                    {'RESET PASSWORD'}
                </Text>
            ),
            headerLeft: () => (
                <TouchableOpacity onPress={() => navigation.pop()} style={{marginLeft: 10, width: 32, height: 32, justifyContent: 'center'}}>
                    <Image resizeMode={'contain'} source={require('../../assets/images/icon_back.png')} style={{width: 20, height: 20, tintColor: Colors.primaryColor}} />
                </TouchableOpacity>
            ),
            headerRight: () => (
                <View onPress={() => navigation.pop()} style={{marginRight: 10, width: 32, height: 32}} />
            ),
        })
    })
    const onResetPasswordClicked = () => {
        Keyboard.dismiss()

        if (!Functions.shared().isValidEmailAddress(state.email)) {
            Functions.shared().showErrorMessage("Reset Password Error", "Please enter a valid email address", "Try again")
            return;
        }

        setState(prevState => ({...prevState, loading: true, errorMessage: ''}))
        firebase.auth().sendPasswordResetEmail(state.email)
            .then(() => {
                setState(prevState => ({...prevState, loading: false, email: ''}))
                setTimeout(() => {
                    Alert.alert(
                        "Forgot Password",
                        "Please check your email and click on the provided link to reset your password."
                    );
                }, 100)
            }).catch((error) => {
                console.log(error)
                Functions.shared().showErrorMessage("Reset Password Error", error.message, "Try again")
            })
    }
    return (
        <View style={{flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.white}}>
            <StatusBar barStyle={Platform.OS == 'ios' ? 'light-content' : 'light-content'} backgroundColor={Colors.black} />
            <DisplayLoadingSpinner visible={state.loading} message={'Sending...'}/>
            <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
                <ScrollView scrollEnabled={false} keyboardShouldPersistTaps={'handled'} style={{ flex: 1, width: Layouts.screenWidth }} contentContainerStyle={{ alignItems: 'center', flex: 1 }}>
                    <View style={{marginTop: 25}}>
                        <TextInput
                            ref={emailTextField}
                            selectionColor={Colors.background}
                            placeholder={"EMAIL"}
                            keyboardType="email-address"
                            returnKeyType="done"
                            autoCorrect={true}
                            autoCapitalize={"none"}
                            underlineColorAndroid={"transparent"}
                            value={state.email}
                            style={{
                                height: 50,
                                width: Layouts.screenWidth - 40,
                                backgroundColor: Colors.white,
                                borderRadius: 5,
                                paddingHorizontal: 15,
                                fontFamily: 'GothamCondensed-Book',
                                fontSize: 20
                            }}                        
                            onSubmitEditing={() => Keyboard.dismiss()}
                            onChangeText={(val) => setState(prevState => ({...prevState, email: val.toLowerCase()}))}
                        />
                    </View>
                    <TouchableOpacity onPress={() => {
                        onResetPasswordClicked()
                    }} style={{alignItems: 'center', justifyContent: 'center', width: Layouts.screenWidth - 40, height: 60, backgroundColor: Colors.green, borderRadius: 30, marginTop: 20}}>
                        <Text style={{fontFamily: 'Gotham-Medium', fontSize: 14, color: Colors.white}}>{'RESET PASSWORD VIA EMAIL'}</Text>
                    </TouchableOpacity>
                </ScrollView>
            </SafeAreaView>
        </View>
    )
}

export default ForgotPasswordScreen;