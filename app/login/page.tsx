import { LoginForm } from '@/components/auth/LoginForm'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-900 to-slate-800">
      <div className="w-full max-w-md p-8 bg-slate-800 rounded-lg border border-slate-700">
        <h1 className="text-2xl font-bold text-white mb-6 text-center">Welcome to Gym Tracker</h1>
        <LoginForm />
      </div>
    </div>
  )
}
