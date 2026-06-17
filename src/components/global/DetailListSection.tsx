import React from 'react';
import { View } from 'react-native';
import SectionLoader from '@/components/global/SectionLoader';
import Empty from '@/components/global/Empty';
import SectionHeader from '@/components/global/SectionHeader';
import Button from '@/components/global/Button';

interface DetailListSectionProps {
  title: string;
  addLabel: string;
  onAdd: () => void;
  isLoading: boolean;
  isEmpty: boolean;
  emptyIcon: React.ReactNode;
  emptyTitle: string;
  className?: string;
  /** The list content, rendered when not loading and not empty. */
  children: React.ReactNode;
}

/**
 * A detail-screen sub-section: a titled header with an "add" button, then a
 * loader / empty state / the list content depending on state.
 */
export default function DetailListSection({
  title,
  addLabel,
  onAdd,
  isLoading,
  isEmpty,
  emptyIcon,
  emptyTitle,
  className,
  children,
}: DetailListSectionProps) {
  return (
    <View className={className ?? 'mb-4'}>
      <View className="mx-4 flex-row items-center justify-between mb-3 mt-2">
        <SectionHeader title={title} className="text-base font-ibm-bold" />
        <Button
          title={addLabel}
          variant="outline"
          fullWidth={false}
          style={{ paddingVertical: 6, paddingHorizontal: 14 }}
          onPress={onAdd}
        />
      </View>

      {isLoading && <SectionLoader style="list" />}
      {!isLoading && isEmpty && <Empty icon={emptyIcon} title={emptyTitle} />}
      {!isLoading && !isEmpty && children}
    </View>
  );
}
