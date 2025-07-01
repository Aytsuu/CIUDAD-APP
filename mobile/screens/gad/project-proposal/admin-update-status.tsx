"use client"

import type React from "react"
import { useState } from "react"
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    SafeAreaView,
    StatusBar,
    RefreshControl,
    Modal,
    TextInput,
    Image,
} from "react-native"
import { ArrowLeft, Search, ChevronLeft } from "lucide-react-native"
import {
    useGetProjectProposals,
    useGetProjectProposal,
    type ProjectProposal,
    useGetSupportDocs,
} from "./queries/fetchqueries"
import { useUpdateProjectProposalStatus } from "./queries/updatequeries"
import { QueryProvider } from "./api/query-provider"
import ScreenLayout from "@/screens/_ScreenLayout"
import { useRouter } from "expo-router"
import { SelectLayout } from "@/components/ui/select-layout"

type ProposalStatus = "Pending" | "Approved" | "Rejected" | "Viewed"

const StatusUpdateModal: React.FC<{
    visible: boolean
    project: ProjectProposal | null
    onClose: () => void
    onUpdate: (status: ProposalStatus, reason: string | null) => void
    isLoading: boolean
}> = ({ visible, project, onClose, onUpdate, isLoading }) => {
    const [selectedStatus, setSelectedStatus] = useState<ProposalStatus | null>(null)
    const [reason, setReason] = useState("")
    const [showStatusDropdown, setShowStatusDropdown] = useState(false)
    
    const statusOptions: ProposalStatus[] = ["Pending", "Approved", "Rejected", "Viewed"]

    const isReasonRequired = selectedStatus === "Approved" || selectedStatus === "Rejected"
    const isUpdateDisabled = !selectedStatus || selectedStatus === project?.status || (isReasonRequired && !reason.trim())

    const handleUpdate = () => {
        if (selectedStatus && !isUpdateDisabled) {
            onUpdate(selectedStatus, isReasonRequired ? reason : null)
        }
    }

    const handleClose = () => {
        setSelectedStatus(null)
        setReason("")
        setShowStatusDropdown(false)
        onClose()
    }

    return (
        <Modal 
            visible={visible} 
            transparent 
            animationType="fade" 
            onRequestClose={handleClose}
            statusBarTranslucent={true}
        >
            {/* Main overlay */}
            <View className="absolute inset-0 bg-black/50 justify-center items-center">
                {/* Modal content */}
                <View className="bg-white rounded-lg p-6 w-[90%] max-w-md">
                    <Text className="text-lg font-semibold text-gray-900 mb-4 text-center">
                        Update Proposal Status
                    </Text>

                    {/* Status selection */}
                    <View className="mb-4 relative z-10">
                        <Text className="text-sm font-medium text-gray-700 mb-2">
                            Select Status
                        </Text>
                        <TouchableOpacity
                            className="bg-white border border-gray-300 rounded px-3 py-2 flex-row justify-between items-center"
                            onPress={() => setShowStatusDropdown(!showStatusDropdown)}
                        >
                            <Text className="text-gray-700">
                                {selectedStatus || "Select Status"}
                            </Text>
                            <Text className="text-gray-400">▼</Text>
                        </TouchableOpacity>

                        {/* Dropdown options */}
                        {showStatusDropdown && (
                            <View className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-20">
                                {statusOptions.map((status) => (
                                    <TouchableOpacity
                                        key={status}
                                        className={`px-4 py-3 ${status === selectedStatus ? "bg-blue-50" : ""}`}
                                        onPress={() => {
                                            setSelectedStatus(status)
                                            setShowStatusDropdown(false)
                                            if (status !== "Approved" && status !== "Rejected") {
                                                setReason("")
                                            }
                                        }}
                                    >
                                        <Text className={`text-center ${status === selectedStatus ? "text-blue-600 font-medium" : "text-gray-700"}`}>
                                            {status}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                    </View>

                    {/* Reason input (conditionally shown) */}
                    {isReasonRequired && (
                        <View className="mb-4">
                            <Text className="text-sm font-medium text-gray-700 mb-2">
                                Reason for {selectedStatus} <Text className="text-red-500">*</Text>
                            </Text>
                            <TextInput
                                className="bg-white border border-gray-300 rounded px-3 py-2 h-20 text-sm"
                                placeholder={`Enter reason for ${selectedStatus?.toLowerCase()}...`}
                                value={reason}
                                onChangeText={setReason}
                                multiline
                                textAlignVertical="top"
                            />
                            {isReasonRequired && !reason.trim() && (
                                <Text className="text-red-500 text-xs mt-1">
                                    Reason is required for {selectedStatus} status.
                                </Text>
                            )}
                        </View>
                    )}

                    {/* Action buttons */}
                    <View className="flex-row justify-between mt-4">
                        <TouchableOpacity 
                            onPress={handleClose} 
                            className="py-2 px-4 rounded bg-gray-200"
                            disabled={isLoading}
                        >
                            <Text className="text-gray-700 font-medium">Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={handleUpdate}
                            className={`py-2 px-4 rounded ${isUpdateDisabled || isLoading ? "bg-gray-300" : "bg-blue-500"}`}
                            disabled={isUpdateDisabled || isLoading}
                        >
                            <Text className={`font-medium ${isUpdateDisabled || isLoading ? "text-gray-500" : "text-white"}`}>
                                {isLoading ? "Updating..." : "Update"}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    )
}

const AdminProjectProposalView: React.FC<{
    project: ProjectProposal
    onBack: () => void
    onUpdateStatus: () => void
}> = ({ project, onBack, onUpdateStatus }) => {
    const [activeTab, setActiveTab] = useState<"soft" | "supporting">("soft")

    const { data: supportDocs = [] } = useGetSupportDocs(project.gprId || 0, {
        enabled: !!project.gprId,
    })

    const {
        projectTitle = "Untitled Project",
        background = "",
        objectives = [],
        participants = [],
        date = "",
        venue = "",
        budgetItems = [],
        monitoringEvaluation = "",
        signatories = [],
        headerImage = null,
    } = project

    let grandTotal = 0
    if (budgetItems) {
        budgetItems.forEach((item) => {
            if (item.name && item.name.trim()) {
                const amount = Number.parseFloat(item.amount?.toString()) || 0
                const paxCount = item.pax && item.pax.trim() && item.pax.includes("pax") ? Number.parseInt(item.pax) || 1 : 1
                const total = paxCount * amount
                grandTotal += total
            }
        })
    }

    const preparedBy = signatories.filter((s) => s.type === "prepared")
    const approvedBy = signatories.filter((s) => s.type === "approved")

    const renderSoftCopy = () => (
        <ScrollView className="flex-1 bg-white">
            <View className="bg-gray-100 p-4 items-center border-b border-gray-300">
                {headerImage ? (
                    <Image source={{ uri: headerImage }} className="w-full h-16 mb-2" resizeMode="contain" />
                ) : (
                    <View className="w-full h-12 bg-gray-200 rounded mb-2 justify-center items-center">
                        <Text className="text-gray-500 text-xs">📄</Text>
                    </View>
                )}
                <Text className="text-lg font-bold text-center text-gray-900">PROJECT PROPOSAL</Text>
            </View>

            <View className="p-4">
                <View className="mb-4">
                    <Text className="text-sm font-semibold text-gray-700 mb-1">Project Title:</Text>
                    <Text className="text-base text-gray-900">{projectTitle}</Text>
                </View>

                <View className="mb-4">
                    <Text className="text-sm font-semibold text-gray-700 mb-1">Background:</Text>
                    <Text className="text-sm text-gray-800 leading-5">{background || "No background provided"}</Text>
                </View>

                <View className="mb-4">
                    <Text className="text-sm font-semibold text-gray-700 mb-1">Objectives:</Text>
                    {!objectives || objectives.length === 0 || objectives.every((obj) => !obj || !obj.trim()) ? (
                        <Text className="text-sm text-gray-600 italic">No objectives provided</Text>
                    ) : (
                        <View>
                            {objectives
                                .filter((obj) => obj && obj.trim())
                                .map((obj, index) => (
                                    <View key={index} className="flex-row mb-1">
                                        <Text className="text-sm text-gray-800 mr-2">•</Text>
                                        <Text className="text-sm text-gray-800 flex-1">{obj}</Text>
                                    </View>
                                ))}
                        </View>
                    )}
                </View>

                <View className="mb-4">
                    <Text className="text-sm font-semibold text-gray-700 mb-1">Participants:</Text>
                    {!participants ||
                        participants.length === 0 ||
                        participants.every((p) => !p.category || !p.category.trim()) ? (
                        <Text className="text-sm text-gray-600 italic">No participants provided</Text>
                    ) : (
                        <View>
                            {participants
                                .filter((p) => p.category && p.category.trim())
                                .map((participant, index) => (
                                    <Text key={index} className="text-sm text-gray-800 mb-1">
                                        {participant.count || "0"} {participant.category}
                                    </Text>
                                ))}
                        </View>
                    )}
                </View>

                <View className="mb-4">
                    <Text className="text-sm font-semibold text-gray-700 mb-2">Budgetary Requirements:</Text>

                    <View className="flex-row bg-gray-100 border border-gray-300">
                        <View className="flex-1 p-2 border-r border-gray-300">
                            <Text className="text-xs font-semibold text-gray-700">Item</Text>
                        </View>
                        <View className="w-16 p-2 border-r border-gray-300">
                            <Text className="text-xs font-semibold text-gray-700">Pax</Text>
                        </View>
                        <View className="w-20 p-2 border-r border-gray-300">
                            <Text className="text-xs font-semibold text-gray-700">Amount</Text>
                        </View>
                        <View className="w-20 p-2">
                            <Text className="text-xs font-semibold text-gray-700">Total</Text>
                        </View>
                    </View>

                    {!budgetItems || budgetItems.length === 0 || budgetItems.every((item) => !item.name || !item.name.trim()) ? (
                        <View className="flex-row border-l border-r border-b border-gray-300">
                            <View className="flex-1 p-2">
                                <Text className="text-xs text-gray-600 italic">No budget items provided</Text>
                            </View>
                        </View>
                    ) : (
                        budgetItems
                            .filter((item) => item.name && item.name.trim())
                            .map((item, index) => {
                                const amount = Number.parseFloat(item.amount?.toString()) || 0
                                const paxCount =
                                    item.pax && item.pax.trim() && item.pax.includes("pax") ? Number.parseInt(item.pax) || 1 : 1
                                const total = paxCount * amount

                                return (
                                    <View key={index} className="flex-row border-l border-r border-b border-gray-300">
                                        <View className="flex-1 p-2 border-r border-gray-300">
                                            <Text className="text-xs text-gray-800">{item.name}</Text>
                                        </View>
                                        <View className="w-16 p-2 border-r border-gray-300">
                                            <Text className="text-xs text-gray-800">{paxCount}</Text>
                                        </View>
                                        <View className="w-20 p-2 border-r border-gray-300">
                                            <Text className="text-xs text-gray-800">{amount.toFixed(2)}</Text>
                                        </View>
                                        <View className="w-20 p-2">
                                            <Text className="text-xs text-gray-800">{total.toFixed(2)}</Text>
                                        </View>
                                    </View>
                                )
                            })
                    )}

                    <View className="flex-row border-l border-r border-b border-gray-300 bg-gray-50">
                        <View className="flex-1 p-2 border-r border-gray-300">
                            <Text className="text-xs text-gray-800"></Text>
                        </View>
                        <View className="w-16 p-2 border-r border-gray-300">
                            <Text className="text-xs text-gray-800"></Text>
                        </View>
                        <View className="w-20 p-2 border-r border-gray-300">
                            <Text className="text-xs font-semibold text-gray-800">TOTAL</Text>
                        </View>
                        <View className="w-20 p-2">
                            <Text className="text-xs font-semibold text-gray-800">{grandTotal.toFixed(2)}</Text>
                        </View>
                    </View>
                </View>

                <View className="mb-4">
                    <View className="flex-row justify-between">
                        <View className="flex-1 mr-4">
                            <Text className="text-sm font-semibold text-gray-700 mb-2">Prepared by:</Text>
                            {preparedBy.length === 0 ? (
                                <Text className="text-xs text-gray-600 italic">No preparers assigned</Text>
                            ) : (
                                preparedBy.map((sig, index) => (
                                    <View key={index} className="mb-3 items-center">
                                        <Text className="text-sm text-gray-800 text-center mb-1">{sig.name}</Text>
                                        <Text className="text-xs font-semibold text-gray-700 text-center">{sig.position || "N/A"}</Text>
                                    </View>
                                ))
                            )}
                        </View>

                        <View className="flex-1 ml-4">
                            <Text className="text-sm font-semibold text-gray-700 mb-2">Approved by:</Text>
                            {approvedBy.length === 0 ? (
                                <Text className="text-xs text-gray-600 italic">No approvers assigned</Text>
                            ) : (
                                approvedBy.map((sig, index) => (
                                    <View key={index} className="mb-3 items-center">
                                        <Text className="text-sm text-gray-800 text-center mb-1">{sig.name}</Text>
                                        <Text className="text-xs font-semibold text-gray-700 text-center">{sig.position || "N/A"}</Text>
                                    </View>
                                ))
                            )}
                        </View>
                    </View>
                </View>
            </View>
        </ScrollView>
    )

    const renderSupportingDocument = () => (
        <ScrollView className="flex-1 bg-white p-4">
            {supportDocs.length > 0 ? (
                supportDocs.map((doc) => (
                    <View key={doc.psd_id} className="mb-6">
                        {doc.psd_type?.startsWith("image/") && doc.psd_url ? (
                            <Image source={{ uri: doc.psd_url }} className="w-full h-96 rounded-lg" resizeMode="contain" />
                        ) : (
                            <View className="bg-gray-100 rounded-lg p-8 items-center justify-center h-96">
                                <Text className="text-gray-600 text-center mb-2">{doc.psd_name || "Document"}</Text>
                                <Text className="text-gray-500 text-sm">Tap to view document</Text>
                            </View>
                        )}
                    </View>
                ))
            ) : (
                <View className="flex-1 justify-center items-center">
                    <Text className="text-gray-500 text-center">No supporting documents available</Text>
                </View>
            )}
        </ScrollView>
    )

    return (
        <SafeAreaView className="flex-1 bg-white">
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

            <View className="mt-16 flex-row justify-between items-center p-4 border-b border-gray-200">
                <TouchableOpacity onPress={onBack} className="flex-row items-center flex-1">
                    <ArrowLeft color="#374151" size={20} />
                    <Text className="ml-2 text-blue-500 font-medium flex-1" numberOfLines={1}>
                        {project.projectTitle}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity className="ml-2 bg-blue-500 px-4 py-2 rounded-lg" onPress={onUpdateStatus}>
                    <Text className="text-white font-medium text-sm">Update Status</Text>
                </TouchableOpacity>
            </View>

            <View className="flex-row p-4">
                <TouchableOpacity
                    onPress={() => setActiveTab("soft")}
                    className={`flex-1 py-2 px-4 rounded-l-lg border ${activeTab === "soft" ? "bg-gray-800 border-gray-800" : "bg-white border-gray-300"
                        }`}
                >
                    <Text className={`text-center text-sm font-medium ${activeTab === "soft" ? "text-white" : "text-gray-700"}`}>
                        Soft Copy
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => setActiveTab("supporting")}
                    className={`flex-1 py-2 px-4 rounded-r-lg border-t border-r border-b ${activeTab === "supporting" ? "bg-gray-800 border-gray-800" : "bg-white border-gray-300"
                        }`}
                >
                    <Text
                        className={`text-center text-sm font-medium ${activeTab === "supporting" ? "text-white" : "text-gray-700"}`}
                    >
                        Supporting Document
                    </Text>
                </TouchableOpacity>
            </View>

            {activeTab === "soft" ? renderSoftCopy() : renderSupportingDocument()}
        </SafeAreaView>
    )
}

const AdminUpdateStatusContent: React.FC = () => {
    const [refreshing, setRefreshing] = useState(false)
    const [selectedFilter, setSelectedFilter] = useState("All")
    const [showFilterDropdown, setShowFilterDropdown] = useState(false)
    const [selectedProject, setSelectedProject] = useState<ProjectProposal | null>(null)
    const [showStatusModal, setShowStatusModal] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")

    const { data: projects = [], isLoading, refetch, error } = useGetProjectProposals()
    const { data: detailedProject } = useGetProjectProposal(selectedProject?.gprId || 0, {
        enabled: !!selectedProject?.gprId,
    })
    const { mutate: updateStatus, isPending: isUpdatingStatus } = useUpdateProjectProposalStatus()

    const statusColors = {
        pending: "text-blue-600",
        approved: "text-green-500",
        rejected: "text-red-500",
        viewed: "text-gray-600",
    }

    const filteredProjects = projects
        .filter((project: ProjectProposal) => {
            return !project.gprIsArchive
        })
        .filter((project: ProjectProposal) => {
            if (selectedFilter === "All") return true
            return project.status === selectedFilter
        })
        .filter((project: ProjectProposal) => {
            const title = project.projectTitle?.toLowerCase() || ""
            const background = project.background?.toLowerCase() || ""
            const search = searchTerm.toLowerCase()
            return title.includes(search) || background.includes(search)
        })

    const onRefresh = async () => {
        setRefreshing(true)
        await refetch()
        setRefreshing(false)
    }

    const handleProjectPress = (project: ProjectProposal) => {
        setSelectedProject(project)
    }

    const handleBackPress = () => {
        setSelectedProject(null)
    }

    const handleUpdateStatusPress = () => {
        setShowStatusModal(true)
    }
    const router = useRouter()
    const handleStatusUpdate = (status: ProposalStatus, reason: string | null) => {
        if (!selectedProject) return

        updateStatus(
            { gprId: selectedProject.gprId, status, reason },
            {
                onSuccess: () => {
                    setShowStatusModal(false)
                    setSelectedProject((prev) => (prev ? { ...prev, status } : null))
                    refetch()
                },
            },
        )
    }
    
    if (selectedProject) {
        return (
            <>
                <AdminProjectProposalView
                    project={detailedProject || selectedProject}
                    onBack={handleBackPress}
                    onUpdateStatus={handleUpdateStatusPress}
                />
                <StatusUpdateModal
                    visible={showStatusModal}
                    project={selectedProject}
                    onClose={() => setShowStatusModal(false)}
                    onUpdate={handleStatusUpdate}
                    isLoading={isUpdatingStatus}
                />
            </>
        )
    }

    if (isLoading) {
        return (
            <SafeAreaView className="flex-1 bg-white">
                <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#3b82f6" />
                    <Text className="mt-4 text-gray-600">Loading proposals...</Text>
                </View>
            </SafeAreaView>
        )
    }

    if (error) {
        return (
            <SafeAreaView className="flex-1 bg-white">
                <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
                <View className="flex-1 justify-center items-center p-4">
                    <Text className="text-red-500 text-lg font-medium mb-2">Error loading proposals</Text>
                    <Text className="text-gray-600 text-center mb-4">{error.message}</Text>
                    <TouchableOpacity onPress={() => refetch()} className="bg-blue-500 px-6 py-3 rounded-lg">
                        <Text className="text-white font-medium">Retry</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        )
    }
    
    return (
        <ScreenLayout
            customLeftAction={
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft size={30} color="black" className="text-black" />
                </TouchableOpacity>
            }
            headerBetweenAction={<Text className="text-[13px]">Review Project Proposal</Text>}
            showExitButton={false}
            headerAlign="left"
            scrollable={true}
            keyboardAvoiding={true}
            contentPadding="medium"
            loadingMessage='Loading...'
            >
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

            <View className="mt-2 px-4 pt-4 pb-2">
                <View className="relative mb-4">
                    <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                    <TextInput
                        placeholder="Search..."
                        value={searchTerm}
                        onChangeText={setSearchTerm}
                        className="bg-white pl-10 pr-4 py-3 rounded-lg border border-gray-200 text-sm"
                    />
                </View>

                <View className="mb-4">
                    <SelectLayout
                        options={[
                        { label: "All", value: "All" },
                        { label: "Approved", value: "Approved" },
                        { label: "Pending", value: "Pending" },
                        { label: "Rejected", value: "Rejected" },
                        { label: "Viewed", value: "Viewed" }
                        ]}
                        selectedValue={selectedFilter}
                        onSelect={(option) => setSelectedFilter(option.value)}
                        placeholder="Select Status"
                        isInModal={true}
                    />
                </View>
            </View>

            <ScrollView
                className="flex-1 px-4"
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                {filteredProjects.length === 0 ? (
                    <View className="flex-1 justify-center items-center py-12">
                        <Text className="text-gray-500 text-center">No project proposals found.</Text>
                    </View>
                ) : (
                    filteredProjects.map((project) => (
                        <TouchableOpacity
                            key={project.gprId}
                            onPress={() => handleProjectPress(project)}
                            className="bg-white rounded-lg p-4 mb-3 shadow-sm border border-gray-100"
                        >
                            <View className="mb-3">
                                <Text className="text-lg font-semibold text-gray-900">{project.projectTitle || "Untitled"}</Text>
                            </View>

                            <Text className="text-sm text-gray-600 mb-3" numberOfLines={2}>
                                {project.background || "No description available"}
                            </Text>

                            <View className="mb-2">
                                <Text className="text-sm text-gray-600">Date: {project.date || "No date provided"}</Text>
                            </View>

                            <View className="mb-3">
                                <Text
                                    className={`text-sm font-medium ${statusColors[project.status.toLowerCase() as keyof typeof statusColors] || "text-gray-500"
                                        }`}
                                >
                                    {project.status || "Pending"}
                                </Text>
                                {project.statusReason && (
                                    <Text className="text-sm text-gray-600 mt-1">Reason: {project.statusReason}</Text>
                                )}
                            </View>
                        </TouchableOpacity>
                    ))
                )}
            </ScrollView>

            <Modal
                visible={showFilterDropdown}
                transparent
                animationType="fade"
                onRequestClose={() => setShowFilterDropdown(false)}
            >
                <TouchableOpacity
                    className="flex-1 bg-black bg-opacity-50"
                    activeOpacity={1}
                    onPress={() => setShowFilterDropdown(false)}
                >
                    <View className="absolute top-32 left-4 right-4 bg-white rounded-lg shadow-lg border border-gray-200">
                        {["All", "Approved", "Pending", "Rejected", "Viewed"].map((filter) => (
                            <TouchableOpacity
                                key={filter}
                                className={`px-4 py-3 border-b border-gray-100 ${filter === selectedFilter ? "bg-blue-50" : ""}`}
                                onPress={() => {
                                    setSelectedFilter(filter)
                                    setShowFilterDropdown(false)
                                }}
                            >
                                <Text
                                    className={`text-center ${filter === selectedFilter ? "text-blue-600 font-medium" : "text-gray-700"}`}
                                >
                                    {filter}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </TouchableOpacity>
            </Modal>
        </ScreenLayout>
    )
}

const AdminUpdateStatus: React.FC = () => {
    return (
        <QueryProvider>
            <AdminUpdateStatusContent />
        </QueryProvider>
    )
}

export default AdminUpdateStatus