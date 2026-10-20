import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft, Search as SearchIcon, X } from 'lucide-react-native';

import { useTaskStore } from '@/stores/useTaskStore';
import { useProjectStore } from '@/stores/useProjectStore';
import { useTheme } from '@/theme/ThemeContext';
import { TaskItem } from '@/components/TaskItem';
import { ProjectCard } from '@/components/ProjectCard';
import { EmptyState } from '@/components/common/EmptyState';

const POPULAR_SEARCHES = ['Launch', 'Review', 'Doctor', 'Budget', 'Mom', 'Sprint'];

export default function SearchScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  const { tasks, toggleTaskComplete } = useTaskStore();
  const { projects } = useProjectStore();

  const [query, setQuery] = useState('');

  const trimmedQuery = query.trim().toLowerCase();

  const matchedTasks = trimmedQuery
    ? tasks.filter(
        (t) =>
          t.title.toLowerCase().includes(trimmedQuery) ||
          (t.description && t.description.toLowerCase().includes(trimmedQuery))
      )
    : [];

  const matchedProjects = trimmedQuery
    ? projects.filter(
        (p) =>
          p.name.toLowerCase().includes(trimmedQuery) ||
          (p.description && p.description.toLowerCase().includes(trimmedQuery))
      )
    : [];

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={{ backgroundColor: colors.background, flex: 1 }}
    >
      {/* 1. Search Bar Header */}
      <View
        style={{
          backgroundColor: colors.surface,
          borderBottomColor: colors.border,
          borderBottomWidth: 1,
          paddingHorizontal: 16,
          paddingVertical: 12,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <Pressable
          hitSlop={10}
          onPress={() => router.back()}
          style={({ pressed }) => ({
            width: 36,
            height: 36,
            borderRadius: 18,
            alignItems: 'center',
            justifyContent: 'center',
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <ChevronLeft size={24} color={colors.textPrimary} strokeWidth={2.2} />
        </Pressable>

        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.surfaceElevated,
            borderColor: colors.border,
            borderWidth: 1,
            borderRadius: 12,
            paddingHorizontal: 12,
            paddingVertical: 8,
          }}
        >
          <SearchIcon size={16} color={colors.textMuted} strokeWidth={2} />
          <TextInput
            placeholder="Search tasks, notes, projects..."
            placeholderTextColor={colors.textMuted}
            value={query}
            onChangeText={setQuery}
            autoFocus
            style={{
              flex: 1,
              marginLeft: 8,
              fontSize: 14,
              color: colors.textPrimary,
              padding: 0,
            }}
          />
          {query ? (
            <Pressable onPress={() => setQuery('')} hitSlop={8}>
              <X size={15} color={colors.textMuted} strokeWidth={2} />
            </Pressable>
          ) : null}
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 60 }}
      >
        {/* Suggestion Chips */}
        {!trimmedQuery && (
          <View style={{ marginBottom: 24 }}>
            <Text
              style={{
                color: colors.textSecondary,
                fontSize: 11,
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: 0.8,
                marginBottom: 10,
              }}
            >
              Popular Searches
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {POPULAR_SEARCHES.map((chip) => (
                <Pressable
                  key={chip}
                  onPress={() => setQuery(chip)}
                  style={({ pressed }) => ({
                    paddingHorizontal: 14,
                    paddingVertical: 7,
                    borderRadius: 20,
                    borderWidth: 1,
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    opacity: pressed ? 0.75 : 1,
                  })}
                >
                  <Text
                    style={{
                      color: colors.textPrimary,
                      fontSize: 12,
                      fontWeight: '600',
                    }}
                  >
                    {chip}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {/* Matched Projects */}
        {matchedProjects.length > 0 && (
          <View className="mb-6">
            <Text
              style={{ color: colors.textPrimary }}
              className="text-sm font-bold uppercase tracking-wider mb-2.5"
            >
              Projects ({matchedProjects.length})
            </Text>
            {matchedProjects.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </View>
        )}

        {/* Matched Tasks */}
        {matchedTasks.length > 0 && (
          <View className="mb-6">
            <Text
              style={{ color: colors.textPrimary }}
              className="text-sm font-bold uppercase tracking-wider mb-2.5"
            >
              Tasks ({matchedTasks.length})
            </Text>
            {matchedTasks.map((t) => (
              <TaskItem
                key={t.id}
                task={t}
                onToggleComplete={toggleTaskComplete}
              />
            ))}
          </View>
        )}

        {/* No results */}
        {trimmedQuery &&
          matchedTasks.length === 0 &&
          matchedProjects.length === 0 && (
            <EmptyState
              icon={<SearchIcon size={26} color={colors.textMuted} />}
              title="No results found"
              description={`We couldn't find any tasks or projects matching "${query}".`}
            />
          )}
      </ScrollView>
    </SafeAreaView>
  );
}
