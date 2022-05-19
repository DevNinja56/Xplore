import React, { useEffect } from 'react';
import {
    View,
    Text,
    Image,
    StatusBar,
    ImageBackground,
    Platform,
} from 'react-native';
import axios from 'axios'
import * as firebase from 'firebase';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from "react-native-linear-gradient";
import { useFocusEffect } from '@react-navigation/native';

import Colors from '../constants/Colors';
import Layouts from '../constants/Layouts';
import AuthContext from '../Auth';

function AuthScreen({ navigation }) {
    const { signIn } = React.useContext(AuthContext);
    useEffect(() => {
        const unsubscribe = onAuthStateChanged()
        return () => {
            unsubscribe()
        };
    }, []);
    function loginServer(firebaseUser) {
        const body = new FormData();
        body.append('uid', firebaseUser.uid);
        // body.append('uid', "0ytOUjTe0vhxn0KspIrUDpEH0qD3");
        body.append('provider', firebaseUser.providerData[0].providerId);
        if (global.pushToken != null && global.pushToken != "") {
            body.append('pushToken', global.pushToken);
        }
        if (global.timezoneOffset != null && global.timezoneOffset != "") {
            body.append('timezoneOffset', global.timezoneOffset);
        }
        axios.post('apis/login/', body)
            .then(function (response) {
                global.loggedInUser = response.data.user
                firebase.database().ref().child('users').child(firebaseUser.uid)
                    .update({
                        user_id: global.loggedInUser.id,
                        photo: global.loggedInUser.photo,
                        first_name: global.loggedInUser.firstName,
                        last_name: global.loggedInUser.lastName,
                        online_status: {status: 'online', last_seen: firebase.database.ServerValue.TIMESTAMP},
                        push_token: global.loggedInUser.pushToken == null ? "" : global.loggedInUser.pushToken,
                        is_push_enabled: parseInt(global.loggedInUser.isPushEnabled)
                    });
                signIn(global.loggedInUser.id)
            })
            .catch(function (error) {
                console.log(error);
                console.log('signIn')
                navigation.replace('SignIn')
            });
    }
    function onAuthStateChanged() {
        return firebase.auth().onAuthStateChanged(firebaseUser => {
            if (firebaseUser) {
                loginServer(firebaseUser)
            } else {
                console.log('Start')
                navigation.replace('Start')
            }
        })
    }
    return (
        <View style={{flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.white}}>
            <StatusBar barStyle={Platform.OS == 'ios' ? 'dark-content' : 'light-content'} backgroundColor={Colors.black} />
            <LinearGradient colors={["rgb(255, 45, 85)", "rgb(255, 84, 141)", "rgb(255, 91, 151)"]} style={{ flex: 1, width: Layouts.screenWidth, alignItems: 'center' }}>
                <View style={{ flex: 0.5, justifyContent: "center", alignItems: "center" }}>
                    <Image source={require('../assets/images/img_logo.png')} style={{width: 200, height: 100}} />
                    <View style={{ marginTop: 15, }}>
                        <Text style={{ alignSelf: "center", textAlign: 'center', lineHeight: 45, fontSize: 34, color: "#fff", backgroundColor: "transparent", fontFamily: 'GothamRounded-Medium' }}>
                            {"PINKY\nPROMISE"}
                        </Text>
                    </View>
                </View>
            </LinearGradient>
        </View>
    )
}

export default AuthScreen;