import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PageLayout from '@/screens/_PageLayout';
import { LoadingState } from '@/components/ui/loading-state';
import { useGetArchivedAnnualDevPlans, useRestoreAnnualDevPlans, useDeleteAnnualDevPlans } from './queries/annualDevPlanQueries';
import { ConfirmationModal } from '@/components/ui/confirmationModal';

const { width } = Dimensions.get("window");

// Custom Checkbox Component
const CustomCheckbox = ({ checked, onPress }: { checked: boolean; onPress: () => void }) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
    <View className={`w-5 h-5 border-2 rounded items-center justify-center ${checked ? 'bg-primaryBlue border-primaryBlue' : 'bg-white border-gray-300'}`}>
      {checked && <Ionicons name="checkmark" size={14} color="white" />}
    </View>
  </TouchableOpacity>
);

interface BudgetItem {
  name: string;
  quantity?: string | number;
  price?: string | number;
}

interface ArchivedPlan {
  dev_id: number;
  dev_date: string;
  dev_client: string;
  dev_issue: string;
  dev_project: string;
  dev_activity?: string;
  dev_indicator: string;
  dev_res_person: string;
  dev_budget_items?: BudgetItem[] | string;
  total?: string;
}

interface ArchivePlanProps {
  onBack: () => void;
}

// Bulk Confirmation Modal Component
const BulkConfirmationModal = ({
  visible,
  onClose,
  onConfirm,
  title,
  description,
  actionLabel,
  variant = "default",
  loading = false,
  loadingMessage,
}: {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  actionLabel: string;
  variant?: "default" | "destructive";
  loading?: boolean;
  loadingMessage?: string;
}) => {
  const [scaleValue] = useState(new Animated.Value(0));
  const [opacityValue] = useState(new Animated.Value(0));

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleValue, {
          toValue: 1,
          useNativeDriver: true,
          tension: 50,
          friction: 200,
        }),
        Animated.timing(opacityValue, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleValue.setValue(0);
      opacityValue.setValue(0);
    }
  }, [visible]);

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose} statusBarTranslucent>
      <Animated.View 
        className="flex-1 bg-black/60 justify-center items-center"
        style={{ opacity: opacityValue }}
      >
        <TouchableOpacity 
          className="flex-1 justify-center items-center px-6" 
          activeOpacity={1} 
          onPress={onClose}
        >
          <Animated.View
            className="bg-white rounded-3xl p-0 shadow-2xl"
            style={[
              {
                transform: [{ scale: scaleValue }],
                width: width - 48,
                maxWidth: 400,
              }
            ]}
          >
            <TouchableOpacity activeOpacity={1}>
              {/* Icon container */}
              <View className="items-center pt-8 pb-4">
                <View 
                  className={`w-16 h-16 rounded-full justify-center items-center ${
                    variant === "destructive" ? "bg-red-50" : "bg-blue-50"
                  }`}
                >
                  <Text 
                    className={`text-3xl font-semibold ${
                      variant === "destructive" ? "text-red-500" : "text-blue-500"
                    }`}
                  >
                    {variant === "destructive" ? "⚠" : "?"}
                  </Text>
                </View>
              </View>

              {/* Content */}
              <View className="px-6 pb-6 items-center">
                <Text className="text-xl font-bold text-gray-900 mb-2 text-center leading-7">
                  {title}
                </Text>
                <Text className="text-base text-gray-500 text-center leading-6">
                  {description}
                </Text>
              </View>

              {/* Actions */}
              <View className="flex-row px-6 pb-6 gap-3">
                <TouchableOpacity 
                  className="flex-1 py-3.5 px-5 rounded-xl bg-gray-50 border border-gray-200 items-center justify-center" 
                  onPress={onClose} 
                  activeOpacity={0.7}
                  disabled={loading}
                >
                  <Text className="text-gray-700 font-semibold text-base">
                    Cancel
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className={`flex-1 py-3.5 px-5 rounded-xl items-center justify-center shadow-sm ${
                    variant === "destructive" ? "bg-red-500" : "bg-primaryBlue"
                  } ${loading ? 'opacity-50' : ''}`}
                  onPress={handleConfirm}
                  activeOpacity={0.8}
                  disabled={loading}
                >
                  <Text className="text-white font-semibold text-base">
                    {loading ? loadingMessage || 'Processing...' : actionLabel}
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </Animated.View>
    </Modal>
  );
};

