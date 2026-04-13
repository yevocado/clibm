export default function PageShell({ title, children, action }) {
  return (
    <div className="max-w-3xl mx-auto px-4 pt-20 pb-28 sm:pb-10">
      {(title || action) && (
        <div className="flex items-center justify-between mb-6">
          {title && (
            <h1 className="font-bold" style={{ fontSize: 24, color: '#1A1A1A' }}>
              {title}
            </h1>
          )}
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  )
}
