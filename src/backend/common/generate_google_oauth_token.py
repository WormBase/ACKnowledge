#!/usr/bin/env python3
"""
Generate OAuth2 refresh token for Google Sheets/Drive API.
This is a one-time setup script to obtain credentials for personal Google account access.

Requirements:
    pip install google-auth google-auth-oauthlib google-auth-httplib2 google-api-python-client

Usage:
    1. Download OAuth2 credentials from Google Cloud Console
    2. Save as 'credentials.json' in the same directory as this script
    3. Run this script: python generate_oauth_token.py
    4. Follow the browser authentication flow
    5. Copy the generated GOOGLE_OAUTH_JSON environment variable
"""

import json
import os
import sys
from pathlib import Path
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError


# Required scopes for Drive and Sheets access
SCOPES = [
    'https://www.googleapis.com/auth/drive',
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/drive.file'
]


def print_section(title, content=None):
    """Pretty print a section with formatting."""
    print()
    print("=" * 70)
    print(f"  {title}")
    print("=" * 70)
    if content:
        print(content)


def check_credentials_file():
    """Check if credentials.json exists and provide instructions if not."""
    if not os.path.exists('credentials.json'):
        print_section("❌ ERROR: credentials.json not found!")
        print("""
To use OAuth2 authentication, you need to:

1. Go to Google Cloud Console:
   https://console.cloud.google.com/apis/credentials

2. Select your project (or create a new one)

3. Click "Create Credentials" → "OAuth client ID"

4. Configure OAuth consent screen if prompted:
   - Choose "External" user type (unless using Google Workspace)
   - Fill in required fields (app name, support email)
   - Add your email to test users
   - Add scopes: Google Drive API, Google Sheets API

5. Back in Credentials, create OAuth client ID:
   - Application type: "Desktop app"
   - Name: "ACKnowledge OAuth" (or any name you prefer)

6. Download the JSON file

7. Save it as 'credentials.json' in the current directory:
   {}

8. Run this script again
""".format(os.getcwd()))
        return False
    return True


def generate_oauth_token():
    """Generate OAuth2 refresh token for Google APIs."""
    
    print_section("Google OAuth2 Token Generator for ACKnowledge")
    
    # Check for credentials file
    if not check_credentials_file():
        return None
    
    print("\n✅ Found credentials.json")
    print("\nStarting OAuth2 authentication flow...")
    print("A browser window will open for you to authorize access.")
    print("Please log in with the Google account you want to use.\n")
    
    try:
        # Create the OAuth2 flow
        flow = InstalledAppFlow.from_client_secrets_file(
            'credentials.json', 
            SCOPES,
            redirect_uri='http://localhost:0'
        )
        
        # Run the OAuth2 flow (opens browser)
        creds = flow.run_local_server(
            port=0,
            success_message='Authentication successful! You can close this window.',
            open_browser=True
        )
        
        # Test the credentials
        print("\n🔍 Testing credentials...")
        test_result = test_credentials(creds)
        
        if not test_result['success']:
            print(f"\n⚠️ Warning: Credentials obtained but testing failed: {test_result['error']}")
        else:
            print(f"✅ Successfully authenticated as: {test_result['email']}")
            print(f"✅ Drive access: Verified")
            print(f"✅ Sheets access: Verified")
        
        # Create the OAuth JSON configuration
        oauth_config = {
            "type": "oauth2_user",
            "client_id": flow.client_config['client_id'],
            "client_secret": flow.client_config['client_secret'],
            "refresh_token": creds.refresh_token,
            "token_uri": "https://oauth2.googleapis.com/token"
        }
        
        # Save to file for reference
        output_file = 'google_oauth_config.json'
        with open(output_file, 'w') as f:
            json.dump(oauth_config, f, indent=2)
        
        # Generate the environment variable
        oauth_json_str = json.dumps(oauth_config)
        
        print_section("✅ SUCCESS! OAuth2 token generated")
        
        print("\n📁 Configuration saved to: {}".format(output_file))
        print("   ⚠️  Keep this file secure and don't commit it to version control!")
        
        print("\n🔧 To use this token, add to your environment:")
        print("\n   For bash/zsh (.bashrc, .zshrc, or .env file):")
        print("   " + "-" * 60)
        print(f"   export GOOGLE_OAUTH_JSON='{oauth_json_str}'")
        print("   " + "-" * 60)
        
        print("\n   For Python directly:")
        print("   " + "-" * 60)
        print(f"   os.environ['GOOGLE_OAUTH_JSON'] = '''{oauth_json_str}'''")
        print("   " + "-" * 60)
        
        print("\n📝 Alternative: You can also use the file directly:")
        print(f"   export GOOGLE_OAUTH_FILE='{os.path.abspath(output_file)}'")
        
        print("\n🎯 Next steps:")
        print("   1. Add the GOOGLE_OAUTH_JSON to your environment")
        print("   2. The google_drive_service.py will automatically use OAuth2")
        print("   3. Spreadsheets will be created under your personal account")
        
        return oauth_config
        
    except Exception as e:
        print_section("❌ ERROR during authentication")
        print(f"\nError details: {e}")
        
        if "access_denied" in str(e):
            print("\n📝 Possible causes:")
            print("   - You cancelled the authorization")
            print("   - The OAuth consent screen is not configured properly")
            print("   - You need to add your email to test users in Google Cloud Console")
        
        return None


def test_credentials(creds):
    """Test the credentials by making API calls."""
    try:
        # Test Drive API
        drive_service = build('drive', 'v3', credentials=creds)
        about = drive_service.about().get(fields='user').execute()
        user_email = about.get('user', {}).get('emailAddress', 'unknown')
        
        # Test Sheets API by creating a test spreadsheet
        sheets_service = build('sheets', 'v4', credentials=creds)
        test_sheet = sheets_service.spreadsheets().create(
            body={'properties': {'title': 'OAuth Test - Delete Me'}}
        ).execute()
        
        # Clean up - delete the test spreadsheet
        if test_sheet.get('spreadsheetId'):
            drive_service.files().delete(
                fileId=test_sheet['spreadsheetId']
            ).execute()
        
        return {
            'success': True,
            'email': user_email
        }
        
    except Exception as e:
        return {
            'success': False,
            'error': str(e)
        }


def main():
    """Main function."""
    try:
        result = generate_oauth_token()
        if result:
            sys.exit(0)
        else:
            sys.exit(1)
    except KeyboardInterrupt:
        print("\n\n⚠️ Authentication cancelled by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()