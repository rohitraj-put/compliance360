function initials(name = '') {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('') || '?'
}

export default function Avatar({ name, photo, size = 40 }) {
  const style = {
    width: size,
    height: size,
    borderRadius: '50%',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'var(--font-mono)',
    fontWeight: 600,
    fontSize: size * 0.36,
    overflow: 'hidden',
    background: photo ? 'transparent' : 'var(--saffron)',
    color: photo ? undefined : '#2A1B04',
    border: '2px solid rgba(232,150,60,0.4)',
  }
  return (
    <div style={style} title={name}>
      {photo ? (
        <img src={photo} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        initials(name)
      )}
    </div>
  )
}
