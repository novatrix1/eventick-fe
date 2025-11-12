import React from 'react'
import { Stack } from 'expo-router'
import "../global.css"

const RootLayout = () => {
    return (
            <Stack>
                <Stack.Screen
                    name='(auth)'
                    options={{
                        headerShown: false,
                    }}
                />
                <Stack.Screen
                    name='index'
                    options={{
                        headerShown: false,
                    }}
                />

                <Stack.Screen
                    name='(tabs-client)'
                    options={{
                        headerShown: false,
                    }}
                />
                <Stack.Screen
                    name='(tabs-organisateur)'
                    options={{
                        headerShown: false,
                    }}
                />
                
                <Stack.Screen
                    name='event/[id]'
                    options={{
                        headerShown: false,
                    }}
                />
                <Stack.Screen
                    name='organizer/[id]'
                    options={{
                        headerShown: false,
                    }}
                />
                <Stack.Screen
                    name='reservation/[id]'
                    options={{
                        headerShown: false,
                    }}
                />
                <Stack.Screen
                    name='EditEvent/[id]'
                    options={{
                        headerShown: false,
                    }}
                />
                <Stack.Screen
                    name='EventStatistics/[id]'
                    options={{
                        headerShown: false,
                    }}
                />

                <Stack.Screen
                    name='screens/PromotionsScreen'
                    options={{
                        headerShown: false,
                    }}
                />
                <Stack.Screen
                    name='screens/OrganizerRegistrationScreen'
                    options={{
                        headerShown: false,
                    }}
                />
                <Stack.Screen
                    name='screens/CreateEvent'
                    options={{
                        headerShown: false,
                    }}
                />
                <Stack.Screen
                    name='screens/EditProfileScreenOrganisateur'
                    options={{
                        headerShown: false,
                    }}
                />
                <Stack.Screen
                    name='screens/PaymentSettingsScreen'
                    options={{
                        headerShown: false,
                    }}
                />
                <Stack.Screen
                    name='screens/DocumentsLegauxScreen'
                    options={{
                        headerShown: false,
                    }}
                />
                <Stack.Screen
                    name='screens/ContactSupportScreen'
                    options={{
                        headerShown: false,
                    }}
                />
                <Stack.Screen
                    name='screens/FAQScreen'
                    options={{
                        headerShown: false,
                    }}
                />
                <Stack.Screen
                    name='screens/TermsOfUseScreen'
                    options={{
                        headerShown: false,
                    }}
                />
                <Stack.Screen
                    name='screens/PrivacyPolicyScreen'
                    options={{
                        headerShown: false,
                    }}
                />
                <Stack.Screen
                    name='screens/LoginHistoryScreen'
                    options={{
                        headerShown: false,
                    }}
                />
                <Stack.Screen
                    name='screens/EditProfileScreen'
                    options={{
                        headerShown: false,
                    }}
                />
                <Stack.Screen
                    name='screens/forgot-password'
                    options={{
                        headerShown: false,
                    }}
                />
                <Stack.Screen
                    name='screens/reset-password'
                    options={{
                        headerShown: false,
                    }}
                />
                <Stack.Screen
                    name='screens/PaymentPendingScreen'
                    options={{
                        headerShown: false,
                    }}
                />
            </Stack>
    )
}

export default RootLayout