const STORAGE_KEY = 'scholaone-user-passwords'

function readStore() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
  } catch {
    return {}
  }
}

function writeStore(store) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
}

function entry(password) {
  return { password, updatedAt: new Date().toISOString() }
}

/** Save password locally when admin creates or resets a user (browser only). */
export function saveUserPassword(userId, password, email) {
  if (!password) return
  const store = readStore()

  if (userId) {
    store[String(userId)] = entry(password)
  }
  if (email) {
    store[`email:${String(email).toLowerCase()}`] = entry(password)
  }

  writeStore(store)
}

export function getUserPassword(userId, email) {
  const store = readStore()
  if (userId && store[String(userId)]?.password) {
    return store[String(userId)].password
  }
  if (email && store[`email:${String(email).toLowerCase()}`]?.password) {
    return store[`email:${String(email).toLowerCase()}`].password
  }
  return null
}

export function removeUserPassword(userId, email) {
  const store = readStore()
  if (userId) delete store[String(userId)]
  if (email) delete store[`email:${String(email).toLowerCase()}`]
  writeStore(store)
}
