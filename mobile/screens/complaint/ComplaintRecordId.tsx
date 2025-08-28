import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useGetComplaintById } from "./queries/ComplaintGetQueries";
import {
  ChevronLeft,
  Calendar,
  Clock,
  MapPin,
  User,
  FileText,
  Eye,
  Download,
  Share,
  AlertCircle,
  CheckCircle,
} from "lucide-react-native";

interface AddressData {
  street?: string;
  barangay?: string;
  city?: string;
  province?: string;
  sitio?: string;
}

interface ComplainantData {
  fullName: string;
  gender: "Male" | "Female" | "Other" | "Prefer not to say";
  customGender?: string;
  age: string;
  relation_to_respondent: string;
  contactNumber: string;
  address: AddressData;
}

interface AccusedData {
  alias: string;
  age: string;
  gender: string;
  genderInput?: string;
  description: string;
  address: AddressData;
}

interface IncidentData {
  location: string;
  type: "Theft" | "Assault" | "Property Damage" | "Noise" | "Other";
  otherType?: string;
  description: string;
  date: string;
  time: string;
}

interface FileData {
  id?: string;
  type: "image" | "video" | "document";
  name: string;
  size: number;
  publicUrl?: string;
  storagePath?: string;
  status?: "uploading" | "uploaded" | "error";
  previewUrl?: string;
}

interface ComplaintRecord {
  id: string;
  complaintNumber: string;
  status: "Pending" | "Under Investigation" | "Resolved" | "Closed";
  dateSubmitted: string;
  complainant: ComplainantData[];
  accused: AccusedData[];
  incident: IncidentData;
  documents?: FileData[];
  assignedOfficer?: string;
  lastUpdated: string;
}

interface StatusBadgeProps {
  status: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStatusColor = () => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Under Investigation":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Resolved":
        return "bg-green-100 text-green-800 border-green-200";
      case "Closed":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case "Resolved":
        return <CheckCircle size={16} className="text-green-600" />;
      case "Under Investigation":
        return <AlertCircle size={16} className="text-blue-600" />;
      default:
        return <Clock size={16} className="text-yellow-600" />;
    }
  };

  return (
    <View
      className={`flex-row items-center px-3 py-1 rounded-full border ${getStatusColor()}`}
    >
      {getStatusIcon()}
      <Text
        className={`ml-2 text-sm font-medium ${getStatusColor().split(" ")[1]}`}
      >
        {status}
      </Text>
    </View>
  );
};

interface SectionHeaderProps {
  title: string;
  icon: React.ReactNode;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ title, icon }) => (
  <View className="flex-row items-center mb-4">
    <View className="w-8 h-8 rounded-lg bg-blue-100 items-center justify-center mr-3">
      {icon}
    </View>
    <Text className="text-lg font-semibold text-gray-900">{title}</Text>
  </View>
);

interface InfoRowProps {
  label: string;
  value: string;
  isMultiline?: boolean;
}

const InfoRow: React.FC<InfoRowProps> = ({
  label,
  value,
  isMultiline = false,
}) => (
  <View className={`mb-3 ${isMultiline ? "mb-4" : ""}`}>
    <Text className="text-sm font-medium text-gray-600 mb-1">{label}</Text>
    <Text className={`text-gray-900 ${isMultiline ? "leading-6" : ""}`}>
      {value || "Not provided"}
    </Text>
  </View>
);

