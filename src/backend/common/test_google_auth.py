#!/usr/bin/env python3
"""
Test script to verify both OAuth2 and Service Account authentication methods
for Google Drive/Sheets integration.
"""

import os
import sys
import json
from pathlib import Path

# Add the src directory to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from backend.common.google_drive_service import GoogleDriveService, GoogleDriveConfig


def test_current_auth():
    """Test whichever authentication method is currently configured."""
    print("=" * 70)
    print("Testing Google Drive/Sheets Authentication")
    print("=" * 70)
    
    # Check which auth method is available
    oauth_available = any([
        os.getenv('GOOGLE_OAUTH_JSON'),
        os.getenv('GOOGLE_OAUTH_FILE')
    ])
    
    service_account_available = any([
        os.getenv('GOOGLE_SERVICE_ACCOUNT_JSON'),
        os.getenv('GOOGLE_SERVICE_ACCOUNT_JSON_B64'),
        os.getenv('GOOGLE_SERVICE_ACCOUNT_FILE')
    ])
    
    print("\n🔍 Checking available authentication methods:")
    print(f"   OAuth2 (personal account): {'✅ Available' if oauth_available else '❌ Not configured'}")
    print(f"   Service Account: {'✅ Available' if service_account_available else '❌ Not configured'}")
    
    if not oauth_available and not service_account_available:
        print("\n❌ No authentication method configured!")
        print("\nTo configure OAuth2:")
        print("   1. Run: python generate_oauth_token.py")
        print("   2. Follow the authentication flow")
        print("   3. Set the GOOGLE_OAUTH_JSON environment variable")
        print("\nTo configure Service Account:")
        print("   1. Create a service account in Google Cloud Console")
        print("   2. Set GOOGLE_SERVICE_ACCOUNT_JSON environment variable")
        return False
    
    # Check for parent folder ID
    parent_folder_id = os.getenv('GOOGLE_DRIVE_PARENT_FOLDER_ID')
    if not parent_folder_id:
        print("\n⚠️  Warning: GOOGLE_DRIVE_PARENT_FOLDER_ID not set")
        print("   Setting a test folder ID for validation only")
        os.environ['GOOGLE_DRIVE_PARENT_FOLDER_ID'] = 'root'  # Use root for testing
    
    print("\n🚀 Initializing Google Drive Service...")
    
    try:
        # Initialize the service
        service = GoogleDriveService()
        
        # Validate credentials
        print("\n🔐 Validating credentials...")
        if service.validate_credentials():
            print("✅ Authentication successful!")
            
            # Try to create a test spreadsheet
            print("\n📝 Testing spreadsheet creation...")
            try:
                # Create a simple test spreadsheet
                test_sheet = service.sheets_service.spreadsheets().create(
                    body={
                        'properties': {
                            'title': 'ACKnowledge Auth Test - Can Delete'
                        }
                    }
                ).execute()
                
                sheet_id = test_sheet.get('spreadsheetId')
                sheet_url = f"https://docs.google.com/spreadsheets/d/{sheet_id}"
                
                print(f"✅ Successfully created test spreadsheet!")
                print(f"   URL: {sheet_url}")
                print(f"   ID: {sheet_id}")
                
                # Add some test data
                values = [
                    ['Authentication Test', 'Status'],
                    ['OAuth2/Service Account', 'Working'],
                    ['Sheets API', 'Accessible'],
                    ['Drive API', 'Accessible']
                ]
                
                service.sheets_service.spreadsheets().values().update(
                    spreadsheetId=sheet_id,
                    range='A1:B4',
                    valueInputOption='USER_ENTERED',
                    body={'values': values}
                ).execute()
                
                print("✅ Successfully added data to spreadsheet")
                
                # Clean up - optional
                print("\n🗑️  Cleaning up test spreadsheet...")
                try:
                    service.drive_service.files().delete(fileId=sheet_id).execute()
                    print("✅ Test spreadsheet deleted")
                except:
                    print("⚠️  Could not delete test spreadsheet (may need manual cleanup)")
                
                return True
                
            except Exception as e:
                print(f"❌ Spreadsheet creation failed: {e}")
                return False
        else:
            print("❌ Authentication validation failed")
            return False
            
    except Exception as e:
        print(f"\n❌ Error: {e}")
        return False


def switch_to_oauth():
    """Helper to switch to OAuth2 authentication."""
    print("\n📝 To switch to OAuth2 authentication:")
    print("   1. Run: python generate_oauth_token.py")
    print("   2. Copy the GOOGLE_OAUTH_JSON value")
    print("   3. Unset service account variables:")
    print("      unset GOOGLE_SERVICE_ACCOUNT_JSON")
    print("      unset GOOGLE_SERVICE_ACCOUNT_JSON_B64")
    print("      unset GOOGLE_SERVICE_ACCOUNT_FILE")
    print("   4. Set OAuth variable:")
    print("      export GOOGLE_OAUTH_JSON='<your-oauth-json>'")


def switch_to_service_account():
    """Helper to switch to service account authentication."""
    print("\n📝 To switch to service account authentication:")
    print("   1. Unset OAuth variables:")
    print("      unset GOOGLE_OAUTH_JSON")
    print("      unset GOOGLE_OAUTH_FILE")
    print("   2. Set service account variable:")
    print("      export GOOGLE_SERVICE_ACCOUNT_JSON='<your-service-account-json>'")


if __name__ == "__main__":
    print("\nGoogle Drive/Sheets Authentication Test")
    print("========================================\n")
    
    success = test_current_auth()
    
    if success:
        print("\n" + "=" * 70)
        print("✅ All tests passed! Authentication is working correctly.")
        print("=" * 70)
    else:
        print("\n" + "=" * 70)
        print("❌ Tests failed. Please check your configuration.")
        print("=" * 70)
        
        # Show switching instructions
        switch_to_oauth()
        switch_to_service_account()
    
    sys.exit(0 if success else 1)