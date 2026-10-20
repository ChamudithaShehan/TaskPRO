import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Folder, Calendar } from 'lucide-react-native';
import { Project } from '@/types';
import { useTheme } from '@/theme/ThemeContext';
import { ProgressBar } from './common/ProgressBar';

interface ProjectCardProps {
  project: Project;
  onPress?: (project: Project) => void;
}

export function ProjectCard({ project, onPress }: ProjectCardProps) {
  const router = useRouter();
  const { colors } = useTheme();

  const total = project.total_tasks || 0;
  const completed = project.completed_tasks || 0;
  const progress = total > 0 ? completed / total : 0;

  const handlePress = () => {
    if (onPress) {
      onPress(project);
    } else {
      router.push(`/project/${project.id}` as any);
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => ({
        backgroundColor: colors.surface,
        borderColor: colors.border,
        borderWidth: 1,
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        opacity: pressed ? 0.9 : 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 2,
        elevation: 1,
      })}
      accessibilityRole="button"
      accessibilityLabel={`Project ${project.name}, ${completed} of ${total} tasks completed`}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 12,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1, marginRight: 8 }}>
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: `${project.color}20`,
            }}
          >
            <Folder size={20} color={project.color} strokeWidth={2.2} />
          </View>
          <View style={{ flex: 1 }}>
            <Text
              numberOfLines={1}
              style={{
                color: colors.textPrimary,
                fontSize: 15,
                fontWeight: '700',
              }}
            >
              {project.name}
            </Text>
            {project.description ? (
              <Text
                numberOfLines={1}
                style={{
                  color: colors.textSecondary,
                  fontSize: 12,
                  marginTop: 2,
                }}
              >
                {project.description}
              </Text>
            ) : null}
          </View>
        </View>

        {project.due_date ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Calendar size={12} color={colors.textMuted} strokeWidth={2} />
            <Text
              style={{
                color: colors.textMuted,
                fontSize: 11,
                fontWeight: '500',
              }}
            >
              {project.due_date}
            </Text>
          </View>
        ) : null}
      </View>

      <View style={{ marginTop: 2 }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 6,
          }}
        >
          <Text
            style={{
              color: colors.textSecondary,
              fontSize: 11,
              fontWeight: '500',
            }}
          >
            {completed} of {total} {total === 1 ? 'task' : 'tasks'}
          </Text>
          <Text
            style={{
              color: colors.textPrimary,
              fontSize: 11,
              fontWeight: '700',
            }}
          >
            {Math.round(progress * 100)}%
          </Text>
        </View>
        <ProgressBar progress={progress} color={project.color} height={6} />
      </View>
    </Pressable>
  );
}
