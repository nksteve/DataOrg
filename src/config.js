// Fill in GOOGLE_CLIENT_ID after creating an OAuth Client ID (Web application)
// in Google Cloud Console -> APIs & Services -> Credentials.
// Authorized JavaScript origins must include:
//   http://localhost:3010          (for local dev)
//   https://nksteve.github.io      (for the deployed app)
export const GOOGLE_CLIENT_ID = 'PUT_YOUR_OAUTH_CLIENT_ID_HERE.apps.googleusercontent.com'

// Full Drive scope is required because MyVault browses/edits files that
// already exist in Drive, not just files it created itself (drive.file
// scope would only see files the app created).
export const DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive'

// The "2nd" folder in nksteve@gmail.com's My Drive - the root MyVault opens into.
export const ROOT_FOLDER_ID = '1XtE7OuNgFSVCXqjV9OrcuN4fr0M-YUMh'
export const ROOT_FOLDER_NAME = '2nd'
