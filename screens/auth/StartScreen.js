import React, { useEffect, useState } from 'react';
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
} from 'react-native';
import Colors from '../../constants/Colors';
import Layouts from '../../constants/Layouts';
import LinearGradient from "react-native-linear-gradient";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Fonts from '../../constants/Fonts';

function StartScreen({ navigation }) {
    const insets = useSafeAreaInsets();
    const [state, setState] = useState({
        isVisibleInformationModal: false
    })
    useEffect(() => {
        return () => {};
    }, []);
    const InformationModal = () => {
        return (
            <Modal visible={state.isVisibleInformationModal} transparent={true} >
                <View style={{flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)'}}>
                    <View style={{width: Layouts.screenWidth - 40, maxHeight: Layouts.screenHeight - 150, alignItems: 'center', paddingTop: 35, paddingBottom: 25, backgroundColor: "#5E6B85", borderRadius: 20, borderColor: "rgba(0, 0, 0, 0.1)"}}>
						<Text style={{color: "#fff", fontSize: 18, textDecorationLine: "underline", fontFamily: 'Gotham-Medium'}}>{'WHAT IS THIS?'}</Text>
						<ScrollView style={{marginVertical: 20}} contentContainerStyle={{paddingHorizontal: 20}} showsVerticalScrollIndicator={false}>
							<Text style={{color: "#fff", textAlign: "left", fontSize: 16, fontFamily: 'Avenir-Light'}}>
								{'Life goes much more smoothly when people keep their promises.\n\nPinky Promise is the ultimate app to hold your friends,family members, colleagues and even yourself accountable for the promises we make. Whether it’s to deliver a report, grab a coffee or even clean the dishes, Pinky Promise is here to make sure it happens.\n\n\u2022 Track promises you make to yourself and others (to-do’s).\n\u2022 Track promises others make to you.\n\u2022 Request others to do something for you (accepted requests are promises).\n\u2022 Receive notifications as deadlines loom.\n\u2022 Negotiate deadlines as promises are at risk of being broken.\n\u2022 Measure the accountability of you and your connections with your Accountability Score.\n\u2022 Let’s start keeping everyone accountable today.'}
							</Text>
						</ScrollView>
						<View style={{height: 1, backgroundColor: "#3B4A64", width: Layouts.screenWidth - 40}} />
                        <TouchableOpacity onPress={() => {
                            setState(prevState => ({...prevState, isVisibleInformationModal: false}))
						}} style={{marginTop: 15, width: Layouts.screenWidth - 80, height: 60, borderRadius: 30, borderWidth: 2, borderColor: Colors.white, alignItems: 'center', justifyContent: 'center'}}>
							<Text style={{color: Colors.white, fontFamily: Fonts.GothamMedium, fontSize: 14}}>{'BACK TO GETTING STARTED'}</Text>
						</TouchableOpacity>
                    </View>
                </View>
            </Modal>
        )
    }
    return (
        <View style={{flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.white}}>
            <StatusBar barStyle={Platform.OS == 'ios' ? 'light-content' : 'light-content'} backgroundColor={Colors.black} />
            {InformationModal()}
            <LinearGradient
                colors={[
                    "rgb(255, 45, 85)",
                    "rgb(255, 84, 141)",
                    "rgb(255, 91, 151)"
                ]}
                style={{ flex: 1, width: Layouts.screenWidth, alignItems: 'center' }}
                >
                <View style={{ flex: 0.5, justifyContent: "center", alignItems: "center" }}>
                    <Image source={require('../../assets/images/img_logo.png')} style={{width: 200, height: 100}} />
                    <View style={{ marginTop: 15 }}>
                        <Text style={{ alignSelf: "center", textAlign: 'center', lineHeight: 45, fontSize: 34, color: "#fff", backgroundColor: "transparent", fontFamily: 'GothamRounded-Medium' }}>
                            {"PINKY\nPROMISE"}
                        </Text>
                    </View>
                </View>
                <View style={{ flex: 0.3, alignItems: 'center' }}>
                    <Text style={{textAlign: 'center', backgroundColor: "transparent", fontSize: 18, color: "#fff", opacity: 0.8, fontFamily: 'Gotham-Medium', lineHeight: 25}}>
                    {'WELCOME TO A NEW WAY OF\nKEEPING YOUR PROMISES. MAKE\nYOURSELF ACCOUNTABLE AND\nEARN ACHIEVEMENTS.'}
                    </Text>
                </View>
                <View style={{ flex: 0.2, alignItems: 'center' }}>
                    <TouchableOpacity onPress={() => navigation.push('SignIn')} style={{alignItems: 'center', justifyContent: 'center', width: Layouts.screenWidth - 60, height: 60, backgroundColor: Colors.green, borderRadius: 30}}>
                        <Text style={{fontFamily: 'Gotham-Medium', fontSize: 14, color: Colors.white}}>{'GET STARTED'}</Text>
                    </TouchableOpacity>                    
                    <TouchableOpacity onPress={() => setState(prevState => ({...prevState, isVisibleInformationModal: true}))}>
                        <Text style={{ color: Colors.white, fontSize: 14, opacity: 0.7, paddingTop: 15, paddingBottom: 15, fontFamily: "Gotham-Medium"}}>{'WHAT IS THIS?'}</Text>
                    </TouchableOpacity>
                    {/* <View style={{position: 'absolute', width: 100, height: 100, backgroundColor: Colors.LIGHT_BLUE_100}}></View> */}
                </View>
            </LinearGradient>
        </View>
    )
}

export default StartScreen;