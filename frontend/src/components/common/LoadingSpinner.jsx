export default function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-primary-50">
      <div className="w-8 h-8 border-4 border-primary-400 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}
