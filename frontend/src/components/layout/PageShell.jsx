export default function PageShell({ title, children, action }) {
  return (
    <div className="max-w-3xl mx-auto px-4 pt-20 pb-28 sm:pb-10">
      {(title || action) && (
        <div className="flex items-center justify-between mb-6">
          {title && (
            <h1 className="font-semibold" style={{ fontSize: 24, color: '#444441', lineHeight: 1.35 }}>
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
