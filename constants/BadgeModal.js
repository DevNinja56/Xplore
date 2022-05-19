import React, { useEffect, useLayoutEffect, useState, useRef } from 'react';
import { Modal, View, Text, ActivityIndicator, Image, Animated, Easing, TouchableOpacity } from 'react-native';
import Colors from '../constants/Colors';
import Layouts from '../constants/Layouts';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Badges from '../constants/Badges';
import Fonts from '../constants/Fonts';

const BadgeModal = (props) => {
    const insets = useSafeAreaInsets();
    const translation = useRef(
        new Animated.Value(0)
    ).current;
    function loadBadge() {
        var badge = undefined;
        switch (props.badge) {
            case 'NEWBIE':
                badge = {
                    image: Badges.LEVEL_1,
                    title: Badges.LABEL_LEVEL_1,
                    color: Badges.COLOR_LEVEL_1
                }
                break;        
            case 'BUSY_BEAVER':
                badge = {
                    image: Badges.LEVEL_2,
                    title: Badges.LABEL_LEVEL_2,
                    color: Badges.COLOR_LEVEL_2
                }
                break;
            case 'CHECKLIST':
                badge = {
                    image: Badges.LEVEL_3,
                    title: Badges.LABEL_LEVEL_3,
                    color: Badges.COLOR_LEVEL_3
                }
                break;
            case 'GOOD_DUBIE':
                badge = {
                    image: Badges.LEVEL_4,
                    title: Badges.LABEL_LEVEL_4,
                    color: Badges.COLOR_LEVEL_4
                }
                break;
            case 'DEPENDABLE_EDDIE':
                badge = {
                    image: Badges.LEVEL_5,
                    title: Badges.LABEL_LEVEL_5,
                    color: Badges.COLOR_LEVEL_5
                }
                break;
            case 'SWEAT':
                badge = {
                    image: Badges.LEVEL_6,
                    title: Badges.LABEL_LEVEL_6,
                    color: Badges.COLOR_LEVEL_6
                }
                break;
            case 'GOVERNOR':
                badge = {
                    image: Badges.LEVEL_7,
                    title: Badges.LABEL_LEVEL_7,
                    color: Badges.COLOR_LEVEL_7
                }
                break;
            case 'MANAGER':
                badge = {
                    image: Badges.LEVEL_8,
                    title: Badges.LABEL_LEVEL_8,
                    color: Badges.COLOR_LEVEL_8
                }
                break;
            case 'BOSS':
                badge = {
                    image: Badges.LEVEL_9,
                    title: Badges.LABEL_LEVEL_9,
                    color: Badges.COLOR_LEVEL_9
                }
                break;
            case 'SAINT':
                badge = {
                    image: Badges.LEVEL_10,
                    title: Badges.LABEL_LEVEL_10,
                    color: Badges.COLOR_LEVEL_10
                }
                break;
            case 'MOMENTUM':
                badge = {
                    image: Badges.LEVEL_11,
                    title: Badges.LABEL_LEVEL_11,
                    color: Badges.COLOR_LEVEL_11
                }
                break;
            default:
                break;
        }
        return badge
    }
    const badge = loadBadge()
    return (
        <Modal transparent={true} onShow={() => {
            Animated.timing(
                translation,
                {
                    toValue: 1,
                    duration: 300,
                    easing: Easing.easeOutBack,
                    useNativeDriver: true,
                }
            ).start(() => {

            });
        }} visible={props.visible} animationType={'none'}>
            <View style={{flex: 1, alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)'}}>
                <Animated.Text 
                    style={{
                        textAlign: 'center',
                        marginTop: insets.top + 10, 
                        lineHeight: 32, 
                        fontFamily: 'Gotham-Medium', 
                        fontSize: 28, color: 
                        Colors.white,
                        transform: [
                            // { translateX: translation }
                            { scale: translation }
                        ]
                    }}
                >
                    {'ACHIEVEMENT\nUNLOCKED!'}
                </Animated.Text>
                <Animated.View
                    style={{
                        marginTop: ((Layouts.screenWidth * 327) / (6 * 285)) + 50, 
                        width: Layouts.screenWidth - 30, 
                        alignItems: 'center', 
                        borderRadius: 10, 
                        backgroundColor: Colors.white, 
                        paddingTop: (Layouts.screenWidth * 327) / (6 * 285), 
                        paddingBottom: 30, 
                        paddingHorizontal: 25,
                        transform: [
                            // { translateX: translation }
                            { scale: translation }
                        ]
                    }}>
                    <Image source={badge.image} style={{position: 'absolute', top: -(Layouts.screenWidth * 327) / (6 * 285), width: Layouts.screenWidth / 3, height: (Layouts.screenWidth * 327) / (3 * 285), resizeMode: 'contain'}} />
                    <Text style={{marginTop: 15, textAlign: 'center', lineHeight: 32, fontFamily: Fonts.GothamCondensedMedium, letterSpacing: 3, fontSize: 28, color: Badges['COLOR_LEVEL_' + '1']}}>
                        {badge.title.toUpperCase()}
                    </Text>
                    <Text style={{marginTop: 15, textAlign: 'center', fontFamily: Fonts.GothamCondensedBook, fontSize: 20, color: Colors.gray}}>
                        {'Proin eu lectus in felis placerat auctor sit amet ut eros. Sed eleifend diam dui, at semper sem ornare vitae. Nam ligula augue, consectetur ut leo quis.'}
                    </Text>
                    <TouchableOpacity onPress={() => {
                        Animated.timing(
                            translation,
                            {
                                toValue: 0,
                                duration: 300,
                                easing: Easing.easeOutBack,
                                useNativeDriver: true,
                            }
                        ).start(() => {
                            props.onThankYouClicked()
                        });
                    }} style={{marginTop: 15, height: 60, width: Layouts.screenWidth - 80, borderRadius: 30, backgroundColor: Colors.green, alignItems: 'center', justifyContent: 'center'}}>
                        <Text style={{fontFamily: 'Gotham-Medium', fontSize: 14, color: Colors.white}}>{'THANK YOU'}</Text>
                    </TouchableOpacity>
                </Animated.View>
            </View>
        </Modal>
    )
}

export default BadgeModal;