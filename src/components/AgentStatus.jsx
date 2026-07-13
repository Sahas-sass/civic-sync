import React from 'react';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { colors } from '../theme/colors';

export default function AgentStatus({ status }) {
  if (!status) return null;
  return (
    <View style={styles.agentStatusContainer}>
      <ActivityIndicator size="small" color={colors.primaryBlue} />
      <Text style={styles.agentStatusText}>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  agentStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  agentStatusText: {
    marginLeft: 8,
    fontSize: 14,
    color: colors.primaryBlue,
    fontWeight: '500',
  },
});
