import React from "react";
import { View, Text, ScrollView, Image, TouchableOpacity } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, router } from "expo-router";
import { getFPCompleteRecord } from "./GetRequest";
import { User,Calendar,MapPin,Heart,Activity,Stethoscope,FileText,ArrowRight,GraduationCap,CreditCard,Home,Baby,TrendingUp,Scale,Ruler,Droplets,UserCheck,Clock,Loader2,AlertCircle} from "lucide-react-native";

const Card = ({ children, className = "" }) => (
  <View className={`bg-white rounded-xl shadow-sm border border-gray-100 ${className}`}>
    {children}
  </View>
);

const CardHeader = ({ children, className = "" }) => (
  <View className={`p-6 pb-4 ${className}`}>
    {children}
  </View>
);

const CardContent = ({ children, className = "" }) => (
  <View className={`px-6 pb-6 ${className}`}>
    {children}
  </View>
);

const Badge = ({ children, variant = "default", className = "" }) => {
  const variants = {
    default: "bg-blue-100 text-blue-800",
    secondary: "bg-gray-100 text-gray-700",
    destructive: "bg-green-100 text-green-800",
    outline: "bg-transparent border border-gray-300 text-gray-700"
  };

  return (
    <View className={`px-3 py-1 rounded-full ${variants[variant]} ${className}`}>
      <Text className="text-xs font-medium">{children}</Text>
    </View>
  );
};

const Button = ({ children, onPress, className = "" }) => (
  <TouchableOpacity
    onPress={onPress}
    className={`bg-blue-600 rounded-xl py-4 px-6 items-center justify-center ${className}`}
    activeOpacity={0.8}
  >
    {children}
  </TouchableOpacity>
);

const DataField = ({ icon: Icon, label, value, className = "" }) => (
  <View className={`flex-row items-start space-x-3 mb-4 ${className}`}>
    <View className="w-5 h-5 mt-1 mr-3">
      <Icon size={18} color="#6B7280" />
    </View>
    <View className="flex-1">
      <Text className="text-sm text-gray-500 mb-1">{label}</Text>
      <Text className="text-sm font-medium text-gray-900">{value}</Text>
    </View>
  </View>
);

const StatCard = ({ icon: Icon, value, label, color = "#3B82F6" }) => (
  <View className="bg-gray-50 rounded-lg p-4 items-center flex-1 mx-1">
    <Icon size={20} color={color} />
    <Text className="text-sm font-bold mt-2" style={{ color }}>{value}</Text>
    <Text className="text-xs text-gray-500 text-center mt-1">{label}</Text>
  </View>
);

const SectionHeader = ({ icon: Icon, title, color = "#3B82F6" }) => (
  <View className="flex-row items-center mb-4">
    <View className="w-10 h-10 rounded-full items-center justify-center mr-3" style={{ backgroundColor: `${color}15` }}>
      <Icon size={20} color={color} />
    </View>
    <Text className="text-lg font-semibold text-gray-800">{title}</Text>
  </View>
);

