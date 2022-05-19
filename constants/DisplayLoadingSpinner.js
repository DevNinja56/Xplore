import React from 'react'
import { Modal, View, Text, ActivityIndicator, Image } from 'react-native';
import Colors from '../constants/Colors';
import Layouts from '../constants/Layouts';

const DisplayLoadingSpinner = (props) => (
    <Modal visible={props.visible} transparent={true} animationType = {'none'}>
        <View style={{flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', alignItems: 'center', justifyContent: 'center'}}>
            <ActivityIndicator animating={true} size="large" color="#ffffff" />
            <Text style={{textAlign: 'center', marginTop: 10, color: Colors.white, fontSize: Layouts.bodyFontSize, fontFamily: 'Gotham-Medium'}}>{props.message}</Text>
        </View>
    </Modal>
)

export default DisplayLoadingSpinner;