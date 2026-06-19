// Web tabs
import {
  Tabs,
  TabList,
  TabTrigger,
  TabSlot,
  type TabTriggerSlotProps,
  type TabListProps,
} from 'expo-router/ui';
import { Pressable, View, StyleSheet } from 'react-native';

import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';
import { useT } from '@/lib/i18n-context';
import { Spacing } from '@/constants/theme';

export default function AppTabs() {
  const t = useT();

  return (
    <Tabs>
      <TabSlot style={{ height: '100%' }} />
      <TabList asChild>
        <CustomTabList>
          <TabTrigger name="index" href="/" asChild>
            <TabButton label={t('org.title')} />
          </TabTrigger>
          <TabTrigger name="form" href="/form" asChild>
            <TabButton label={t('form.title')} />
          </TabTrigger>
          <TabTrigger name="profile" href="/profile" asChild>
            <TabButton label={t('profile.title')} />
          </TabTrigger>
        </CustomTabList>
      </TabList>
    </Tabs>
  );
}

function TabButton({ label, isFocused, ...props }: TabTriggerSlotProps & { label: string }) {
  return (
    <Pressable {...props} style={({ pressed }) => pressed && styles.pressed}>
      <ThemedView
        type={isFocused ? 'backgroundSelected' : 'backgroundElement'}
        style={styles.tabButtonView}>
        <ThemedText type="small" themeColor={isFocused ? 'text' : 'textSecondary'}>
          {label}
        </ThemedText>
      </ThemedView>
    </Pressable>
  );
}

function CustomTabList(props: TabListProps) {
  return (
    <View {...props} style={styles.tabListContainer}>
      <ThemedView type="backgroundElement" style={styles.innerContainer}>
        {props.children}
      </ThemedView>
    </View>
  );
}

const styles = StyleSheet.create({
  tabListContainer: {
    position: 'absolute',
    width: '100%',
    bottom: Spacing.lg,
    paddingHorizontal: Spacing.three,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  innerContainer: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.lg,
    borderRadius: Spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  pressed: { opacity: 0.7 },
  tabButtonView: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: Spacing.lg,
  },
});