export default function FpRecordViewPage1() {
  const { fprecordId } = useLocalSearchParams();

  const { data: recordData, isLoading, isError, error } = useQuery({
    queryKey: ["fpCompleteRecordView", fprecordId],
    queryFn: () => getFPCompleteRecord(Number(fprecordId)),
    enabled: !!fprecordId,
  });

  if (isLoading) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center p-6">
        <Loader2 size={32} color="#3B82F6" />
        <Text className="text-lg text-gray-600 mt-4">Loading record...</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center p-6">
        <AlertCircle size={32} color="#EF4444" />
        <Text className="text-lg text-red-600 mt-4">Failed to load record</Text>
        <Text className="text-sm text-gray-500 mt-2 text-center">{error?.message}</Text>
      </View>
    );
  }

  if (!recordData) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center p-6">
        <FileText size={32} color="#6B7280" />
        <Text className="text-lg text-gray-600 mt-4">Record not found</Text>
        <Text className="text-sm text-gray-400 mt-1">ID: {fprecordId}</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Header Section */}
      <View className="bg-blue-600 px-6 pt-16 pb-8">
        <View className="items-center">
          <Heart size={32} color="white" />
          <Text className="text-2xl font-bold text-white mt-2">Family Planning Record</Text>
          <Text className="text-blue-100 mt-1">Complete Medical Profile</Text>
        </View>
      </View>

      <View className="px-4 -mt-4">
        {/* Client Information Card */}
        <Card className="mb-4">
          <CardHeader>
            <SectionHeader icon={User} title="Client Information" color="#3B82F6" />
          </CardHeader>
          <CardContent>
            <DataField
              icon={CreditCard}
              label="Client ID"
              value={recordData.client_id}
            />
            <DataField
              icon={User}
              label="Full Name"
              value={`${recordData.lastName}, ${recordData.givenName} ${recordData.middleInitial}`}
            />
            <DataField
              icon={Calendar}
              label="Birth Date & Age"
              value={`${recordData.dateOfBirth} (${recordData.age} years old)`}
            />
            <DataField
              icon={GraduationCap}
              label="Education"
              value={recordData.educationalAttainment}
            />
            <DataField
              icon={GraduationCap}
              label="Occupation"
              value={recordData.occupation}
            />
            <DataField
              icon={CreditCard}
              label="Philhealth ID"
              value={recordData.philhealthNo || "Not provided"}
            />
            <DataField
              icon={MapPin}
              label="Complete Address"
              value={`${recordData.address.houseNumber} ${recordData.address.street}, ${recordData.address.barangay}, ${recordData.address.municipality}, ${recordData.address.province}`}
            />
            <View className="flex-row items-center justify-between pt-2">
              <Text className="text-sm text-gray-500">NHTS:</Text>
              <Badge variant={recordData.nhts_status ? "default" : "secondary"}>
                {recordData.nhts_status ? "Yes" : "No"}
              </Badge>
            </View>
          </CardContent>
        </Card>

        {/* Family Planning Details Card */}
        <Card className="mb-4">
          <CardHeader>
            <SectionHeader icon={Heart} title="Family Planning Details" color="#EF4444" />
          </CardHeader>
          <CardContent>
            <DataField
              icon={User}
              label="Client Type"
              value={recordData.typeOfClient}
            />
            <DataField
              icon={Heart}
              label="Reason for Family Planning"
              value={recordData.reasonForFP}
            />
            <DataField
              icon={Activity}
              label="Current Method Used"
              value={recordData.methodCurrentlyUsed}
            />
            <DataField
              icon={TrendingUp}
              label="Average Monthly Income"
              value={`${recordData.avg_monthly_income?.toLocaleString() || 'Not specified'}`}
            />
            <View className="border-t border-gray-100 pt-4 mt-2">
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-sm text-gray-500">Plans to have more children:</Text>
                <Badge variant={recordData.plan_more_children ? "default" : "outline"}>
                  {recordData.plan_more_children ? "Yes" : "No"}
                </Badge>
              </View>
              <View className="flex-row items-center justify-between">
                <Text className="text-sm text-gray-500">4Ps Beneficiary:</Text>
                <Badge variant={recordData.fourps ? "default" : "outline"}>
                  {recordData.fourps ? "Yes" : "No"}
                </Badge>
              </View>
            </View>
          </CardContent>
        </Card>

        {/* Obstetrical History Card */}
        <Card className="mb-4">
          <CardHeader>
            <SectionHeader icon={Baby} title="Obstetrical History" color="#10B981" />
          </CardHeader>
          <CardContent>
            <DataField
              icon={Droplets}
              label="Menstrual Flow"
              value={recordData.obstetricalHistory.menstrualFlow}
            />
            <DataField
              icon={Droplets}
              label="Last delivery date"
              value={recordData.obstetricalHistory.lastDeliveryDate}
            />
            <DataField
              icon={Droplets}
              label="Type of last delivery"
              value={recordData.obstetricalHistory.lastDeliveryDate}
            />
            <DataField
              icon={Droplets}
              label="Previous Menstrual Period"
              value={recordData.obstetricalHistory.previousMenstrualPeriod}
            />




            <View className="flex-1 ml-2 mb-1">
              <View className="flex-row items-center justify-between">
                <Text className="text-sm text-gray-500">Dysmenorrhea:</Text>
                <Badge variant={recordData.obstetricalHistory.dysmenorrhea ? "destructive" : "secondary"}>
                  {recordData.obstetricalHistory.dysmenorrhea ? "Yes" : "No"}
                </Badge>
              </View>
            </View>
            <View className="flex-1 ml-2 mb-1">
              <View className="flex-row items-center justify-between">
                <Text className="text-sm text-gray-500">Hydaditi Form Mole:</Text>
                <Badge variant={recordData.obstetricalHistory.hydatidiformMole ? "destructive" : "secondary"}>
                  {recordData.obstetricalHistory.hydatidiformMole ? "Yes" : "No"}
                </Badge>
              </View>
            </View>

            <View className="flex-1 ml-2 mb-1">
              <View className="flex-row items-center justify-between">
                <Text className="text-sm text-gray-500">Ectopic Pregnancy History:</Text>
                <Badge variant={recordData.obstetricalHistory.ectopicPregnancyHistory ? "destructive" : "secondary"}>
                  {recordData.obstetricalHistory.ectopicPregnancyHistory ? "Yes" : "No"}
                </Badge>
              </View>
            </View>

            <View className="border-t border-gray-100 pt-4">
              <Text className="text-sm font-medium text-gray-800 mb-3">Pregnancy Statistics</Text>
              <View className="flex-row mb-3">
                <StatCard
                  icon={Baby}
                  value={recordData.obstetricalHistory.g_pregnancies}
                  label="Gravida"
                  color="#3B82F6"
                />
                <StatCard
                  icon={Baby}
                  value={recordData.obstetricalHistory.p_pregnancies}
                  label="Para"
                  color="#10B981"
                />
                <StatCard
                  icon={Heart}
                  value={recordData.obstetricalHistory.livingChildren}
                  value={`${recordData.obstetricalHistory?.livingChildren || 0}`}
                  label="Living Children"
                  color="#8B5CF6"
                />
              </View>
              <View className="flex-row">
                <StatCard
                  icon={Calendar}
                  value={`${recordData.obstetricalHistory?.fullTerm || 0}`}
                  label="Full Term"
                  color="#F59E0B"
                />
                <StatCard
                  icon={Clock}
                  value={`${recordData.obstetricalHistory.premature || 0}`}
                  label="Premature"
                  color="#EAB308"
                />
                <StatCard
                  icon={AlertCircle}
                  value={recordData.obstetricalHistory.abortion}
                  label="Abortion"
                  color="#EF4444"
                />
              </View>
            </View>
          </CardContent>
        </Card>

        {/* Medical History Card */}
        <Card className="mb-4">
          <CardHeader>
            <SectionHeader icon={Stethoscope} title="Medical History" color="#8B5CF6" />
          </CardHeader>
          <CardContent>
            {recordData.medical_history_records.map((record: any) => (
              <View key={record.medhist_id} className="flex-row items-center justify-between py-3 border-b border-gray-100">
                <Text className="text-sm text-gray-800 flex-1">{record.illname}</Text>
                <Badge variant={recordData.selectedIllnessIds.includes(record.ill_id) ? "destructive" : "secondary"}>
                  {recordData.selectedIllnessIds.includes(record.ill_id) ? "Yes" : "No"}
                </Badge>
              </View>
            ))}
          </CardContent>
        </Card>

        <Card className="mb-4">
          <CardHeader>
            <SectionHeader icon={Stethoscope} title="Risk STI" color="#8B5CF6" />
          </CardHeader>
          <CardContent>

            <View className="flex-row items-center justify-between mb-1">
              <Text className="text-sm text-gray-500">Abnormal Discharge:</Text>
              <Badge variant={recordData.risk_sti.abnormalDischarge ? "destructive" : "secondary"}>
                {recordData.risk_sti.abnormalDischarge ? "Yes" : "No"}
              </Badge>
            </View>

            {recordData.risk_sti.abnormalDischarge && (
              <View className="flex-row items-center justify-between mb-1">
                <Text className="text-sm text-gray-500">Discharge from:</Text>
                <Badge variant={recordData.risk_sti.dischargeFrom}>{recordData.risk_sti.dischargeFrom}
                </Badge>
              </View>
            )}

            <View className="flex-row items-center justify-between mb-1">
              <Text className="text-sm text-gray-500">Sores:</Text>
              <Badge variant={recordData.risk_sti.sores ? "destructive" : "secondary"}>
                {recordData.risk_sti.sores ? "Yes" : "No"}
              </Badge>
            </View>

            <View className="flex-row items-center justify-between mb-1">
              <Text className="text-sm text-gray-500">Pain:</Text>
              <Badge variant={recordData.obstetricalHistory.pain ? "destructive" : "secondary"}>
                {recordData.obstetricalHistory.pain ? "Yes" : "No"}
              </Badge>
            </View>

            <View className="flex-row items-center justify-between mb-1">
              <Text className="text-sm text-gray-500">History:</Text>
              <Badge variant={recordData.obstetricalHistory.history ? "destructive" : "secondary"}>
                {recordData.obstetricalHistory.history ? "Yes" : "No"}
              </Badge>
            </View>

            <View className="flex-row items-center justify-between mb-1">
              <Text className="text-sm text-gray-500">Hiv:</Text>
              <Badge variant={recordData.obstetricalHistory.hiv ? "destructive" : "secondary"}>
                {recordData.obstetricalHistory.hiv ? "Yes" : "No"}
              </Badge>
            </View>
          </CardContent>
        </Card>

          {/* Risk Vaw */}
         <Card className="mb-4">
          <CardHeader>
            <SectionHeader icon={Stethoscope} title="Risk VAW" color="#8B5CF6" />
          </CardHeader>
          <CardContent>

            <View className="flex-row items-center justify-between mb-1">
              <Text className="text-sm text-gray-500">Unpleasant Relationship:</Text>
              <Badge variant={recordData.risk_vaw.unpleasant_relationship ? "destructive" : "secondary"}>
                {recordData.risk_vaw.unpleasant_relationship ? "Yes" : "No"}
              </Badge>
            </View>

            <View className="flex-row items-center justify-between mb-1">
              <Text className="text-sm text-gray-500">Partner Disapproval:</Text>
              <Badge variant={recordData.risk_vaw.partner_disapproval ? "destructive" : "secondary"}>
                {recordData.risk_vaw.partner_disapproval ? "Yes" : "No"}
              </Badge>
            </View>

            <View className="flex-row items-center justify-between mb-1">
              <Text className="text-sm text-gray-500">Domestic Violence:</Text>
              <Badge variant={recordData.risk_vaw.domestic_violence ? "destructive" : "secondary"}>
                {recordData.risk_vaw.domestic_violence ? "Yes" : "No"}
              </Badge>
            </View>

            <View className="flex-row items-center justify-between mb-1">
              <Text className="text-sm text-gray-500">History:</Text>
              <Badge variant={recordData.risk_vaw.referredTo}>
                {recordData.risk_vaw.referredTo}
              </Badge>
            </View>
          </CardContent>
        </Card>


