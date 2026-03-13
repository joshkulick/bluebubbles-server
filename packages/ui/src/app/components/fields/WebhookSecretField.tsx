import React, { useEffect, useState } from 'react';
import {
    FormControl,
    FormLabel,
    FormHelperText,
    Input,
    IconButton,
    useBoolean
} from '@chakra-ui/react';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { showSuccessToast } from '../../utils/ToastUtils';
import { setConfig } from '../../slices/ConfigSlice';
import { AiFillEye, AiFillEyeInvisible, AiOutlineSave } from 'react-icons/ai';


export const WebhookSecretField = (): JSX.Element => {
    const dispatch = useAppDispatch();

    const webhookSecret: string = (useAppSelector(state => state.config.webhook_secret) ?? '');
    const [showSecret, setShowSecret] = useBoolean();
    const [newSecret, setNewSecret] = useState(webhookSecret);

    useEffect(() => {
        setNewSecret(webhookSecret);
    }, [webhookSecret]);

    const saveSecret = (value: string): void => {
        dispatch(setConfig({ name: 'webhook_secret', value }));
        showSuccessToast({
            id: 'settings',
            description: 'Successfully saved webhook secret!'
        });
    };

    return (
        <FormControl>
            <FormLabel htmlFor='webhook_secret'>Webhook Secret</FormLabel>
            <Input
                id='webhook_secret'
                type={showSecret ? 'text' : 'password'}
                maxWidth="20em"
                value={newSecret}
                placeholder="Enter a shared secret..."
                onChange={(e) => setNewSecret(e.target.value)}
            />
            <IconButton
                ml={3}
                verticalAlign='top'
                aria-label='View secret'
                icon={showSecret ? <AiFillEye /> : <AiFillEyeInvisible />}
                onClick={() => setShowSecret.toggle()}
            />
            <IconButton
                ml={3}
                verticalAlign='top'
                aria-label='Save secret'
                icon={<AiOutlineSave />}
                onClick={() => saveSecret(newSecret)}
            />
            <FormHelperText>
                Enter a shared secret to sign outbound webhook requests with HMAC-SHA256. Leave empty to disable signing.
            </FormHelperText>
        </FormControl>
    );
};