// Archive content component for use in tabs
export const ArchivePlanContent = () => {
  const [restoringPlanId, setRestoringPlanId] = useState<number | null>(null);
  const [deletingPlanId, setDeletingPlanId] = useState<number | null>(null);
  const [selectedPlans, setSelectedPlans] = useState<number[]>([]);
  const [showBulkRestoreDialog, setShowBulkRestoreDialog] = useState(false);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);

  const { data: archivedData, isLoading } = useGetArchivedAnnualDevPlans(1, 1000);
  const restoreMutation = useRestoreAnnualDevPlans();
  const deleteMutation = useDeleteAnnualDevPlans();

  const archivedPlans = archivedData?.results || [];

  const handleSelectPlan = (devId: number) => {
    setSelectedPlans(prev => 
      prev.includes(devId) 
        ? prev.filter(id => id !== devId)
        : [...prev, devId]
    );
  };

  const handleSelectAll = () => {
    if (selectedPlans.length === archivedPlans.length) {
      setSelectedPlans([]);
    } else {
      setSelectedPlans(archivedPlans.map((plan: any) => plan.dev_id));
    }
  };

  const handleConfirmRestore = async (planId: number) => {
    setRestoringPlanId(planId);
    try {
      await restoreMutation.mutateAsync([planId]);
    } catch (error) {
      console.error('Failed to restore plan:', error);
    } finally {
      setRestoringPlanId(null);
    }
  };

  const handleConfirmDelete = async (planId: number) => {
    setDeletingPlanId(planId);
    try {
      await deleteMutation.mutateAsync([planId]);
    } catch (error) {
      console.error('Failed to delete plan:', error);
    } finally {
      setDeletingPlanId(null);
    }
  };

  const handleBulkRestore = async () => {
    try {
      await restoreMutation.mutateAsync(selectedPlans);
      setSelectedPlans([]);
      setShowBulkRestoreDialog(false);
    } catch (error) {
      console.error('Failed to restore plans:', error);
    }
  };

  const handleBulkDelete = async () => {
    try {
      await deleteMutation.mutateAsync(selectedPlans);
      setSelectedPlans([]);
      setShowBulkDeleteDialog(false);
    } catch (error) {
      console.error('Failed to delete plans:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric',
      day: 'numeric'
    });
  };

  const formatBudget = (plan: ArchivedPlan) => {
    try {
      const budgetItems = Array.isArray(plan.dev_budget_items) ? plan.dev_budget_items : 
        (typeof plan.dev_budget_items === 'string' ? JSON.parse(plan.dev_budget_items || '[]') : []);
      
      if (!budgetItems || budgetItems.length === 0) return plan.total || '0.00';
      
      const total = budgetItems.reduce((sum: number, item: any) => {
        const quantity = Number(item.quantity || 0);
        const price = Number(item.price || 0);
        return sum + (quantity * price);
      }, 0);
      
      return total.toFixed(2);
    } catch {
      return plan.total || '0.00';
    }
  };

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <View className="flex-1">
      {/* Bulk Action Buttons */}
      {selectedPlans.length > 0 && (
        <View className="px-6 pt-4 pb-2 bg-white border-b border-gray-200">
          <View className="flex-row gap-2">
            <TouchableOpacity
              className="flex-1 bg-green-500 py-3 px-4 rounded-lg flex-row items-center justify-center"
              onPress={() => setShowBulkRestoreDialog(true)}
              disabled={restoreMutation.isPending}
            >
              <Ionicons name="refresh" size={18} color="white" />
              <Text className="text-white font-semibold ml-2">
                Restore {selectedPlans.length}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 bg-red-500 py-3 px-4 rounded-lg flex-row items-center justify-center"
              onPress={() => setShowBulkDeleteDialog(true)}
              disabled={deleteMutation.isPending}
            >
              <Ionicons name="trash-outline" size={18} color="white" />
              <Text className="text-white font-semibold ml-2">
                Delete {selectedPlans.length}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Plans List */}
      <View className="flex-1 p-6">
        {archivedPlans.length === 0 ? (
          <View className="flex-1 justify-center items-center py-20">
            <View className="bg-gray-100 rounded-full p-4 mb-4">
              <Ionicons name="archive-outline" size={48} color="#9CA3AF" />
            </View>
            <Text className="text-gray-700 text-lg font-medium mb-2 text-center">
              No archived plans found
            </Text>
            <Text className="text-gray-500 text-sm text-center">
              Archived development plans will appear here
            </Text>
          </View>
        ) : (
          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            {/* Select All Header */}
            <View className="mb-4 pb-2 border-b border-gray-200">
              <TouchableOpacity
                onPress={handleSelectAll}
                className="flex-row items-center"
              >
                <CustomCheckbox
                  checked={selectedPlans.length === archivedPlans.length && archivedPlans.length > 0}
                  onPress={handleSelectAll}
                />
                <Text className="ml-3 text-sm font-medium text-gray-700">
                  Select All ({selectedPlans.length} selected)
                </Text>
              </TouchableOpacity>
            </View>

            <View className="space-y-4">
              {archivedPlans.map((plan: any) => (
                <View key={plan.dev_id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 mb-4">
                  {/* Plan Header */}
                  <View className="flex-row justify-between items-start mb-4">
                    <View className="flex-1 flex-row items-start">
                      <View className="mr-3">
                        <CustomCheckbox
                          checked={selectedPlans.includes(plan.dev_id)}
                          onPress={() => handleSelectPlan(plan.dev_id)}
                        />
                      </View>
                      <View className="flex-1">
                        <Text className="text-lg font-bold text-gray-900 mb-1">
                          {plan.dev_client}
                        </Text>
                        <Text className="text-xs text-gray-500 mb-2">
                          {formatDate(plan.dev_date)}
                        </Text>
                      </View>
                    </View>
                    <View className="flex-row gap-2">
                      {/* Restore Button */}
                      <ConfirmationModal
                        trigger={
                          <TouchableOpacity className="bg-green-50 border border-green-200 p-2 rounded-lg">
                            <Ionicons name="refresh" size={20} color="#16A34A" />
                          </TouchableOpacity>
                        }
                        title="Restore Development Plan"
                        description="Are you sure you want to restore this development plan?"
                        actionLabel="Restore"
                        variant="default"
                        onPress={() => handleConfirmRestore(plan.dev_id)}
                        loading={restoringPlanId === plan.dev_id}
                        loadingMessage="Restoring plan..."
                      />
                      
                      {/* Delete Button */}
                      <ConfirmationModal
                        trigger={
                          <TouchableOpacity className="bg-red-50 border border-red-200 p-2 rounded-lg">
                            <Ionicons name="trash-outline" size={20} color="#EF4444" />
                          </TouchableOpacity>
                        }
                        title="Delete Development Plan"
                        description="Are you sure you want to permanently delete this development plan? This action cannot be undone."
                        actionLabel="Delete"
                        variant="destructive"
                        onPress={() => handleConfirmDelete(plan.dev_id)}
                        loading={deletingPlanId === plan.dev_id}
                        loadingMessage="Deleting plan..."
                      />
                    </View>
                  </View>

                  {/* Plan Details */}
                  <View className="bg-gray-50 p-3 rounded-lg mb-3">
                    <Text className="text-xs font-semibold text-gray-600 mb-1">GAD Mandate</Text>
                    <Text className="text-sm text-gray-800 mb-3">{plan.dev_issue}</Text>
                    
                    <Text className="text-xs font-semibold text-gray-600 mb-1">Program/Project</Text>
                    <Text className="text-sm text-gray-800 mb-3">
                      {(() => {
                        try {
                          if (typeof plan.dev_project === 'string' && plan.dev_project.startsWith('[')) {
                            const parsed = JSON.parse(plan.dev_project);
                            return Array.isArray(parsed) ? parsed[0] : plan.dev_project;
                          }
                          return plan.dev_project;
                        } catch {
                          return plan.dev_project;
                        }
                      })()}
                    </Text>

                    <Text className="text-xs font-semibold text-gray-600 mb-1">Responsible Person</Text>
                    <Text className="text-sm text-gray-800 mb-3">{plan.dev_res_person}</Text>

                    <View className="flex-row justify-between items-center">
                      <Text className="text-xs font-semibold text-gray-600">Total Budget</Text>
                      <Text className="text-sm font-bold text-green-600">₱{formatBudget(plan)}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>
        )}
      </View>

      {/* Bulk Restore Confirmation Dialog */}
      <BulkConfirmationModal
        visible={showBulkRestoreDialog}
        onClose={() => setShowBulkRestoreDialog(false)}
        onConfirm={handleBulkRestore}
        title="Restore Development Plans"
        description={`Are you sure you want to restore ${selectedPlans.length} development plan(s)?`}
        actionLabel="Restore All"
        variant="default"
        loading={restoreMutation.isPending}
        loadingMessage="Restoring plans..."
      />

      {/* Bulk Delete Confirmation Dialog */}
      <BulkConfirmationModal
        visible={showBulkDeleteDialog}
        onClose={() => setShowBulkDeleteDialog(false)}
        onConfirm={handleBulkDelete}
        title="Delete Development Plans"
        description={`Are you sure you want to permanently delete ${selectedPlans.length} development plan(s)? This action cannot be undone.`}
        actionLabel="Delete All"
        variant="destructive"
        loading={deleteMutation.isPending}
        loadingMessage="Deleting plans..."
      />
    </View>
  );
};

// Full page ArchivePlan component for standalone use
const ArchivePlan = ({ onBack }: ArchivePlanProps) => {
  return (
    <PageLayout
      leftAction={
        <TouchableOpacity 
          onPress={onBack} 
          className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
        >
          <Ionicons name="chevron-back" size={20} color="#374151" />
        </TouchableOpacity>
      }
      headerTitle={<Text className="text-[13px]">Archived Plans</Text>}
      rightAction={<View className="w-10 h-10" />}
    >
      <ArchivePlanContent />
    </PageLayout>
  );
};

export default ArchivePlan;