<Card className="mb-4">
          <CardHeader>
            <SectionHeader icon={Stethoscope} title="Pelvic Examination" color="#8B5CF6" />
          </CardHeader>
          <CardContent>

            <View className="flex-row items-center justify-between mb-1">
              <Text className="text-sm text-gray-500">Pelvic Exam:</Text>
              <Badge variant={recordData.fp_pelvic_exam.pelvicExamination}>
                {recordData.fp_pelvic_exam.pelvicExamination}
              </Badge>
            </View>

            <View className="flex-row items-center justify-between mb-1">
              <Text className="text-sm text-gray-500">Cervical Tenderness:</Text>
              <Badge variant={recordData.fp_pelvic_exam.cervicalTenderness ? "destructive" : "secondary"}>
                {recordData.fp_pelvic_exam.cervicalTenderness ? "Yes" : "No"}
              </Badge>
            </View>

            <View className="flex-row items-center justify-between mb-1">
              <Text className="text-sm text-gray-500">Cervical Adnexal:</Text>
              <Badge variant={recordData.fp_pelvic_exam.cervicalAdnexal ? "destructive" : "secondary"}>
                {recordData.fp_pelvic_exam.cervicalAdnexal ? "Yes" : "No"}
              </Badge>
            </View>

            <View className="flex-row items-center justify-between mb-1">
              <Text className="text-sm text-gray-500">History:</Text>
              <Badge variant={recordData.fp_pelvic_exam.cervicalConsistency}>
                {recordData.fp_pelvic_exam.cervicalConsistency}
              </Badge>
            </View>

              <View className="flex-row items-center justify-between mb-1">
              <Text className="text-sm text-gray-500">Uterine Position:</Text>
              <Badge variant={recordData.fp_pelvic_exam.uterinePosition}>
                {recordData.fp_pelvic_exam.uterinePosition}
              </Badge>
            </View>

              <View className="flex-row items-center justify-between mb-1">
              <Text className="text-sm text-gray-500">Uterine depth:</Text>
              <Badge variant={recordData.fp_pelvic_exam.uterineDepth}>
                {recordData.fp_pelvic_exam.uterineDepth}
              </Badge>
            </View>
          </CardContent>
        </Card>


        {/* Physical Examination Card */}
        <Card className="mb-4">
          <CardHeader>
            <SectionHeader icon={Activity} title="Physical Examination" color="#F59E0B" />
          </CardHeader>
          <CardContent>
            <DataField icon={User} label="Skin Examination" value={recordData.skinExamination} />
            <DataField icon={User} label="Conjunctiva Examination" value={recordData.conjunctivaExamination} />
            <DataField icon={User} label="Neck Examination" value={recordData.neckExamination} />
            <DataField icon={User} label="Breast Examination" value={recordData.breastExamination} />
            <DataField icon={User} label="Abdomen Examination" value={recordData.abdomenExamination} />
            <DataField icon={User} label="Extremities Examination" value={recordData.extremitiesExamination} />

            <View className="border-t border-gray-100 pt-4 mt-2">
              <Text className="text-sm font-medium text-gray-800 mb-3">Vital Signs</Text>
              <View className="flex-row">
                <StatCard
                  icon={Scale}
                  value={`${recordData.weight}`}
                  label="Weight (kg)"
                  color="#3B82F6"
                />
                <StatCard
                  icon={Ruler}
                  value={`${recordData.height}`}
                  label="Height (cm)"
                  color="#10B981"
                />
                <StatCard
                  icon={Heart}
                  value={recordData.bloodPressure}
                  label="Blood Pressure"
                  color="#EF4444"
                />
                <StatCard
                  icon={Heart}
                  value={recordData.pulseRate}
                  label="Pulse Rate"
                  color="#EF4444"
                />
              </View>
            </View>
          </CardContent>
        </Card>

        {/* Client Acknowledgement Card */}
        <Card className="mb-4">
          <CardHeader>
            <SectionHeader icon={UserCheck} title="Acknowledgement" color="#06B6D4" />
          </CardHeader>
          <CardContent>
            <DataField
              icon={User}
              label="Method selected"
              value={recordData.acknowledgement.selectedMethod}
            />
            <DataField
              icon={User}
              label="Client Name"
              value={recordData.acknowledgement.clientName}
            />
            <DataField
              icon={Calendar}
              label="Signature Date"
              value={recordData.acknowledgement.clientSignatureDate}
            />

          <View className="mt-4">
  <Text className="text-sm text-gray-500 mb-3">Client Signature:</Text>
  {recordData.acknowledgement?.clientSignature ? (
    <View className="rounded-lg p-4 items-center">
      <Image
        source={{ 
          uri: `data:image/png;base64,${recordData.acknowledgement.clientSignature.startsWith('data:image') 
            ? recordData.acknowledgement.clientSignature.split(',')[1] 
            : recordData.acknowledgement.clientSignature}`
        }}
        className="w-48 h-24 rounded-md"
        resizeMode="contain"
        onError={(e) => console.log('Failed to load signature:', e.nativeEvent.error)}
      />
    </View>
  ) : (
    <View className="bg-gray-50 rounded-lg p-6 items-center">
      <FileText size={24} color="#9CA3AF" />
      <Text className="text-sm text-gray-500 mt-2">No signature available</Text>
    </View>
  )}
