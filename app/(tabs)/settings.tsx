"use client"

import type React from "react"

import { View, ScrollView, Pressable, Alert } from "react-native"
import { useState } from "react"
import { router } from "expo-router"
import { LinearGradient } from "expo-linear-gradient"
import {
  User,
  Bell,
  Shield,
  HelpCircle,
  LogOut,
  ChevronRight,
  Moon,
  Sun,
  Database,
  CreditCard,
  ArrowLeft,
} from "lucide-react-native"
import { Text } from "~/components/nativewindui/Text"
import { useColorScheme } from "~/lib/useColorScheme"
import { useAuth } from "~/lib/auth"

interface SettingsItemProps {
  icon: React.ReactNode
  title: string
  subtitle?: string
  onPress: () => void
  showChevron?: boolean
  destructive?: boolean
}

function SettingsItem({ icon, title, subtitle, onPress, showChevron = true, destructive = false }: SettingsItemProps) {
  return (
    <Pressable onPress={onPress} className="flex-row items-center justify-between bg-white p-4 active:bg-gray-50">
      <View className="flex-row items-center space-x-3">
        <View className="rounded-full bg-gray-100 p-2">{icon}</View>
        <View className="flex-1">
          <Text className={`font-medium ${destructive ? "text-red-600" : "text-gray-900"}`}>{title}</Text>
          {subtitle && <Text className="text-sm text-gray-500">{subtitle}</Text>}
        </View>
      </View>
      {showChevron && <ChevronRight size={20} color="#9ca3af" />}
    </Pressable>
  )
}

function SettingsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View className="mb-6">
      <Text className="mb-3 px-4 text-sm font-medium text-gray-500 uppercase tracking-wide">{title}</Text>
      <View className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">{children}</View>
    </View>
  )
}

export default function SettingsScreen() {
  const { colorScheme, toggleColorScheme } = useColorScheme()
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const { signOut } = useAuth()
  const handleLogout = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          try {
            await signOut()
          } catch (error) {
            console.error("Logout error:", error)
            Alert.alert("Error", "Failed to sign out. Please try again.")
          }
        },
      },
    ])
  }

  const handleDataExport = () => {
    Alert.alert("Export Data", "Your data will be exported as a CSV file.", [
      { text: "Cancel", style: "cancel" },
      { text: "Export", onPress: () => console.log("Exporting data...") },
    ])
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <LinearGradient
        colors={["#8B5CF6", "#A855F7", "#C084FC"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="px-6 pb-8 pt-16"
      >
       <View className="mb-4 flex-row items-center justify-between">
          <Pressable onPress={() => router.back()} className="rounded-full bg-white/20 p-2">
            <ArrowLeft size={20} color="white" />
          </Pressable>
          <View className="flex-1" />
          <View className="w-10" />
        </View>

        <View className="items-center">
          <View className="mb-4 rounded-full bg-white/20 p-4">
            <User size={32} color="white" />
          </View>
          <Text className="text-xl font-bold text-white">Settings</Text>
          <Text className="text-sm text-purple-100">Manage your account and preferences</Text>
        </View>
      </LinearGradient>

      {/* Content */}
      <ScrollView className="-mt-4 flex-1" showsVerticalScrollIndicator={false}>
        <View className="min-h-full rounded-t-3xl bg-gray-50 p-6">
          {/* Account Section */}
          <SettingsSection title="Account">
            <SettingsItem
              icon={<User size={20} color="#6b7280" />}
              title="Profile"
              subtitle="Edit your personal information"
              onPress={() => router.push("/profile")}
            />
            <View className="h-px bg-gray-200" />
            <SettingsItem
              icon={<Bell size={20} color="#6b7280" />}
              title="Notifications"
              subtitle={notificationsEnabled ? "Enabled" : "Disabled"}
              onPress={() => setNotificationsEnabled(!notificationsEnabled)}
            />
            <View className="h-px bg-gray-200" />
            <SettingsItem
              icon={<Shield size={20} color="#6b7280" />}
              title="Privacy & Security"
              subtitle="Manage your privacy settings"
              onPress={() => console.log("Privacy settings")}
            />
          </SettingsSection>

          {/* Business Section */}
          <SettingsSection title="Business">
            <SettingsItem
              icon={<CreditCard size={20} color="#6b7280" />}
              title="Payment Methods"
              subtitle="Manage payment options"
              onPress={() => console.log("Payment methods")}
            />
            <View className="h-px bg-gray-200" />
            <SettingsItem
              icon={<Database size={20} color="#6b7280" />}
              title="Export Data"
              subtitle="Download your business data"
              onPress={handleDataExport}
            />
          </SettingsSection>

          {/* Preferences Section */}
          <SettingsSection title="Preferences">
            <SettingsItem
              icon={colorScheme === "dark" ? <Moon size={20} color="#6b7280" /> : <Sun size={20} color="#6b7280" />}
              title="Theme"
              subtitle={colorScheme === "dark" ? "Dark mode" : "Light mode"}
              onPress={toggleColorScheme}
            />
          </SettingsSection>

          {/* Support Section */}
          <SettingsSection title="Support">
            <SettingsItem
              icon={<HelpCircle size={20} color="#6b7280" />}
              title="Help & Support"
              subtitle="Get help and contact support"
              onPress={() => console.log("Help & Support")}
            />
          </SettingsSection>

          {/* Sign Out */}
          <SettingsSection title="Account Actions">
            <SettingsItem
              icon={<LogOut size={20} color="#dc2626" />}
              title="Sign Out"
              onPress={handleLogout}
              showChevron={false}
              destructive={true}
            />
          </SettingsSection>
        </View>
      </ScrollView>
    </View>
  )
}
