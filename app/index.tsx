import { Redirect } from 'expo-router';
import { useAuth } from '~/lib/auth';

export default function IndexRedirect() {
  const { session, isLoading } = useAuth();

  if (isLoading) return null;

  return session 
    ? <Redirect href="/(tabs)/products" /> 
    : <Redirect href="/auth/signin" />;
}
