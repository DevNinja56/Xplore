import React, { useEffect, useState } from 'react';
import {
    View,
    Image,
    Platform,
    StatusBar,
    ImageBackground,
    Text,
} from 'react-native';
import Colors from '../../constants/Colors';
import Layouts from '../../constants/Layouts';
import LinearGradient from "react-native-linear-gradient";

function SplashScreen({ navigation }) {
    useEffect(() => {
        return () => {};
    }, []);
    return (
        <View style={{flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.white}}>
            <StatusBar barStyle={Platform.OS == 'ios' ? 'dark-content' : 'light-content'} backgroundColor={Colors.black} />
            <Image source={require('../../assets/images/pinky-promise-splash.png')} style={{width: Layouts.screenWidth, height: Layouts.screenHeight, resizeMode: 'cover'}} />
        </View>
    )
}

export default SplashScreen;