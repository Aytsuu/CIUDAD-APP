import React, { useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Printer } from 'lucide-react-native';
import { format, isValid } from 'date-fns';
import { ChildHealthHistoryRecord } from './types';
import { calculateAge } from '@/helpers/ageCalculator';
import { getValueByPath } from './ChildHealthutils';
import { ImmunizationTable } from './tables/ImmunizationTable';
import { VitalSignsTable } from './tables/VitalSignsTable';
import { BFCheckTable } from './tables/BFTable';
import { NutritionStatusTable } from './tables/NutritionStatusTable';
import { SupplementStatusTable } from './tables/SupplementStatusTable';

interface PatientSummarySectionProps {
    recordsToDisplay: ChildHealthHistoryRecord[];
    fullHistoryData: ChildHealthHistoryRecord[];
    chhistId: string;
}

export function PatientSummarySection({
    recordsToDisplay,
    fullHistoryData,
    chhistId,
}: PatientSummarySectionProps) {
    console.log('PatientSummarySection: recordsToDisplay:', recordsToDisplay);
    return (
        <ScrollView>
            <View>
                {/* Header Section */}
                <View className="print-section">
                    <Text className="text-xl font-bold text-gray-800 text-center mb-10">
                        CHILD HEALTH RECORD
                    </Text>

                    <View className="flex-row justify-end mb-10">
                        <View className="space-y-2 mb-4">
                            <Text>
                                <Text className="font-bold text-sm">Family no:</Text>{' '}
                                <Text className="underline text-sm">
                                    {getValueByPath(recordsToDisplay[0], [
                                        'chrec_details',
                                        'family_no',
                                    ]) || 'N/A'}
                                </Text>
                            </Text>
                            <Text>
                                <Text className="font-bold text-sm">UFC no:</Text>{' '}
                                <Text className="underline text-sm">
                                    {getValueByPath(recordsToDisplay[0], [
                                        'chrec_details',
                                        'ufc_no',
                                    ]) || 'N/A'}
                                </Text>
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Main Content */}
                <View className="print-section flex-col lg:flex-row gap-10 mb-4 w-full">
                    {/* Patient Details */}
                    <View className="lg:w-1/2 space-y-4">
                        <View>
                            <View className="space-y-4 mb-4">
                                <View className="flex-row justify-between w-full">
                                    <Text>
                                        <Text className="font-bold text-sm">Name:</Text>{' '}
                                        <Text className="underline text-sm">
                                            {getValueByPath(recordsToDisplay[0], [
                                                'chrec_details',
                                                'patrec_details',
                                                'pat_details',
                                                'personal_info',
                                                'per_fname',
                                            ]) || 'N/A'}{' '}
                                            {getValueByPath(recordsToDisplay[0], [
                                                'chrec_details',
                                                'patrec_details',
                                                'pat_details',
                                                'personal_info',
                                                'per_lname',
                                            ]) || ''}{' '}
                                            {getValueByPath(recordsToDisplay[0], [
                                                'chrec_details',
                                                'patrec_details',
                                                'pat_details',
                                                'personal_info',
                                                'per_mname',
                                            ]) || ''}
                                        </Text>
                                    </Text>
                                    <Text>
                                        <Text className="font-bold text-sm">Sex:</Text>{' '}
                                        <Text className="underline text-sm">
                                            {getValueByPath(recordsToDisplay[0], [
                                                'chrec_details',
                                                'patrec_details',
                                                'pat_details',
                                                'personal_info',
                                                'per_sex',
                                            ]) || 'N/A'}
                                        </Text>
                                    </Text>
                                </View>
                                <View className="flex-row justify-between">
                                    <Text>
                                        <Text className="font-bold text-sm">Date of Birth:</Text>{' '}
                                        <Text className="underline text-sm">
                                            {isValid(
                                                new Date(
                                                    getValueByPath(recordsToDisplay[0], [
                                                        'chrec_details',
                                                        'patrec_details',
                                                        'pat_details',
                                                        'personal_info',
                                                        'per_dob',
                                                    ])
                                                )
                                            )
                                                ? format(
                                                    new Date(
                                                        getValueByPath(recordsToDisplay[0], [
                                                            'chrec_details',
                                                            'patrec_details',
                                                            'pat_details',
                                                            'personal_info',
                                                            'per_dob',
                                                        ])
                                                    ),
                                                    'MMM. d yyyy'
                                                )
                                                : 'N/A'}
                                        </Text>
                                    </Text>
                                    <Text>
                                        <Text className="font-bold text-sm">Birth Order:</Text>{' '}
                                        <Text className="underline text-sm">
                                            {getValueByPath(recordsToDisplay[0], [
                                                'chrec_details',
                                                'birth_order',
                                            ]) || 'N/A'}
                                        </Text>
                                    </Text>
                                </View>
                                <Text>
                                    <Text className="font-bold text-sm mt-2">Place of Delivery:</Text>{' '}
                                    {(() => {
                                        const deliveryType = getValueByPath(recordsToDisplay[0], [
                                            'chrec_details',
                                            'place_of_delivery_type',
                                        ]);

                                        if (!deliveryType) return 'N/A';

                                        return (
                                            <Text className="space-x-2 text-sm">
                                                <Text>
                                                    ({deliveryType === 'Hospital Gov\'t/Private' ? '✓' : ' '})
                                                    Hospital Gov't/Private
                                                </Text>
                                                <Text>
                                                    ({deliveryType === 'Home' ? '✓' : ' '}) Home
                                                </Text>
                                                <Text>
                                                    ({deliveryType === 'Private Clinic' ? '✓' : ' '})
                                                    Private Clinic
                                                </Text>
                                                <Text>
                                                    ({deliveryType === 'Lying In' ? '✓' : ' '}) Lying
                                                    In
                                                </Text>
                                                <Text>
                                                    ({deliveryType === 'HC' ? '✓' : ' '}) Health
                                                    Center
                                                </Text>
                                            </Text>
                                        );
                                    })()}
                                </Text>
                                <Text>
                                    {(() => {
                                        const deliveryType = getValueByPath(recordsToDisplay[0], [
                                            'chrec_details',
                                            'place_of_delivery_type',
                                        ]);

                                        if (deliveryType === 'HC') {
                                            return (
                                                <Text>
                                                    <Text className="font-bold">Place of Delivery:</Text>{' '}
                                                    <Text className="underline">Health Center</Text>
                                                </Text>
                                            );
                                        }
                                        return null;
                                    })()}
                                </Text>
                            </View>

                            {/* Mother Section */}
                            <View className="flex-row justify-between items-center">
                                <View className="flex-row items-center space-x-2">
                                    <Text className="font-bold text-sm">Mother:</Text>
                                    <Text className="underline text-sm">
                                        {getValueByPath(recordsToDisplay[0], [
                                            'chrec_details',
                                            'patrec_details',
                                            'pat_details',
                                            'family_head_info',
                                            'family_heads',
                                            'mother',
                                            'personal_info',
                                        ])
                                            ? `${getValueByPath(recordsToDisplay[0], [
                                                'chrec_details',
                                                'patrec_details',
                                                'pat_details',
                                                'family_head_info',
                                                'family_heads',
                                                'mother',
                                                'personal_info',
                                                'per_fname',
                                            ]) || ''
                                            } ${getValueByPath(recordsToDisplay[0], [
                                                'chrec_details',
                                                'patrec_details',
                                                'pat_details',
                                                'family_head_info',
                                                'family_heads',
                                                'mother',
                                                'personal_info',
                                                'per_lname',
                                            ]) || ''
                                            }`
                                            : 'N/A'}
                                    </Text>
                                </View>
                                <View className="flex-row items-center space-x-2">
                                    <Text className="font-bold text-sm">Age:</Text>
                                    <Text className="underline text-sm">
                                        {(() => {
                                            const dob = getValueByPath(recordsToDisplay[0], [
                                                'chrec_details',
                                                'patrec_details',
                                                'pat_details',
                                                'family_head_info',
                                                'family_heads',
                                                'mother',
                                                'personal_info',
                                                'per_dob',
                                            ]);
                                            return isValid(new Date(dob))
                                                ? calculateAge(new Date(dob).toISOString())
                                                : 'N/A';
                                        })()}
                                    </Text>
                                </View>
                            </View>
                            <Text className="mb-4">
                                <Text className="font-bold text-sm">Occupation:</Text>{' '}
                                <Text className="underline text-sm">
                                    {getValueByPath(recordsToDisplay[0], [
                                        'chrec_details',
                                        'mother_occupation',
                                    ]) || 'N/A'}
                                </Text>
                            </Text>

                            {/* Father Section */}
                            <View className="flex-row justify-between items-center">
                                <View className="flex-row items-center space-x-2">
                                    <Text className="font-bold text-sm">Father:</Text>
                                    <Text className="underline text-sm">
                                        {getValueByPath(recordsToDisplay[0], [
                                            'chrec_details',
                                            'patrec_details',
                                            'pat_details',
                                            'family_head_info',
                                            'family_heads',
                                            'father',
                                            'personal_info',
                                        ])
                                            ? `${getValueByPath(recordsToDisplay[0], [
                                                'chrec_details',
                                                'patrec_details',
                                                'pat_details',
                                                'family_head_info',
                                                'family_heads',
                                                'father',
                                                'personal_info',
                                                'per_fname',
                                            ]) || ''
                                            } ${getValueByPath(recordsToDisplay[0], [
                                                'chrec_details',
                                                'patrec_details',
                                                'pat_details',
                                                'family_head_info',
                                                'family_heads',
                                                'father',
                                                'personal_info',
                                                'per_lname',
                                            ]) || ''
                                            }`
                                            : 'N/A'}
                                    </Text>
                                </View>
                                <View className="flex-row items-center space-x-2">
                                    <Text className="font-bold text-sm">Age:</Text>
                                    <Text className="underline text-sm">
                                        {(() => {
                                            const dob = getValueByPath(recordsToDisplay[0], [
                                                'chrec_details',
                                                'patrec_details',
                                                'pat_details',
                                                'family_head_info',
                                                'family_heads',
                                                'father',
                                                'personal_info',
                                                'per_dob',
                                            ]);
                                            return isValid(new Date(dob))
                                                ? calculateAge(new Date(dob).toISOString())
                                                : 'N/A';
                                        })()}
                                    </Text>
                                </View>
                            </View>
                            <Text>
                                <Text className="font-bold text-sm">Occupation:</Text>{' '}
                                <Text className="underline text-sm">
                                    {getValueByPath(recordsToDisplay[0], [
                                        'chrec_details',
                                        'father_occupation',
                                    ]) || 'N/A'}
                                </Text>
                            </Text>
                        </View>

                        <View>
                            <Text>
                                <Text className="font-bold text-sm">Date referred for newborn screening:</Text>{' '}
                                <Text className="underline text-sm">
                                    {isValid(
                                        new Date(
                                            getValueByPath(recordsToDisplay[0], [
                                                'chrec_details',
                                                'newborn_screening',
                                            ])
                                        )
                                    )
                                        ? format(
                                            new Date(
                                                getValueByPath(recordsToDisplay[0], [
                                                    'chrec_details',
                                                    'newborn_screening',
                                                ])
                                            ),
                                            'MMM dd, yyyy'
                                        )
                                        : 'N/A'}
                                </Text>
                            </Text>
                        </View>
                        <View>
                            <Text>
                                <Text className="font-bold text-sm">Type of Feeding:</Text>{' '}
                                <Text className="underline text-sm">
                                    {getValueByPath(recordsToDisplay[0], [
                                        'chrec_details',
                                        'type_of_feeding',
                                    ]) || 'N/A'}
                                </Text>
                            </Text>
                        </View>
                    </View>

                    {/* Immunization Table */}
                    <View className="lg:w-1/2 mt-4 lg:mt-0">
                        <Text className="font-bold mb-2">Type of immunization</Text>
                        <ImmunizationTable
                            fullHistoryData={fullHistoryData}
                            chhistId={chhistId}
                        />
                        <View className="space-y-2 mt-4">
                            <Text className="mt-5">
                                <Text className="font-bold">Child protected at Birth:</Text>{' '}
                            </Text>
                            <Text className="ml-3">
                                <Text className="font-bold">Date assessed:</Text>{' '}
                                <Text className="underline">
                                    {isValid(
                                        new Date(
                                            getValueByPath(recordsToDisplay[0], [
                                                'chrec_details',
                                                'created_at',
                                            ])
                                        )
                                    )
                                        ? format(
                                            new Date(
                                                getValueByPath(recordsToDisplay[0], [
                                                    'chrec_details',
                                                    'created_at',
                                                ])
                                            ),
                                            'MMM dd yyyy'
                                        )
                                        : 'N/A'}
                                </Text>
                            </Text>
                            <Text>
                                <Text className="font-bold">TT status of mother:</Text>{' '}
                                <Text className="underline">
                                    {getValueByPath(recordsToDisplay[0], ['tt_status']) ||
                                        'N/A'}
                                </Text>
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Additional Tables */}
                <View className="w-full">
                    <View className="print-table-container print-section ">
                        <BFCheckTable
                            fullHistoryData={fullHistoryData}
                            chhistId={chhistId}
                        />
                    </View>

                    <View className="print-table-container print-section mt-2">
                        <VitalSignsTable
                            fullHistoryData={fullHistoryData}
                            chhistId={chhistId}
                        />
                    </View>
                </View>
            </View>
            <NutritionStatusTable
                fullHistoryData={fullHistoryData}
                chhistId={chhistId}
            />
        </ScrollView>

    );
}