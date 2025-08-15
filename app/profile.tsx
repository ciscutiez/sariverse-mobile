"use client"

import { View, ScrollView, TextInput, Alert, ActivityIndicator, Pressable } from "react-native"
import { useState, useEffect } from "react"
import { LinearGradient } from "expo-linear-gradient"
import { User, Mail, Store, Save, Edit3, ArrowLeft } from "lucide-react-native"
import { Text } from "~/components/nativewindui/Text"
import { Button } from "~/components/nativewindui/Button"
import { useGetProfiles, useUpdateProfile } from "~/hooks/profile" 
import { Profile } from "~/types/database"

import { router } from "expo-router"

export default function ProfileScreen() {
  const { data: profileData, isLoading, error } = useGetProfiles()
  const updateProfile = useUpdateProfile()

  const [isEditing, setIsEditing] = useState(false)
  const [editedData, setEditedData] = useState<Profile | null>(null)

  // Sync local edit state when profileData changes
  useEffect(() => {
    if (profileData) {
      setEditedData(profileData)
    }
  }, [profileData])

  const handleSave = async () => {
    if (!editedData?.id) return
    try {
      await updateProfile.mutateAsync({
        id: editedData.id,
        first_name: editedData.first_name,
        last_name: editedData.last_name,
        email: editedData.email,
        store_name: editedData.store_name,
        role: editedData.role
      })
      setIsEditing(false)
      Alert.alert("Success", "Profile updated successfully!")
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to update profile.")
    }
  }

  const handleCancel = () => {
    setEditedData(profileData || null)
    setIsEditing(false)
  }

  const InputField = ({
    label,
    value,
    onChangeText,
    placeholder,
    icon: Icon,
    editable = true
  }: {
    label: string
    value: string
    onChangeText: (text: string) => void
    placeholder: string
    icon: any
    editable?: boolean
  }) => (
    <View className="gap-2">
      <View className="flex-row items-center gap-2">
        <Icon size={16} color="#6b7280" />
        <Text className="text-sm font-medium text-gray-700">{label}</Text>
      </View>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        editable={isEditing && editable}
        className={`rounded-xl border px-4 py-3 text-base ${
          isEditing && editable
            ? "border-purple-200 bg-white text-gray-900"
            : "border-gray-200 bg-gray-50 text-gray-600"
        }`}
        placeholderTextColor="#9ca3af"
      />
    </View>
  )

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#8B5CF6" />
      </View>
    )
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center p-4">
        <Text className="text-red-500">Failed to load profile</Text>
      </View>
    )
  }

  if (!editedData) return null

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
        <View className="mb-6 flex-row items-center justify-between">
          
          <View>
            <Text className="text-2xl font-bold text-white">Profile</Text>
            <Text className="text-sm text-purple-100">Manage your information</Text>
          </View>
          <View className="rounded-full bg-white/20 p-3">
            <User size={24} color="white" />
          </View>
        </View>

        {/* Profile Summary Card */}
        <View className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
          <View className="flex-row items-center gap-4">
            <View className="h-16 w-16 items-center justify-center rounded-full bg-white/20">
              <User size={24} color="white" />
            </View>
            <View className="flex-1">
              <Text className="text-lg font-bold text-white">
                {profileData?.first_name} {profileData?.last_name}
              </Text>
            
              <Text className="text-xs text-purple-200">Store Name: {profileData?.store_name}</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      {/* Body */}
      <ScrollView className="-mt-4 flex-1">
        <View className="min-h-full rounded-t-3xl bg-white">
          <View className="gap-6 p-6">
            {/* Action Buttons */}
            <View className="flex-row items-center justify-between py-4">
              <View>
                <Text className="text-xl font-bold text-gray-900">Personal Information</Text>
                <Text className="text-sm text-gray-500">Keep your details up to date</Text>
              </View>

              {!isEditing ? (
                <Button variant="black" onPress={() => setIsEditing(true)} className="flex-row items-center gap-2">
                  <Edit3 size={16} color="white" />
                  <Text className="font-semibold text-white">Edit</Text>
                </Button>
              ) : (
                <View className="flex-col-reverse gap-2">
                  <Button variant="danger" onPress={handleCancel} className="px-4 py-2 bg-transparent">
                    <Text className="text-sm font-medium text-gray-700">Cancel</Text>
                  </Button>
                  <Button
                    variant="black"
                    onPress={handleSave}
                    disabled={updateProfile.isPending}
                    className="flex-row items-center gap-2 px-4 py-2"
                  >
                    {updateProfile.isPending ? (
                      <View className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                      <Save size={16} color="white" />
                    )}
                    <Text className="text-sm font-semibold text-white">
                      {updateProfile.isPending ? "Saving..." : "Save"}
                    </Text>
                  </Button>
                </View>
              )}
            </View>

            {/* Personal Information Section */}
            <View className="gap-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <InputField
                label="First Name"
               value={editedData.first_name ?? ""}
                onChangeText={(text) => setEditedData({ ...editedData, first_name: text })}
                placeholder="Enter your first name"
                icon={User}
              />
              <InputField
                label="Last Name"
                value={editedData.last_name ?? ""}
                onChangeText={(text) => setEditedData({ ...editedData, last_name: text })}
                placeholder="Enter your last name"
                icon={User}
              />
              <InputField
                label="Email Address"
                value={editedData.email}
                onChangeText={(text) => setEditedData({ ...editedData, email: text })}
                placeholder="Enter your email"
                icon={Mail}
              />
            </View>

            {/* Business Information Section */}
            <View className="gap-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <InputField
                label="Store Name"
                value={editedData.store_name ?? ""}
                onChangeText={(text) => setEditedData({ ...editedData, store_name: text })}
                placeholder="Enter your store name"
                icon={Store}
              />
             
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  )
}
