import React, { useCallback, useEffect, useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons';
import Toast from 'react-native-toast-message';
import ScreenContainer from '@/components/global/ScreenContainer';
import AppHeader from '@/components/global/AppHeader';
import SectionLoader from '@/components/global/SectionLoader';
import Empty from '@/components/global/Empty';
import ConfirmationDialog from '@/components/global/ConfirmationDialog';
import Button from '@/components/global/Button';
import { PatientInfoSection, ArchiveInfoCard, MedicalInfoSection } from '@/components/patients';
import { VisitCard } from '@/components/visits';
import {
  AttachmentTile,
  AttachmentUploader,
  AttachmentPreviewModal,
} from '@/components/attachments';
import { Text } from '@/components/UI';
import { useTheme } from '@/theme/ThemeProvider';
import { patientService } from '@/api/services/patientService/patientService';
import { Patient } from '@/api/services/patientService/patientInterface';
import { Attachment } from '@/api/services/attachmentService/attachmentInterface';
import { useVisits } from '@/hooks/useVisits';
import { useAttachments } from '@/hooks/useAttachments';
import { RootStackParamList } from '@/types/navigation';
import { ScreenName } from '@/constants/screenName';

type Props = NativeStackScreenProps<RootStackParamList, ScreenName.PATIENT_DETAILS_SCREEN>;

export default function PatientDetailsScreen({ navigation, route }: Props) {
  // State
  const [patient, setPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showAttachmentUploader, setShowAttachmentUploader] = useState(false);
  const [previewAttachment, setPreviewAttachment] = useState<Attachment | null>(null);

  // Variables
  const { theme } = useTheme();
  const { patientId } = route.params;

  // Hooks
  const {
    visits,
    isLoading: isVisitsLoading,
    hasFetched: hasVisitsFetched,
    refresh: refreshVisits,
  } = useVisits(patientId);

  const {
    attachments,
    isLoading: isAttachmentsLoading,
    hasFetched: hasAttachmentsFetched,
    isUploading,
    uploadProgress,
    refresh: refreshAttachments,
    uploadAttachment,
    deleteAttachment,
  } = useAttachments(patientId);

  // Handlers / Callbacks
  const fetchPatient = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await patientService.getPatientByIdRequest(patientId);
      setPatient(result);
    } catch (_error) {
      Toast.show({ type: 'error', text1: $t('COMMON.SOMETHING_WENT_WRONG') });
    } finally {
      setIsLoading(false);
    }
  }, [patientId]);

  const handleEdit = useCallback(() => {
    navigation.navigate(ScreenName.ADD_EDIT_PATIENT_SCREEN, { patientId });
  }, [navigation, patientId]);

  const handleDeletePress = useCallback(() => {
    setShowDeleteDialog(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    setIsDeleting(true);
    try {
      await patientService.deletePatientRequest(patientId);
      Toast.show({ type: 'success', text1: $t('PATIENTS.DELETED_SUCCESS') });
      navigation.goBack();
    } catch (_error) {
      Toast.show({ type: 'error', text1: $t('COMMON.SOMETHING_WENT_WRONG') });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  }, [patientId, navigation]);

  const handleDeleteCancel = useCallback(() => {
    setShowDeleteDialog(false);
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchPatient(), refreshVisits(), refreshAttachments()]);
    setRefreshing(false);
  }, [fetchPatient, refreshVisits, refreshAttachments]);

  const handleAddAttachment = useCallback(() => {
    setShowAttachmentUploader(true);
  }, []);

  const handleAttachmentUploaderClose = useCallback(() => {
    setShowAttachmentUploader(false);
  }, []);

  const handleAttachmentPress = useCallback((attachment: Attachment) => {
    setPreviewAttachment(attachment);
  }, []);

  const handlePreviewClose = useCallback(() => {
    setPreviewAttachment(null);
  }, []);

  // Effects (useEffect)
  useEffect(() => {
    fetchPatient();
  }, [fetchPatient]);

  // Return UI
  return (
    <ScreenContainer
      safeAreaEdges={['top', 'bottom']}
      scrollable
      padded={false}
      refreshing={refreshing}
      onRefresh={handleRefresh}>
      <AppHeader
        title={patient?.fullName ?? $t('PATIENTS.PATIENT_DETAILS')}
        onBack={() => navigation.goBack()}
        showBack
        rightElement={
          <View className="flex-row items-center gap-2">
            <TouchableOpacity onPress={handleEdit} className="p-2">
              <MaterialDesignIcons name="pencil-outline" size={22} color={theme.primary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDeletePress} className="p-2">
              <MaterialDesignIcons name="delete-outline" size={22} color={theme.error} />
            </TouchableOpacity>
          </View>
        }
      />

      {isLoading && <SectionLoader style="list" />}

      {!isLoading && patient && (
        <>
          <PatientInfoSection patient={patient} />
          <ArchiveInfoCard patient={patient} />
          <MedicalInfoSection patient={patient} />

          {/* Visits section */}
          <View className="mb-4">
            <View className="mx-4 flex-row items-center justify-between mb-3 mt-2">
              <Text className="text-base font-ibm-bold" style={{ color: theme.text }}>
                {$t('PATIENTS.VISITS')}
              </Text>
              <Button
                title={$t('VISITS.ADD_VISIT')}
                variant="outline"
                fullWidth={false}
                style={{ paddingVertical: 6, paddingHorizontal: 14 }}
                onPress={() => navigation.navigate(ScreenName.ADD_EDIT_VISIT_SCREEN, { patientId })}
              />
            </View>

            {isVisitsLoading && !hasVisitsFetched && <SectionLoader style="list" />}

            {hasVisitsFetched && visits.length === 0 && (
              <Empty
                icon={
                  <MaterialDesignIcons
                    name="clipboard-text-outline"
                    size={48}
                    color={theme.border}
                  />
                }
                title={$t('VISITS.NO_VISITS')}
              />
            )}

            {visits.map(visit => (
              <VisitCard
                key={visit.id}
                visit={visit}
                onPress={visitId =>
                  navigation.navigate(ScreenName.VISIT_DETAILS_SCREEN, {
                    visitId,
                    patientId,
                  })
                }
              />
            ))}
          </View>

          {/* Attachments section */}
          <View className="mb-6">
            <View className="mx-4 flex-row items-center justify-between mb-3 mt-2">
              <Text className="text-base font-ibm-bold" style={{ color: theme.text }}>
                {$t('PATIENTS.ATTACHMENTS')}
              </Text>
              <Button
                title={$t('ATTACHMENTS.ADD_ATTACHMENT')}
                variant="outline"
                fullWidth={false}
                style={{ paddingVertical: 6, paddingHorizontal: 14 }}
                onPress={handleAddAttachment}
              />
            </View>

            {isAttachmentsLoading && !hasAttachmentsFetched && <SectionLoader style="list" />}

            {hasAttachmentsFetched && attachments.length === 0 && (
              <Empty
                icon={<MaterialDesignIcons name="folder-outline" size={48} color={theme.border} />}
                title={$t('PATIENTS.NO_ATTACHMENTS')}
              />
            )}

            {attachments.length > 0 && (
              <View className="flex-row flex-wrap mx-2">
                {attachments.map(attachment => (
                  <AttachmentTile
                    key={attachment.id}
                    attachment={attachment}
                    onPress={handleAttachmentPress}
                    onDelete={deleteAttachment}
                  />
                ))}
              </View>
            )}
          </View>
        </>
      )}

      <ConfirmationDialog
        visible={showDeleteDialog}
        type="danger"
        title={$t('GLOBAL.CONFIRM_DELETE')}
        message={$t('PATIENTS.DELETE_CONFIRM') + '\n' + $t('PATIENTS.DELETE_HINT')}
        confirmText={$t('COMMON.DELETE')}
        cancelText={$t('COMMON.CANCEL')}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />

      <AttachmentUploader
        visible={showAttachmentUploader}
        patientId={patientId}
        isUploading={isUploading}
        uploadProgress={uploadProgress}
        onClose={handleAttachmentUploaderClose}
        onUpload={uploadAttachment}
      />

      <AttachmentPreviewModal attachment={previewAttachment} onClose={handlePreviewClose} />
    </ScreenContainer>
  );
}
