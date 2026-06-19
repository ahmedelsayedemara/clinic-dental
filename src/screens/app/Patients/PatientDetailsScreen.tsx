import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons';
import Toast from 'react-native-toast-message';
import ScreenContainer from '@/components/global/ScreenContainer';
import AppHeader from '@/components/global/AppHeader';
import SectionLoader from '@/components/global/SectionLoader';
import ConfirmationDialog from '@/components/global/ConfirmationDialog';
import DetailHeaderActions from '@/components/global/DetailHeaderActions';
import DetailListSection from '@/components/global/DetailListSection';
import { PatientInfoSection, ArchiveInfoCard, MedicalInfoSection } from '@/components/patients';
import { VisitCard } from '@/components/visits';
import {
  AttachmentTile,
  AttachmentUploader,
  AttachmentPreviewModal,
} from '@/components/attachments';
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
  const [showAttachmentUploader, setShowAttachmentUploader] = useState(false);
  const [previewAttachment, setPreviewAttachment] = useState<Attachment | null>(null);

  // Variables
  const { theme } = useTheme();
  const { patientId } = route.params;
  const isFirstFocus = useRef(true);

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

  const handleDeleteConfirm = useCallback(async () => {
    try {
      await patientService.deletePatientRequest(patientId);
      Toast.show({ type: 'success', text1: $t('PATIENTS.DELETED_SUCCESS') });
      navigation.goBack();
    } catch (_error) {
      Toast.show({ type: 'error', text1: $t('COMMON.SOMETHING_WENT_WRONG') });
    } finally {
      setShowDeleteDialog(false);
    }
  }, [patientId, navigation]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchPatient(), refreshVisits(), refreshAttachments()]);
    setRefreshing(false);
  }, [fetchPatient, refreshVisits, refreshAttachments]);

  // Effects (useEffect)
  useEffect(() => {
    fetchPatient();
  }, [fetchPatient]);

  // Refresh the visits list whenever the screen regains focus (e.g. returning
  // from Add/Edit Visit or Visit Details). Skip the first focus since useVisits
  // loads on mount.
  useFocusEffect(
    useCallback(() => {
      if (isFirstFocus.current) {
        isFirstFocus.current = false;
        return;
      }
      refreshVisits();
    }, [refreshVisits]),
  );

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
          <DetailHeaderActions onEdit={handleEdit} onDelete={() => setShowDeleteDialog(true)} />
        }
      />

      {isLoading && <SectionLoader style="list" />}

      {!isLoading && patient && (
        <>
          <PatientInfoSection patient={patient} />
          <ArchiveInfoCard patient={patient} />
          <MedicalInfoSection patient={patient} />

          {/* Visits section */}
          <DetailListSection
            title={$t('PATIENTS.VISITS')}
            addLabel={$t('VISITS.ADD_VISIT')}
            onAdd={() => navigation.navigate(ScreenName.ADD_EDIT_VISIT_SCREEN, { patientId })}
            isLoading={isVisitsLoading && !hasVisitsFetched}
            isEmpty={hasVisitsFetched && visits.length === 0}
            emptyIcon={
              <MaterialDesignIcons name="clipboard-text-outline" size={48} color={theme.border} />
            }
            emptyTitle={$t('VISITS.NO_VISITS')}>
            {visits.map(visit => (
              <VisitCard
                key={visit.id}
                visit={visit}
                onPress={vid =>
                  navigation.navigate(ScreenName.VISIT_DETAILS_SCREEN, { visitId: vid, patientId })
                }
              />
            ))}
          </DetailListSection>

          {/* Attachments section */}
          {/* <DetailListSection
            className="mb-6"
            title={$t('PATIENTS.ATTACHMENTS')}
            addLabel={$t('ATTACHMENTS.ADD_ATTACHMENT')}
            onAdd={() => setShowAttachmentUploader(true)}
            isLoading={isAttachmentsLoading && !hasAttachmentsFetched}
            isEmpty={hasAttachmentsFetched && attachments.length === 0}
            emptyIcon={<MaterialDesignIcons name="folder-outline" size={48} color={theme.border} />}
            emptyTitle={$t('PATIENTS.NO_ATTACHMENTS')}>
            <View className="flex-row flex-wrap mx-2">
              {attachments.map(attachment => (
                <AttachmentTile
                  key={attachment.id}
                  attachment={attachment}
                  onPress={setPreviewAttachment}
                  onDelete={deleteAttachment}
                />
              ))}
            </View>
          </DetailListSection> */}
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
        onCancel={() => setShowDeleteDialog(false)}
      />

      <AttachmentUploader
        visible={showAttachmentUploader}
        patientId={patientId}
        isUploading={isUploading}
        uploadProgress={uploadProgress}
        onClose={() => setShowAttachmentUploader(false)}
        onUpload={uploadAttachment}
      />

      <AttachmentPreviewModal
        attachment={previewAttachment}
        onClose={() => setPreviewAttachment(null)}
      />
    </ScreenContainer>
  );
}
