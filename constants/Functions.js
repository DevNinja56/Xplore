import {
    Alert
} from 'react-native';
import Constants from './Constants';

export default class Functions {

    static myInstance = null;    

    static shared() {
        if (Functions.myInstance == null) {
            Functions.myInstance = new Functions();
        }
        return this.myInstance;
    }

    isValidEmailAddress = (text) => {
        let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        if (reg.test(text) === false) {
          return false;
        } else {
            return true;
        }
    }

    showErrorMessage = (title, message, button) => {
        Alert.alert(
            title,
            message,
            [
                {
                    text: button,
                    style: 'default'
                },
            ]
        );
    }

    Base64 = {
        btoa: (input = '')  => {
            let str = input;
            let output = '';
    
            for (let block = 0, charCode, i = 0, map = Constants.chars;
            str.charAt(i | 0) || (map = '=', i % 1);
            output += map.charAt(63 & block >> 8 - i % 1 * 8)) {
    
            charCode = str.charCodeAt(i += 3/4);
    
            if (charCode > 0xFF) {
                throw new Error("'btoa' failed: The string to be encoded contains characters outside of the Latin1 range.");
            }
            
            block = block << 8 | charCode;
            }
            
            return output;
        },
    
        atob: (input = '') => {
            let str = input.replace(/=+$/, '');
            let output = '';
    
            if (str.length % 4 == 1) {
            throw new Error("'atob' failed: The string to be decoded is not correctly encoded.");
            }
            for (let bc = 0, bs = 0, buffer, i = 0;
            buffer = str.charAt(i++);
    
            ~buffer && (bs = bc % 4 ? bs * 64 + buffer : buffer,
                bc++ % 4) ? output += String.fromCharCode(255 & bs >> (-2 * bc & 6)) : 0
            ) {
            buffer = Constants.chars.indexOf(buffer);
            }
    
            return output;
        }
    };
      
}