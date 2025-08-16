import React from 'react';
import { Pressable, Text, View, PressableProps } from 'react-native';
import { cn } from '~/lib/cn';

interface ButtonProps extends PressableProps {
  variant?: 'black' | 'primary' | 'secondary' | 'danger';
  className?: string;
  children: React.ReactNode;
}

export function Button({ variant = 'primary', className, children, ...props }: ButtonProps) {
  const baseStyles =
    'flex-row items-center justify-center rounded-lg px-4 py-2 active:opacity-80';
  
  const variantStyles =
    variant === 'black'
      ? 'bg-black'
      : variant === 'primary'
      ? 'bg-violet-600'
      : variant === 'secondary'
      ? 'bg-gray-200'
      : variant === 'danger'
      ? 'bg-red-600'
      : '';

  const textColor =
    variant === 'secondary' ? 'text-gray-900' : 'text-white';

  return (
    <Pressable className={cn(baseStyles, variantStyles, className)} {...props}>
      <View className="flex-row items-center space-x-2">
        {React.Children.map(children, (child) => {
          if (typeof child === 'string') {
            return <Text className={cn('font-medium', textColor)}>{child}</Text>;
          }
          return child;
        })}
      </View>
    </Pressable>
  );
}
