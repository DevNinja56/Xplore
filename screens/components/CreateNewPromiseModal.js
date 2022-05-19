import React, { } from 'react';
import { Modal, View, Text, TouchableOpacity } from 'react-native';
import Colors from '../../constants/Colors';
import Layouts from '../../constants/Layouts';
import Fonts from '../../constants/Fonts';

const CreateNewPromiseModal = (props) => {
    return (
        <Modal transparent={true} visible={props.visible}>
            <View style={{flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center'}}>
                <View style={{backgroundColor: Colors.white, width: Layouts.screenWidth - 40, borderRadius: 8, overflow: 'hidden', alignItems: 'center', paddingBottom: 20, paddingTop: 10}}>
                    <View style={{flexDirection: 'row', minHeight: 44, alignItems: 'center', justifyContent: 'center', width: Layouts.screenWidth - 80}}>
                        <Text style={{marginHorizontal: 25, textAlign: 'center', color: Colors.blue, fontFamily: Fonts.GothamMedium, fontSize: 16}}>{props.message.toUpperCase()}</Text>
                    </View>
                    <View style={{flexDirection: 'row', justifyContent: 'space-between', width: Layouts.screenWidth - 80}}>
                        <TouchableOpacity onPress={() => {
                            props.onNoClicked()
                        }} style={{marginTop: 15, height: 50, width: (Layouts.screenWidth - 100) / 2, borderRadius: 25, backgroundColor: Colors.yellow, alignItems: 'center', justifyContent: 'center'}}>
                            <Text style={{fontFamily: 'Gotham-Medium', fontSize: 12, color: Colors.white}}>{'NO'}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => {
                            props.onYesClicked()                            
                        }} style={{marginTop: 15, height: 50, width: (Layouts.screenWidth - 100) / 2, borderRadius: 25, backgroundColor: Colors.green, alignItems: 'center', justifyContent: 'center'}}>
                            <Text style={{fontFamily: 'Gotham-Medium', fontSize: 12, color: Colors.white}}>{'YES'}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    )
}

export default CreateNewPromiseModal;