</View>

{recordData.acknowledgement?.guardianSignature && (
  <>
    <View className="mt-4">
      <Text className="text-sm text-gray-500 mb-3">Guardian Signature:</Text>
      <View className="rounded-lg p-4 items-center">
        <Image
          source={{ 
            uri: `data:image/png;base64,${recordData.acknowledgement.guardianSignature.startsWith('data:image') 
              ? recordData.acknowledgement.guardianSignature.split(',')[1] 
              : recordData.acknowledgement.guardianSignature}`
          }}
          className="w-48 h-24 rounded-md"
          resizeMode="contain"
        />
      </View>
    </View>
    <DataField
      icon={Calendar}
      label="Guardian signature date"
      value={recordData.acknowledgement.guardianSignatureDate || 'Not specified'}
    />
  </>
)}

          </CardContent>
        </Card>

        {/* Service Provision Card */}
        <Card className="mb-4">
          <CardHeader>
            <SectionHeader icon={Clock} title="Service Provision" color="#10B981" />
          </CardHeader>
          <CardContent>
            {recordData.serviceProvisionRecords.map((service: any, index: number) => (
              <View key={index} className="bg-gray-50 rounded-lg p-4 mb-3">
                <View className="flex-row items-center mb-3">
                  <Badge variant="outline">{`Visit ${index + 1}`}</Badge>
                </View>
                <DataField icon={Calendar} label="Visit Date" value={service.dateOfVisit} />
                <DataField icon={Heart} label="Method Accepted" value={service.methodAccepted || "Not specified"} />
                <DataField icon={User} label="Service Provider" value={service.nameOfServiceProvider} />
                <DataField icon={Calendar} label="Follow-up Date" value={service.dateOfFollowUp} />
                <DataField icon={FileText} label="Medical Findings" value={service.medicalFindings} />
              </View>
            ))}
          </CardContent>
        </Card>

        <Card className="mb-4">
          <CardHeader>
            <SectionHeader icon={Stethoscope} title="Pregnancy Check" color="#8B5CF6" />
          </CardHeader>
          <CardContent>

            <View className="flex-row items-center justify-between mb-1">
              <Text className="text-sm text-gray-500">Breastfeeding?</Text>
              <Badge variant={recordData.pregnancyCheck.breastfeeding ? "destructive" : "secondary"}>
                {recordData.pregnancyCheck.breastfeeding ? "Yes" : "No"}
              </Badge>
            </View>

            <View className="flex-row items-center justify-between mb-1">
              <Text className="text-sm text-gray-500">Abstained?</Text>
              <Badge variant={recordData.pregnancyCheck.abstained ? "destructive" : "secondary"}>
                {recordData.pregnancyCheck.abstained ? "Yes" : "No"}
              </Badge>
            </View>

            <View className="flex-row items-center justify-between mb-1">
              <Text className="text-sm text-gray-500">Recent Baby?</Text>
              <Badge variant={recordData.pregnancyCheck.recent_baby ? "destructive" : "secondary"}>
                {recordData.pregnancyCheck.recent_baby ? "Yes" : "No"}
              </Badge>
            </View>

            <View className="flex-row items-center justify-between mb-1">
              <Text className="text-sm text-gray-500">Recent period?</Text>
              <Badge variant={recordData.pregnancyCheck.recent_period ? "destructive" : "secondary"}>
                {recordData.pregnancyCheck.recent_period ? "Yes" : "No"}
              </Badge>
            </View>

            <View className="flex-row items-center justify-between mb-1">
              <Text className="text-sm text-gray-500">Recent abortion?</Text>
              <Badge variant={recordData.pregnancyCheck.recent_abortion ? "destructive" : "secondary"}>
                {recordData.pregnancyCheck.recent_abortion ? "Yes" : "No"}
              </Badge>
            </View>

             <View className="flex-row items-center justify-between mb-1">
              <Text className="text-sm text-gray-500">Using contraceptive?</Text>
              <Badge variant={recordData.pregnancyCheck.using_contraceptive ? "destructive" : "secondary"}>
                {recordData.pregnancyCheck.using_contraceptive ? "Yes" : "No"}
              </Badge>
            </View>
          </CardContent>
        </Card>

        {/* Navigation Button */}
        <View className="pb-6">
          <Button
            onPress={() =>
              router.push({
                pathname: "/admin/familyplanning/viewpage2",
                params: { fprecordId: fprecordId?.toString() },
              })
            }
          >
            <View className="flex-row items-center">
              <Text className="text-white text-base font-semibold mr-2">Continue to Page 2</Text>
              <ArrowRight size={20} color="white" />
            </View>
          </Button>
        </View>
      </View>
    </ScrollView>
  );
}