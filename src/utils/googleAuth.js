/* eslint-disable no-undef */

const TGG_VIEWER_CLIENT_ID = '61200892608-qphtf65o323setqdcfj4hnf601mmetvs.apps.googleusercontent.com'

export const initGoogleClient = () => new Promise((resolve) => {
  if (typeof gapi === 'undefined') {
    return
  }
  // init all gapi modules
  gapi.load('client:auth2', () => {
    gapi.client.load('storage', 'v1', () => {
      gapi.client.init({
        clientId: TGG_VIEWER_CLIENT_ID,
        scope: 'https://www.googleapis.com/auth/devstorage.read_only',
        discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/storage/v1/rest'],
      })
      resolve()
    })
  })
})

export const isSignedIn = async () => {
  const authInstance = await gapi.auth2.getAuthInstance()
  return authInstance.isSignedIn.get()
}

export const googleSignIn = async () => {
  const authInstance = await gapi.auth2.getAuthInstance()
  if (!authInstance.isSignedIn.get()) {
    await authInstance.signIn()
  }
}

export const getGoogleUserEmail = async () => {
  const authInstance = await gapi.auth2.getAuthInstance()
  const user = authInstance && authInstance.currentUser && authInstance.currentUser.get()
  const profile = user && user.getBasicProfile()
  return profile && profile.getEmail()
}

export const getGoogleAccessToken = async () => {
  // use OAuth2 to get an access token for RNA-seq viewer to access the google storage API on behalf of the user
  const authInstance = await gapi.auth2.getAuthInstance()
  const user = authInstance && authInstance.currentUser && authInstance.currentUser.get()
  if (!authInstance.isSignedIn.get()) {
    user.reloadAuthResponse()
  }
  return user.getAuthResponse().access_token
}

export const googleSignOut = async () => {
  const authInstance = await gapi.auth2.getAuthInstance()
  if (authInstance.isSignedIn.get()) {
    await authInstance.signOut()
  }
}

export const listGoogleStorageFiles = async (gsPath) => {
  if (!gsPath.startsWith('gs://')) {
    console.error(`${gsPath} doesn't start with "gs://"`)
    return []
  }

  const gsPathParts = gsPath.split('/')
  if (gsPathParts.length < 3) {
    console.error(`${gsPath} must be of the form "gs://bucket-name/..."`)
    return []
  }

  const bucketName = gsPathParts[2]
  const bucketSubdir = gsPathParts.slice(3).join('/')

  return gapi.client.storage.objects.list({ bucket: bucketName, prefix: bucketSubdir, maxResults: 1000 })
}
