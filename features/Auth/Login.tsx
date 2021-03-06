import React, { useState } from 'react';
import { View } from 'react-native';
import { Button } from 'react-native-paper';
import { useDispatch } from 'react-redux';
import { useMutation } from '@apollo/client';

import * as api from './api';
import Header from '../../components/Header';
import TextInput from '../../components/TextInput';
import styles from './styles';
import { emailValidator, passwordValidator } from '../../utils/validators';
import { authClear, setToken } from './userSlice';
import { useAlert } from '../../utils/hooks';
import { AccountNavProps } from '../../navigation/ParamList';
import storeData from './storeData';

interface LoginProps {
    navigation: AccountNavProps<'Auth'>['navigation'];
}

const Login: React.FC<LoginProps> = ({ navigation }) => {
    interface inputObj {
        value: string;
        error: string;
    }

    const [email, setEmail] = useState<inputObj>({ value: '', error: '' });
    const [password, setPassword] = useState<inputObj>({
        value: '',
        error: '',
    });
    const [loading, setLoading] = useState<boolean>(false);
    const dispatch = useDispatch();
    const [login] = useMutation(api.LOGIN);
    const setAlert = useAlert();

    const onLogin = async () => {
        const emailError = emailValidator(email.value);
        const passwordError = passwordValidator(password.value);

        if (!!emailError || !!passwordError) {
            setEmail({ ...email, error: emailError });
            setPassword({ ...password, error: passwordError });
            return;
        }

        setLoading(true);
        try {
            const res = await login({
                variables: { email: email.value, password: password.value },
            });
            const token = res.data.tokenAuth.token;
            const _email = res.data.tokenAuth.payload.email;
            await storeData({ email: _email, token });
            dispatch(setToken({ token, email: _email }));
            navigation.navigate('Products');
        } catch (err) {
            dispatch(authClear());
            setAlert({ text: 'Invalid Email/Password', type: 'danger' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Header>Welcome Back!</Header>
            <TextInput
                label="Email"
                returnKeyType="next"
                autoCompleteType="email"
                textContentType="emailAddress"
                keyboardType="email-address"
                focusable
                value={email.value}
                onChangeText={text => setEmail({ value: text, error: '' })}
                error={!!email.error}
                errorText={email.error}
                dense
            />

            <TextInput
                label="Password"
                returnKeyType="done"
                value={password.value}
                onChangeText={text => setPassword({ value: text, error: '' })}
                error={!!password.error}
                secureTextEntry
                focusable
                errorText={password.error}
                dense
            />
            <Button
                mode="contained"
                style={styles.btn}
                focusable
                onPress={onLogin}
                loading={loading}
            >
                Login
            </Button>
        </View>
    );
};

export default Login;