const formatAddress = (address: AddressData | null | undefined): string => {
  if (!address) return "Not provided";

  const parts: string[] = [];

  // Safely check each property and add to parts if it exists and is not empty
  if (address.street && address.street.trim()) {
    parts.push(address.street.trim());
  }
  if (address.sitio && address.sitio.trim()) {
    parts.push(address.sitio.trim());
  }
  if (address.barangay && address.barangay.trim()) {
    parts.push(`Brgy. ${address.barangay.trim()}`);
  }
  if (address.city && address.city.trim()) {
    parts.push(address.city.trim());
  }
  if (address.province && address.province.trim()) {
    parts.push(address.province.trim());
  }

  return parts.length > 0 ? parts.join(", ") : "Not provided";
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const getFileIcon = (type: string) => {
  switch (type) {
    case "image":
      return "🖼️";
    case "video":
      return "🎥";
    case "document":
      return "📄";
    default:
      return "📁";
  }
};

// Helper function to safely get string value
const safeGetString = (value: any): string => {
  if (value === null || value === undefined) return "";
  return String(value).trim();
};

// Helper function to safely parse address data
const safeParseAddress = (addressData: any): AddressData => {
  if (!addressData || typeof addressData !== "object") {
    return {};
  }

  return {
    street: safeGetString(addressData.street) || undefined,
    barangay: safeGetString(addressData.barangay) || undefined,
    city: safeGetString(addressData.city) || undefined,
    province: safeGetString(addressData.province) || undefined,
    sitio: safeGetString(addressData.sitio) || undefined,
  };
};

export const ComplaintRecordView: React.FC = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  // Ensure ID is valid before making API call
  const complaintId = Array.isArray(id) ? id[0] : id;
  const isValidId = complaintId && complaintId.trim() !== "";

  // Use your existing API hook - only if we have a valid ID
  const {
    data: apiData,
    isLoading,
    error,
  } = useGetComplaintById(complaintId || "");

  // Transform API data to match component expectations
  const record = React.useMemo(() => {
    if (!apiData) return null;

    try {
      // Parse JSON strings from backend if they exist
      let complainantData = [];
      try {
        complainantData = Array.isArray(apiData.complainant)
          ? apiData.complainant
          : typeof apiData.complainant === "string"
          ? JSON.parse(apiData.complainant)
          : [];
      } catch (e) {
        console.error("Error parsing complainant data:", e);
        complainantData = [];
      }

      let accusedData = [];
      try {
        accusedData = Array.isArray(apiData.accused)
          ? apiData.accused
          : typeof apiData.accused === "string"
          ? JSON.parse(apiData.accused)
          : [];
      } catch (e) {
        console.error("Error parsing accused data:", e);
        accusedData = [];
      }

      let documentsData = [];
      try {
        documentsData = Array.isArray(apiData.uploaded_files)
          ? apiData.uploaded_files
          : typeof apiData.uploaded_files === "string"
          ? JSON.parse(apiData.uploaded_files)
          : [];
      } catch (e) {
        console.error("Error parsing documents data:", e);
        documentsData = [];
      }

      // Handle datetime splitting from your API structure
      let date = "";
      let time = "";

      if (apiData.comp_datetime) {
        const [datepart, timepart] = apiData.comp_datetime.split(" ");
        date = datepart || "";
        time = timepart || "";
      }

      // Safely process complainant data with address parsing
      const processedComplainants = complainantData.map((complainant: any) => ({
        fullName: safeGetString(complainant.fullName) || "Not provided",
        gender: complainant.gender || "Not provided",
        customGender: safeGetString(complainant.customGender) || undefined,
        age: safeGetString(complainant.age) || "Not provided",
        relation_to_respondent:
          safeGetString(complainant.relation_to_respondent) || "Not provided",
        contactNumber:
          safeGetString(complainant.contactNumber) || "Not provided",
        address: safeParseAddress(complainant.address),
      }));

      // Safely process accused data with address parsing
      const processedAccused = accusedData.map((accused: any) => ({
        alias: safeGetString(accused.alias) || "Not provided",
        age: safeGetString(accused.age) || "Not provided",
        gender: safeGetString(accused.gender) || "Not provided",
        genderInput: safeGetString(accused.genderInput) || undefined,
        description: safeGetString(accused.description) || "Not provided",
        address: safeParseAddress(accused.address),
      }));

      const transformedRecord: ComplaintRecord = {
        id: apiData.comp_id || complaintId,
        complaintNumber: `CMP-${apiData.comp_id || complaintId}`,
        status: apiData.comp_status || "Pending",
        dateSubmitted:
          apiData.comp_created_at?.split(" ")[0] ||
          new Date().toISOString().split("T")[0],
        complainant: processedComplainants,
        accused: processedAccused,
        incident: {
          type: apiData.comp_incident_type || "Other",
          location: safeGetString(apiData.comp_location) || "Not provided",
          description:
            safeGetString(
              apiData.comp_allegation || apiData.comp_description
            ) || "Not provided",
          date: date || new Date().toISOString().split("T")[0],
          time: time || "00:00",
        },
        documents: documentsData,
        assignedOfficer: safeGetString(apiData.assigned_officer) || undefined,
        lastUpdated:
          apiData.comp_updated_at?.split(" ")[0] ||
          apiData.comp_created_at?.split(" ")[0] ||
          new Date().toISOString().split("T")[0],
      };

      return transformedRecord;
    } catch (parseError) {
      console.error("Error parsing API data:", parseError);
      return null;
    }
  }, [apiData, complaintId, isValidId]);

  // Show invalid ID error if no valid ID is provided
  if (!isValidId) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-row items-center justify-between px-4 py-3 bg-white border-b border-gray-100">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
          >
            <ChevronLeft size={24} className="text-gray-700" />
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-gray-900">
            Invalid ID
          </Text>
          <View className="w-10 h-10" />
        </View>
        <View className="flex-1 items-center justify-center px-4">
          <AlertCircle size={48} className="text-red-500 mb-4" />
          <Text className="text-lg font-semibold text-gray-900 mb-2">
            Invalid Complaint ID
          </Text>
          <Text className="text-gray-600 text-center mb-4">
            No valid complaint ID provided in the URL.
          </Text>
          <TouchableOpacity
            onPress={() => router.back()}
            className="bg-blue-600 px-6 py-3 rounded-lg"
          >
            <Text className="text-white font-medium">Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-row items-center justify-between px-4 py-3 bg-white border-b border-gray-100">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
          >
            <ChevronLeft size={24} className="text-gray-700" />
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-gray-900">
            Loading...
          </Text>
          <View className="w-10 h-10" />
        </View>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#2563eb" />
          <Text className="mt-4 text-gray-600">
            Loading complaint details...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (error || !record) {
    const errorMessage = error?.message || "Complaint not found";

    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-row items-center justify-between px-4 py-3 bg-white border-b border-gray-100">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
          >
            <ChevronLeft size={24} className="text-gray-700" />
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-gray-900">Error</Text>
          <View className="w-10 h-10" />
        </View>
        <View className="flex-1 items-center justify-center px-4">
          <AlertCircle size={48} className="text-red-500 mb-4" />
          <Text className="text-lg font-semibold text-gray-900 mb-2">
            Failed to Load
          </Text>
          <Text className="text-gray-600 text-center mb-4">{errorMessage}</Text>
          <TouchableOpacity
            onPress={() => router.back()}
            className="bg-blue-600 px-6 py-3 rounded-lg"
          >
            <Text className="text-white font-medium">Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (e) {
      return dateString || "Not provided";
    }
  };

  const formatTime = (timeString: string) => {
    try {
      return new Date(`2000-01-01T${timeString}`).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } catch (e) {
      return timeString || "Not provided";
    }
  };

  const handleDocumentView = (document: FileData) => {
    Alert.alert("View Document", `Would you like to view ${document.name}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "View",
        onPress: () => console.log("View document:", document.publicUrl),
      },
    ]);
  };

  const handleShare = () => {
    Alert.alert("Share Complaint", "Share complaint details", [
      { text: "Cancel", style: "cancel" },
      { text: "Share", onPress: () => console.log("Share complaint") },
    ]);
  };

  const handleDownload = () => {
    Alert.alert("Download Report", "Download complaint report as PDF", [
      { text: "Cancel", style: "cancel" },
      { text: "Download", onPress: () => console.log("Download report") },
    ]);
  };

  const getIncidentType = (incident: IncidentData) => {
    return incident.type === "Other" && incident.otherType
      ? incident.otherType
      : incident.type;
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Complaint Header */}
        <View className="bg-white p-4 pt-12 border-b border-gray-100">
          <View className="relative flex-row items-center justify-center px-4 py-3 bg-white border-b border-gray-100">
            {/* Left back button - absolute on left */}
            <TouchableOpacity
              onPress={() => router.back()}
              className="absolute left-0 w-10 h-10 rounded-full bg-white items-center justify-center shadow-sm"
            >
              <ChevronLeft size={24} className="text-gray-700" />
            </TouchableOpacity>

            {/* Center title */}
            <Text className="text-lg font-semibold text-gray-900">
              Complaint Details
            </Text>

            {/* Right icons - absolute on right */}
            <View className="absolute right-4 flex-row space-x-2">
              <TouchableOpacity
                onPress={handleShare}
                className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
              >
                <Share size={20} className="text-gray-700" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleDownload}
                className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
              >
                <Download size={20} className="text-gray-700" />
              </TouchableOpacity>
            </View>
          </View>

          <View className="flex-row items-center justify-between mb-3 mt-4">
            <Text className="text-xl font-bold text-gray-900">
              {record.complaintNumber}
            </Text>
            <StatusBadge status={record.status} />
          </View>

          <View className="flex-row items-center text-gray-600 mb-2">
            <Calendar size={16} className="text-gray-500 mr-2" />
            <Text className="text-sm text-gray-600">
              Submitted: {formatDate(record.dateSubmitted)}
            </Text>
          </View>

          <View className="flex-row items-center text-gray-600">
            <Clock size={16} className="text-gray-500 mr-2" />
            <Text className="text-sm text-gray-600">
              Last Updated: {formatDate(record.lastUpdated)}
            </Text>
          </View>
          <View className="mt-3 p-3 bg-blue-50 rounded-lg">
            <Text className="text-sm font-medium text-blue-900">
              Assigned Officer: {record.assignedOfficer}
            </Text>
          </View>
        </View>

        {/* Incident Details */}
        <View className="bg-white p-4 mb-2">
          <SectionHeader
            title="Incident Information"
            icon={<AlertCircle size={20} className="text-blue-600" />}
          />

          <InfoRow
            label="Type of Incident"
            value={getIncidentType(record.incident)}
          />

          <View className="flex-row items-start mb-3">
            <MapPin size={16} className="text-gray-500 mr-2 mt-1" />
            <View className="flex-1">
              <Text className="text-sm font-medium text-gray-600 mb-1">
                Location
              </Text>
              <Text className="text-gray-900">{record.incident.location}</Text>
            </View>
          </View>

          <View className="flex-row space-x-4 mb-3">
            <View className="flex-1">
              <InfoRow label="Date" value={formatDate(record.incident.date)} />
            </View>
            <View className="flex-1">
              <InfoRow label="Time" value={formatTime(record.incident.time)} />
            </View>
          </View>

          <InfoRow
            label="Description"
            value={record.incident.description}
            isMultiline={true}
          />
        </View>

        {/* Complainant Information */}
        <View className="bg-white p-4 mb-2">
          <SectionHeader
            title="Complainant Information"
            icon={<User size={20} className="text-blue-600" />}
          />

          {record.complainant.map((complainant, index) => (
            <View
              key={index}
              className={index > 0 ? "mt-6 pt-4 border-t border-gray-100" : ""}
            >
              {record.complainant.length > 1 && (
                <Text className="text-sm font-medium text-gray-500 mb-3">
                  Complainant {index + 1}
                </Text>
              )}

              <InfoRow label="Full Name" value={complainant.fullName} />

              <View className="flex-row space-x-4 mb-3">
                <View className="flex-1">
                  <InfoRow label="Age" value={complainant.age} />
                </View>
                <View className="flex-1">
                  <InfoRow
                    label="Gender"
                    value={
                      complainant.gender === "Other" && complainant.customGender
                        ? complainant.customGender
                        : complainant.gender
                    }
                  />
                </View>
              </View>

              <InfoRow
                label="Contact Number"
                value={complainant.contactNumber}
              />
              <InfoRow
                label="Relationship to Incident"
                value={complainant.relation_to_respondent}
              />
              <InfoRow
                label="Address"
                value={formatAddress(complainant.address)}
              />
            </View>
          ))}
        </View>

        {/* Accused Information */}
        <View className="bg-white p-4 mb-2">
          <SectionHeader
            title="Accused Information"
            icon={<User size={20} className="text-blue-600" />}
          />

          {record.accused.map((accused, index) => (
            <View
              key={index}
              className={index > 0 ? "mt-6 pt-4 border-t border-gray-100" : ""}
            >
              {record.accused.length > 1 && (
                <Text className="text-sm font-medium text-gray-500 mb-3">
                  Accused {index + 1}
                </Text>
              )}

              <InfoRow label="Alias/Name" value={accused.alias} />

              <View className="flex-row space-x-4 mb-3">
                <View className="flex-1">
                  <InfoRow label="Age" value={accused.age} />
                </View>
                <View className="flex-1">
                  <InfoRow
                    label="Gender"
                    value={
                      accused.gender === "Other" && accused.genderInput
                        ? accused.genderInput
                        : accused.gender
                    }
                  />
                </View>
              </View>

              <InfoRow label="Address" value={formatAddress(accused.address)} />
              <InfoRow
                label="Description"
                value={accused.description}
                isMultiline={true}
              />
            </View>
          ))}
        </View>

        {/* Documents */}
        {record.documents && record.documents.length > 0 && (
          <View className="bg-white p-4 mb-2">
            <SectionHeader
              title="Supporting Documents"
              icon={<FileText size={20} className="text-blue-600" />}
            />

            {record.documents.map((document, index) => (
              <TouchableOpacity
                key={document.id || index}
                onPress={() => handleDocumentView(document)}
                className="flex-row items-center p-3 bg-gray-50 rounded-lg mb-3"
              >
                <View className="w-12 h-12 rounded-lg bg-blue-100 items-center justify-center mr-3">
                  <Text className="text-lg">{getFileIcon(document.type)}</Text>
                </View>
                <View className="flex-1">
                  <Text className="font-medium text-gray-900">
                    {document.name}
                  </Text>
                  <Text className="text-sm text-gray-500 capitalize">
                    {document.type} • {formatFileSize(document.size)}
                  </Text>
                  {document.status && (
                    <Text
                      className={`text-xs mt-1 ${
                        document.status === "uploaded"
                          ? "text-green-600"
                          : document.status === "uploading"
                          ? "text-blue-600"
                          : "text-red-600"
                      }`}
                    >
                      {document.status === "uploaded"
                        ? "✓ Uploaded"
                        : document.status === "uploading"
                        ? "⟳ Uploading..."
                        : "✗ Error"}
                    </Text>
                  )}
                </View>
                <Eye size={20} className="text-gray-400" />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Bottom spacing */}
        <View className="h-6" />
      </ScrollView>
    </SafeAreaView>
  );
};
