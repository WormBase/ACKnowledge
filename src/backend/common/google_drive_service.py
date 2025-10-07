import os
import json
import logging
import base64
from typing import Optional, Dict, Any

from google.oauth2 import service_account
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

logger = logging.getLogger(__name__)


class GoogleDriveConfig:
    """Configuration class for Google Drive integration using environment variables."""
    
    def __init__(self):
        self.credentials = self._get_google_credentials()
        self.base_parent_folder_id = os.getenv('GOOGLE_DRIVE_PARENT_FOLDER_ID')
        self.domain = os.getenv('GOOGLE_DRIVE_DOMAIN')  # Optional
        self.is_development = os.getenv('ACKNOWLEDGE_MODE', '').lower() in ['dev', 'development', 'local']
        
        if not self.base_parent_folder_id:
            raise ValueError("GOOGLE_DRIVE_PARENT_FOLDER_ID environment variable is required")
        
        # Set up the actual parent folder (with _test suffix in development)
        self.parent_folder_id = self._get_or_create_parent_folder()
        
        if self.is_development:
            logger.info(f"Development mode detected (ACKNOWLEDGE_MODE={os.getenv('ACKNOWLEDGE_MODE', 'not set')})")
        logger.info(f"Google Drive configured with parent folder: {self.parent_folder_id}")
    
    def _get_google_credentials(self):
        """Get Google credentials from environment variables (OAuth2 or Service Account)."""
        scopes = [
            'https://www.googleapis.com/auth/drive',
            'https://www.googleapis.com/auth/spreadsheets',
            'https://www.googleapis.com/auth/drive.file'
        ]
        
        # Try OAuth2 credentials first (personal account)
        oauth_creds = self._try_oauth_credentials(scopes)
        if oauth_creds:
            logger.info("Using OAuth2 credentials (personal account)")
            return oauth_creds
        
        # Fall back to service account credentials
        service_creds = self._try_service_account_credentials(scopes)
        if service_creds:
            logger.info("Using service account credentials")
            return service_creds
        
        raise ValueError(
            "No Google credentials found. Please set one of:\n"
            "OAuth2: GOOGLE_OAUTH_JSON or GOOGLE_OAUTH_FILE\n"
            "Service Account: GOOGLE_SERVICE_ACCOUNT_JSON, "
            "GOOGLE_SERVICE_ACCOUNT_JSON_B64, or GOOGLE_SERVICE_ACCOUNT_FILE"
        )
    
    def _try_oauth_credentials(self, scopes):
        """Try to get OAuth2 credentials from environment variables."""
        # Option 1: OAuth JSON string (from environment variable)
        oauth_json = os.getenv('GOOGLE_OAUTH_JSON')
        if oauth_json:
            try:
                oauth_info = json.loads(oauth_json)
                creds = Credentials(
                    None,
                    refresh_token=oauth_info.get('refresh_token'),
                    token_uri=oauth_info.get('token_uri', 'https://oauth2.googleapis.com/token'),
                    client_id=oauth_info.get('client_id'),
                    client_secret=oauth_info.get('client_secret'),
                    scopes=scopes
                )
                # Refresh to get access token
                creds.refresh(Request())
                return creds
            except Exception as e:
                logger.error(f"Error parsing OAuth2 JSON: {e}")
                # Don't raise, try other methods
        
        # Option 2: OAuth file path
        oauth_file = os.getenv('GOOGLE_OAUTH_FILE')
        if oauth_file and os.path.exists(oauth_file):
            try:
                with open(oauth_file, 'r') as f:
                    oauth_info = json.load(f)
                creds = Credentials(
                    None,
                    refresh_token=oauth_info.get('refresh_token'),
                    token_uri=oauth_info.get('token_uri', 'https://oauth2.googleapis.com/token'),
                    client_id=oauth_info.get('client_id'),
                    client_secret=oauth_info.get('client_secret'),
                    scopes=scopes
                )
                # Refresh to get access token
                creds.refresh(Request())
                return creds
            except Exception as e:
                logger.error(f"Error loading OAuth2 file: {e}")
                # Don't raise, try other methods
        
        return None
    
    def _try_service_account_credentials(self, scopes):
        """Try to get service account credentials from environment variables."""
        # Option 1: Base64 encoded JSON (for secure cloud deployment)
        service_account_json_b64 = os.getenv('GOOGLE_SERVICE_ACCOUNT_JSON_B64')
        if service_account_json_b64:
            try:
                credentials_json = base64.b64decode(service_account_json_b64).decode('utf-8')
                credentials_info = json.loads(credentials_json)
                return service_account.Credentials.from_service_account_info(
                    credentials_info, scopes=scopes
                )
            except Exception as e:
                logger.error(f"Error parsing base64 encoded service account: {e}")
                # Don't raise, try other methods
        
        # Option 2: JSON content directly (for containers/cloud)
        service_account_json = os.getenv('GOOGLE_SERVICE_ACCOUNT_JSON')
        if service_account_json:
            try:
                credentials_info = json.loads(service_account_json)
                return service_account.Credentials.from_service_account_info(
                    credentials_info, scopes=scopes
                )
            except Exception as e:
                logger.error(f"Error parsing service account JSON: {e}")
                # Don't raise, try other methods
        
        # Option 3: File path (for local development)
        service_account_file = os.getenv('GOOGLE_SERVICE_ACCOUNT_FILE')
        if service_account_file and os.path.exists(service_account_file):
            try:
                return service_account.Credentials.from_service_account_file(
                    service_account_file, scopes=scopes
                )
            except Exception as e:
                logger.error(f"Error loading service account file: {e}")
                # Don't raise, try other methods
        
        return None
    
    def _get_or_create_parent_folder(self):
        """Get or create the parent folder, with _test suffix in development mode."""
        if not self.is_development:
            logger.info("Production mode: using configured parent folder directly")
            return self.base_parent_folder_id
        
        # In development mode, create/use a _test folder
        logger.info("Development mode: using test folder")
        
        try:
            # Build a temporary drive service to check/create folders
            from googleapiclient.discovery import build
            drive_service = build('drive', 'v3', credentials=self.credentials)
            
            # Get the base folder name to create test folder
            if self.base_parent_folder_id == 'root':
                test_folder_name = 'ACKnowledge_test'
                parent_for_test = 'root'
            else:
                # Get the base folder info
                base_folder = drive_service.files().get(
                    fileId=self.base_parent_folder_id,
                    fields='name, parents'
                ).execute()
                
                base_folder_name = base_folder.get('name', 'Unknown')
                test_folder_name = f"{base_folder_name}_test"
                parent_for_test = base_folder.get('parents', ['root'])[0] if base_folder.get('parents') else 'root'
            
            # Check if test folder already exists
            query = f"name='{test_folder_name}' and mimeType='application/vnd.google-apps.folder' and parents in '{parent_for_test}'"
            results = drive_service.files().list(q=query, fields='files(id, name)').execute()
            files = results.get('files', [])
            
            if files:
                test_folder_id = files[0]['id']
                logger.info(f"Found existing test folder: {test_folder_name} ({test_folder_id})")
                return test_folder_id
            else:
                # Create test folder
                folder_metadata = {
                    'name': test_folder_name,
                    'mimeType': 'application/vnd.google-apps.folder',
                    'parents': [parent_for_test]
                }
                
                folder = drive_service.files().create(
                    body=folder_metadata,
                    fields='id'
                ).execute()
                
                test_folder_id = folder.get('id')
                logger.info(f"Created test folder: {test_folder_name} ({test_folder_id})")
                return test_folder_id
                
        except Exception as e:
            logger.warning(f"Could not create/access test folder: {e}")
            logger.info("Falling back to base parent folder")
            return self.base_parent_folder_id


class GoogleDriveService:
    """Service class for Google Drive operations."""
    
    def __init__(self):
        self.config = GoogleDriveConfig()
        self.drive_service = build('drive', 'v3', credentials=self.config.credentials)
        self.sheets_service = build('sheets', 'v4', credentials=self.config.credentials)
    
    def validate_credentials(self) -> bool:
        """Validate Google Drive credentials by making a test API call."""
        try:
            # Test Drive API and get user info
            about_result = self.drive_service.about().get(fields='user').execute()
            user_info = about_result.get('user', {})
            email = user_info.get('emailAddress', 'unknown')
            
            # Determine auth type and log appropriately
            if hasattr(self.config.credentials, 'service_account_email'):
                logger.info(f"Service account authenticated: {self.config.credentials.service_account_email}")
                logger.info(f"Drive access validated for service account")
            else:
                logger.info(f"OAuth2 authenticated as: {email}")
                logger.info(f"Personal account Drive access validated")
            
            # Test Sheets API
            try:
                # Just check if we can access the sheets service
                self.sheets_service.spreadsheets()
                logger.info("Google Sheets API access validated successfully")
            except Exception as sheets_error:
                logger.error(f"Google Sheets API validation failed: {sheets_error}")
                return False
                
            return True
        except Exception as e:
            logger.error(f"Google Drive credential validation failed: {e}")
            return False
    
    def create_or_get_paper_folder(self, paper_id: str) -> str:
        """Create or get existing folder for a paper."""
        folder_name = f"WBPaper{paper_id}" if not paper_id.startswith('WBPaper') else paper_id
        
        # Check if folder already exists
        try:
            query = f"name='{folder_name}' and mimeType='application/vnd.google-apps.folder' and parents in '{self.config.parent_folder_id}'"
            results = self.drive_service.files().list(q=query, fields='files(id, name)').execute()
            files = results.get('files', [])
            
            if files:
                logger.info(f"Found existing folder for {paper_id}: {files[0]['id']}")
                return files[0]['id']
        except HttpError as e:
            logger.error(f"Error searching for existing folder: {e}")
        
        # Create new folder
        try:
            folder_metadata = {
                'name': folder_name,
                'mimeType': 'application/vnd.google-apps.folder',
                'parents': [self.config.parent_folder_id]
            }
            
            folder = self.drive_service.files().create(
                body=folder_metadata,
                fields='id'
            ).execute()
            
            folder_id = folder.get('id')
            logger.info(f"Created new folder '{folder_name}' (ID: {folder_id}) in parent folder: {self.config.parent_folder_id}")
            return folder_id
            
        except HttpError as e:
            logger.error(f"Error creating folder for {paper_id}: {e}")
            raise
    
    def _find_existing_spreadsheet(self, folder_id: str, spreadsheet_name: str) -> str:
        """Check if a spreadsheet with the given name already exists in the folder."""
        try:
            # Search for spreadsheets with the exact name in the specific folder
            query = f"name='{spreadsheet_name}' and mimeType='application/vnd.google-apps.spreadsheet' and parents in '{folder_id}' and trashed = false"
            results = self.drive_service.files().list(
                q=query,
                fields='files(id, name, webViewLink)',
                pageSize=1
            ).execute()
            
            files = results.get('files', [])
            if files:
                spreadsheet = files[0]
                spreadsheet_id = spreadsheet['id']
                
                # Get the web view URL
                file_info = self.drive_service.files().get(
                    fileId=spreadsheet_id,
                    fields='webViewLink'
                ).execute()
                
                logger.info(f"Found existing spreadsheet: {spreadsheet_name} (ID: {spreadsheet_id})")
                return file_info['webViewLink']
            
            return None
            
        except HttpError as e:
            logger.error(f"Error searching for existing spreadsheet: {e}")
            # Don't fail if search fails, just proceed to create new one
            return None
    
    def create_alleles_spreadsheet(self, folder_id: str, paper_id: str, 
                                   paper_title: str, author_name: str, pmid: str = None) -> str:
        """Create a new alleles spreadsheet with template, or return existing one."""
        spreadsheet_name = f"Alleles_Submission_{paper_id}"
        
        # First, check if spreadsheet already exists in the folder
        existing_url = self._find_existing_spreadsheet(folder_id, spreadsheet_name)
        if existing_url:
            logger.info(f"Found existing spreadsheet '{spreadsheet_name}' - returning existing URL")
            return existing_url
        
        try:
            # Create spreadsheet directly in Drive (Sheets API doesn't support parent folders)
            logger.info(f"Creating new spreadsheet '{spreadsheet_name}'")
            simple_body = {'properties': {'title': spreadsheet_name}}
            spreadsheet = self.sheets_service.spreadsheets().create(body=simple_body).execute()
            spreadsheet_id = spreadsheet['spreadsheetId']
            logger.info(f"Successfully created spreadsheet: {spreadsheet_id}")
            
            # CRITICAL: Move spreadsheet to the correct folder immediately
            # The Sheets API creates in root by default, so we must move it
            try:
                logger.info(f"Moving spreadsheet to folder: {folder_id}")
                
                # Get current parents first
                file_info = self.drive_service.files().get(
                    fileId=spreadsheet_id,
                    fields='parents'
                ).execute()
                
                previous_parents = ",".join(file_info.get('parents', ['root']))
                
                # Move file to the target folder and remove from all previous locations
                self.drive_service.files().update(
                    fileId=spreadsheet_id,
                    addParents=folder_id,
                    removeParents=previous_parents,
                    fields='id, parents'
                ).execute()
                
                logger.info(f"Successfully moved spreadsheet to folder {folder_id}")
                
                # Verify the move
                updated_file = self.drive_service.files().get(
                    fileId=spreadsheet_id,
                    fields='parents'
                ).execute()
                
                if folder_id in updated_file.get('parents', []):
                    logger.info(f"Verified: Spreadsheet is in folder {folder_id}")
                else:
                    logger.warning(f"Warning: Spreadsheet may not be in the correct folder")
                    
            except HttpError as move_error:
                logger.error(f"Failed to move spreadsheet to folder: {move_error}")
                # Don't continue if we can't place it in the right folder
                raise Exception(f"Cannot place spreadsheet in correct folder: {move_error}")
            
            # Set up the spreadsheet template
            try:
                logger.info(f"Setting up spreadsheet template")
                self._setup_alleles_template(spreadsheet_id, paper_id, paper_title, author_name, pmid)
            except Exception as template_error:
                logger.warning(f"Could not set up template: {template_error}")
            
            # Set sharing permissions
            try:
                logger.info(f"Setting sharing permissions")
                self._set_spreadsheet_permissions(spreadsheet_id)
            except Exception as perm_error:
                logger.warning(f"Could not set permissions: {perm_error}")
            
            # Get the web view URL
            file_info = self.drive_service.files().get(
                fileId=spreadsheet_id,
                fields='webViewLink'
            ).execute()
            
            logger.info(f"Created alleles spreadsheet for {paper_id}: {spreadsheet_id}")
            return file_info['webViewLink']
            
        except HttpError as e:
            logger.error(f"Spreadsheet creation failed: {e}")
            raise
    
    def _setup_alleles_template(self, spreadsheet_id: str, paper_id: str, 
                                paper_title: str, author_name: str, pmid: str = None):
        """Set up the alleles spreadsheet template with headers and instructions."""
        
        try:
            # First, get the current spreadsheet to check existing sheets
            spreadsheet = self.sheets_service.spreadsheets().get(
                spreadsheetId=spreadsheet_id
            ).execute()
            
            sheets = spreadsheet.get('sheets', [])
            
            # Find or create the necessary sheets
            alleles_sheet_id = None
            instructions_sheet_id = None
            
            for sheet in sheets:
                sheet_title = sheet['properties']['title']
                sheet_id = sheet['properties']['sheetId']
                if sheet_title in ['Sheet1', 'Alleles Data']:
                    alleles_sheet_id = sheet_id
                elif sheet_title == 'Instructions':
                    instructions_sheet_id = sheet_id
            
            requests = []
            
            # Rename Sheet1 to Alleles Data if needed
            if alleles_sheet_id is not None and sheets[0]['properties']['title'] == 'Sheet1':
                requests.append({
                    'updateSheetProperties': {
                        'properties': {
                            'sheetId': alleles_sheet_id,
                            'title': 'Alleles Data'
                        },
                        'fields': 'title'
                    }
                })
            
            # Add Instructions sheet if it doesn't exist
            if instructions_sheet_id is None:
                requests.append({
                    'addSheet': {
                        'properties': {
                            'title': 'Instructions',
                            'gridProperties': {
                                'rowCount': 50,
                                'columnCount': 2
                            }
                        }
                    }
                })
                # We'll need to get the new sheet ID after creation
                # For now, we'll use a placeholder
                instructions_sheet_id = 1
            
            # Execute sheet structure changes first
            if requests:
                self.sheets_service.spreadsheets().batchUpdate(
                    spreadsheetId=spreadsheet_id,
                    body={'requests': requests}
                ).execute()
                
                # Re-fetch to get updated sheet IDs
                spreadsheet = self.sheets_service.spreadsheets().get(
                    spreadsheetId=spreadsheet_id
                ).execute()
                sheets = spreadsheet.get('sheets', [])
                
                for sheet in sheets:
                    if sheet['properties']['title'] == 'Alleles Data':
                        alleles_sheet_id = sheet['properties']['sheetId']
                    elif sheet['properties']['title'] == 'Instructions':
                        instructions_sheet_id = sheet['properties']['sheetId']
            
            # Now set up the data using values API (more reliable)
            # Set up Alleles Data headers
            alleles_headers = [[
                'Allele Name',
                'Gene', 
                'Sequence Change Type',
                'Flanking Sequence 5\' (30bp)',
                'Flanking Sequence 3\' (30bp)',
                'Strain',
                'Species',
                'Notes/Comments'
            ]]
            
            self.sheets_service.spreadsheets().values().update(
                spreadsheetId=spreadsheet_id,
                range='Alleles Data!A1:H1',
                valueInputOption='RAW',
                body={'values': alleles_headers}
            ).execute()
            
            # Set up Instructions sheet data
            # Format IDs in Alliance xref curie format
            paper_id_formatted = f"WB:WBPaper{paper_id}"
            pmid_formatted = f"PMID:{pmid}" if pmid else "Not available"
            
            instructions_data = [
                ['Paper Information', ''],
                ['WB Paper ID:', paper_id_formatted],
                ['PMID:', pmid_formatted],
                ['Title:', paper_title],
                ['Author:', author_name],
                ['', ''],
                ['Instructions', ''],
                ['Column A - Allele Name:', 'Enter the allele name (e.g., e1004, bar24)'],
                ['Column B - Gene:', 'Enter the gene name (e.g., flu-4, hmg-3)'],
                ['Column C - Sequence Change Type:', 'deletion, insertion, substitution, etc.'],
                ['Column D - Flanking Sequence 5\':', '30 base pairs upstream of the change'],
                ['Column E - Flanking Sequence 3\':', '30 base pairs downstream of the change'],
                ['Column F - Strain:', 'Strain name (e.g., CB1004, BAT1560)'],
                ['Column G - Species:', 'Species name (e.g., C. elegans)'],
                ['Column H - Notes/Comments:', 'Any additional information'],
                ['', ''],
                ['Examples', ''],
                ['Standard allele:', 'flu-4(e1004), flu-4, deletion, ATCG..., GCTA..., CB1004, C. elegans'],
                ['CRISPR allele:', 'hmg-3(bar24[hmg-3::3xHA]), hmg-3, knock-in, ATCG..., GCTA..., BAT1560, C. elegans'],
                ['', ''],
                ['How to import existing data:', ''],
                ['1. Use File > Import', ''],
                ['2. Select your CSV or Excel file', ''],
                ['3. Choose "Replace spreadsheet" or "Insert new sheet(s)"', ''],
                ['4. Map your columns to match the template headers', '']
            ]
            
            self.sheets_service.spreadsheets().values().update(
                spreadsheetId=spreadsheet_id,
                range='Instructions!A1:B25',
                valueInputOption='RAW',
                body={'values': instructions_data}
            ).execute()
            
            # Apply formatting and column widths (optional, try but don't fail)
            try:
                format_requests = [
                    # Format headers in Alleles Data sheet
                    {
                        'repeatCell': {
                            'range': {
                                'sheetId': alleles_sheet_id,
                                'startRowIndex': 0,
                                'endRowIndex': 1,
                                'startColumnIndex': 0,
                                'endColumnIndex': 8
                            },
                            'cell': {
                                'userEnteredFormat': {
                                    'backgroundColor': {'red': 0.8, 'green': 0.8, 'blue': 0.8},
                                    'textFormat': {'bold': True}
                                }
                            },
                            'fields': 'userEnteredFormat(backgroundColor,textFormat)'
                        }
                    },
                    # Auto-resize columns in Alleles Data sheet
                    {
                        'autoResizeDimensions': {
                            'dimensions': {
                                'sheetId': alleles_sheet_id,
                                'dimension': 'COLUMNS',
                                'startIndex': 0,
                                'endIndex': 8
                            }
                        }
                    }
                ]
                
                # Add column width adjustments for Instructions sheet if it exists
                if instructions_sheet_id is not None:
                    format_requests.extend([
                        # Set column A width (labels column) - wider for the labels
                        {
                            'updateDimensionProperties': {
                                'range': {
                                    'sheetId': instructions_sheet_id,
                                    'dimension': 'COLUMNS',
                                    'startIndex': 0,
                                    'endIndex': 1
                                },
                                'properties': {
                                    'pixelSize': 250  # Width for labels column
                                },
                                'fields': 'pixelSize'
                            }
                        },
                        # Set column B width (values column) - wider for content
                        {
                            'updateDimensionProperties': {
                                'range': {
                                    'sheetId': instructions_sheet_id,
                                    'dimension': 'COLUMNS',
                                    'startIndex': 1,
                                    'endIndex': 2
                                },
                                'properties': {
                                    'pixelSize': 500  # Width for content column
                                },
                                'fields': 'pixelSize'
                            }
                        },
                        # Format the headers in Instructions sheet
                        {
                            'repeatCell': {
                                'range': {
                                    'sheetId': instructions_sheet_id,
                                    'startRowIndex': 0,
                                    'endRowIndex': 1,
                                    'startColumnIndex': 0,
                                    'endColumnIndex': 2
                                },
                                'cell': {
                                    'userEnteredFormat': {
                                        'textFormat': {'bold': True}
                                    }
                                },
                                'fields': 'userEnteredFormat.textFormat'
                            }
                        },
                        {
                            'repeatCell': {
                                'range': {
                                    'sheetId': instructions_sheet_id,
                                    'startRowIndex': 5,
                                    'endRowIndex': 6,
                                    'startColumnIndex': 0,
                                    'endColumnIndex': 1
                                },
                                'cell': {
                                    'userEnteredFormat': {
                                        'textFormat': {'bold': True}
                                    }
                                },
                                'fields': 'userEnteredFormat.textFormat'
                            }
                        },
                        {
                            'repeatCell': {
                                'range': {
                                    'sheetId': instructions_sheet_id,
                                    'startRowIndex': 15,
                                    'endRowIndex': 16,
                                    'startColumnIndex': 0,
                                    'endColumnIndex': 1
                                },
                                'cell': {
                                    'userEnteredFormat': {
                                        'textFormat': {'bold': True}
                                    }
                                },
                                'fields': 'userEnteredFormat.textFormat'
                            }
                        },
                        {
                            'repeatCell': {
                                'range': {
                                    'sheetId': instructions_sheet_id,
                                    'startRowIndex': 19,
                                    'endRowIndex': 20,
                                    'startColumnIndex': 0,
                                    'endColumnIndex': 1
                                },
                                'cell': {
                                    'userEnteredFormat': {
                                        'textFormat': {'bold': True}
                                    }
                                },
                                'fields': 'userEnteredFormat.textFormat'
                            }
                        }
                    ])
                
                self.sheets_service.spreadsheets().batchUpdate(
                    spreadsheetId=spreadsheet_id,
                    body={'requests': format_requests}
                ).execute()
            except Exception as format_error:
                logger.warning(f"Could not apply formatting: {format_error}")
            
            logger.info(f"Successfully set up alleles template for {paper_id}")
            
        except Exception as e:
            logger.error(f"Error setting up template: {e}")
            # Try a simpler approach - just add the headers
            try:
                logger.info("Trying simpler template setup")
                headers = [[
                    'Allele Name', 'Gene', 'Sequence Change Type',
                    'Flanking Sequence 5\' (30bp)', 'Flanking Sequence 3\' (30bp)',
                    'Strain', 'Species', 'Notes/Comments'
                ]]
                
                self.sheets_service.spreadsheets().values().update(
                    spreadsheetId=spreadsheet_id,
                    range='A1:H1',
                    valueInputOption='RAW',
                    body={'values': headers}
                ).execute()
                
                logger.info("Added basic headers to spreadsheet")
            except Exception as simple_error:
                logger.error(f"Even simple template setup failed: {simple_error}")
    
    def create_strains_spreadsheet(self, folder_id: str, paper_id: str, 
                                   paper_title: str, author_name: str, pmid: str = None) -> str:
        """Create a new strains spreadsheet with template, or return existing one."""
        spreadsheet_name = f"Strains_Submission_{paper_id}"
        
        # First, check if spreadsheet already exists in the folder
        existing_url = self._find_existing_spreadsheet(folder_id, spreadsheet_name)
        if existing_url:
            logger.info(f"Found existing spreadsheet '{spreadsheet_name}' - returning existing URL")
            return existing_url
        
        try:
            # Create spreadsheet directly in Drive (Sheets API doesn't support parent folders)
            logger.info(f"Creating new spreadsheet '{spreadsheet_name}'")
            simple_body = {'properties': {'title': spreadsheet_name}}
            spreadsheet = self.sheets_service.spreadsheets().create(body=simple_body).execute()
            spreadsheet_id = spreadsheet['spreadsheetId']
            logger.info(f"Successfully created spreadsheet: {spreadsheet_id}")
            
            # CRITICAL: Move spreadsheet to the correct folder immediately
            # The Sheets API creates in root by default, so we must move it
            try:
                logger.info(f"Moving spreadsheet to folder: {folder_id}")
                
                # Get current parents first
                file_info = self.drive_service.files().get(
                    fileId=spreadsheet_id,
                    fields='parents'
                ).execute()
                
                previous_parents = ",".join(file_info.get('parents', ['root']))
                
                # Move file to the target folder and remove from all previous locations
                self.drive_service.files().update(
                    fileId=spreadsheet_id,
                    addParents=folder_id,
                    removeParents=previous_parents,
                    fields='id, parents'
                ).execute()
                
                logger.info(f"Successfully moved spreadsheet to folder {folder_id}")
                
                # Verify the move
                updated_file = self.drive_service.files().get(
                    fileId=spreadsheet_id,
                    fields='parents'
                ).execute()
                
                if folder_id in updated_file.get('parents', []):
                    logger.info(f"Verified: Spreadsheet is in folder {folder_id}")
                else:
                    logger.warning(f"Warning: Spreadsheet may not be in the correct folder")
                    
            except HttpError as move_error:
                logger.error(f"Failed to move spreadsheet to folder: {move_error}")
                # Don't continue if we can't place it in the right folder
                raise Exception(f"Cannot place spreadsheet in correct folder: {move_error}")
            
            # Set up the spreadsheet template
            try:
                logger.info(f"Setting up spreadsheet template")
                self._setup_strains_template(spreadsheet_id, paper_id, paper_title, author_name, pmid)
            except Exception as template_error:
                logger.warning(f"Could not set up template: {template_error}")
            
            # Set sharing permissions
            try:
                logger.info(f"Setting sharing permissions")
                self._set_spreadsheet_permissions(spreadsheet_id)
            except Exception as perm_error:
                logger.warning(f"Could not set permissions: {perm_error}")
            
            # Get the web view URL
            file_info = self.drive_service.files().get(
                fileId=spreadsheet_id,
                fields='webViewLink'
            ).execute()
            
            logger.info(f"Created strains spreadsheet for {paper_id}: {spreadsheet_id}")
            return file_info['webViewLink']
            
        except HttpError as e:
            logger.error(f"Spreadsheet creation failed: {e}")
            raise
    
    def _setup_strains_template(self, spreadsheet_id: str, paper_id: str, 
                                paper_title: str, author_name: str, pmid: str = None):
        """Set up the strains spreadsheet template with headers and instructions."""
        
        try:
            # First, get the current spreadsheet to check existing sheets
            spreadsheet = self.sheets_service.spreadsheets().get(
                spreadsheetId=spreadsheet_id
            ).execute()
            
            sheets = spreadsheet.get('sheets', [])
            
            # Find or create the necessary sheets
            strains_sheet_id = None
            instructions_sheet_id = None
            
            for sheet in sheets:
                sheet_title = sheet['properties']['title']
                sheet_id = sheet['properties']['sheetId']
                if sheet_title in ['Sheet1', 'Strains Data']:
                    strains_sheet_id = sheet_id
                elif sheet_title == 'Instructions':
                    instructions_sheet_id = sheet_id
            
            requests = []
            
            # Rename Sheet1 to Strains Data if needed
            if strains_sheet_id is not None and sheets[0]['properties']['title'] == 'Sheet1':
                requests.append({
                    'updateSheetProperties': {
                        'properties': {
                            'sheetId': strains_sheet_id,
                            'title': 'Strains Data'
                        },
                        'fields': 'title'
                    }
                })
            
            # Add Instructions sheet if it doesn't exist
            if instructions_sheet_id is None:
                requests.append({
                    'addSheet': {
                        'properties': {
                            'title': 'Instructions',
                            'gridProperties': {
                                'rowCount': 50,
                                'columnCount': 2
                            }
                        }
                    }
                })
                # We'll need to get the new sheet ID after creation
                # For now, we'll use a placeholder
                instructions_sheet_id = 1
            
            # Execute sheet structure changes first
            if requests:
                self.sheets_service.spreadsheets().batchUpdate(
                    spreadsheetId=spreadsheet_id,
                    body={'requests': requests}
                ).execute()
                
                # Re-fetch to get updated sheet IDs
                spreadsheet = self.sheets_service.spreadsheets().get(
                    spreadsheetId=spreadsheet_id
                ).execute()
                sheets = spreadsheet.get('sheets', [])
                
                for sheet in sheets:
                    if sheet['properties']['title'] == 'Strains Data':
                        strains_sheet_id = sheet['properties']['sheetId']
                    elif sheet['properties']['title'] == 'Instructions':
                        instructions_sheet_id = sheet['properties']['sheetId']
            
            # Now set up the data using values API (more reliable)
            # Set up Strains Data headers
            strains_headers = [[
                'Strain Name',
                'Genotype',
                'Species',
                'Background Strain',
                'Outcrossed',
                'Mutagen',
                'Made By',
                'Notes/Comments'
            ]]
            
            self.sheets_service.spreadsheets().values().update(
                spreadsheetId=spreadsheet_id,
                range='Strains Data!A1:H1',
                valueInputOption='RAW',
                body={'values': strains_headers}
            ).execute()
            
            # Set up Instructions sheet data
            # Format IDs in Alliance xref curie format
            paper_id_formatted = f"WB:WBPaper{paper_id}"
            pmid_formatted = f"PMID:{pmid}" if pmid else "Not available"
            
            instructions_data = [
                ['Paper Information', ''],
                ['WB Paper ID:', paper_id_formatted],
                ['PMID:', pmid_formatted],
                ['Title:', paper_title],
                ['Author:', author_name],
                ['', ''],
                ['Instructions', ''],
                ['Column A - Strain Name:', 'Enter the strain name (e.g., CB1004, BAT1560)'],
                ['Column B - Genotype:', 'Enter the genotype (e.g., vhp-1(sa366) II; egIs1 [dat-1p::GFP])'],
                ['Column C - Species:', 'Species name (e.g., C. elegans)'],
                ['Column D - Background Strain:', 'Parent/background strain if applicable (e.g., N2, CB4856)'],
                ['Column E - Outcrossed:', 'Number of times outcrossed (e.g., 3x, 6x)'],
                ['Column F - Mutagen:', 'Mutagen used if applicable (e.g., EMS, UV, CRISPR)'],
                ['Column G - Made By:', 'Person or lab who created the strain'],
                ['Column H - Notes/Comments:', 'Any additional information'],
                ['', ''],
                ['Examples', ''],
                ['Standard strain:', 'CB1004, flu-4(e1004), C. elegans, N2, 6x, EMS, Sydney Brenner'],
                ['CRISPR strain:', 'BAT1560, hmg-3(bar24[hmg-3::3xHA]), C. elegans, N2, 3x, CRISPR, Smith Lab'],
                ['GFP strain:', 
                 'PMD153, vhp-1(sa366) II; egIs1 [dat-1p::GFP], C. elegans, CB4856, Not outcrossed, , Jones Lab'],
                ['', ''],
                ['How to import existing data:', ''],
                ['1. Use File > Import', ''],
                ['2. Select your CSV or Excel file', ''],
                ['3. Choose "Replace spreadsheet" or "Insert new sheet(s)"', ''],
                ['4. Map your columns to match the template headers', ''],
                ['', ''],
                ['Note:', 'For papers with many strains (>250), you can bulk import your strain list'],
                ['', 'from an existing spreadsheet or database export.']
            ]
            
            self.sheets_service.spreadsheets().values().update(
                spreadsheetId=spreadsheet_id,
                range='Instructions!A1:B29',
                valueInputOption='RAW',
                body={'values': instructions_data}
            ).execute()
            
            # Apply formatting and column widths (optional, try but don't fail)
            try:
                format_requests = [
                    # Format headers in Strains Data sheet
                    {
                        'repeatCell': {
                            'range': {
                                'sheetId': strains_sheet_id,
                                'startRowIndex': 0,
                                'endRowIndex': 1,
                                'startColumnIndex': 0,
                                'endColumnIndex': 8
                            },
                            'cell': {
                                'userEnteredFormat': {
                                    'backgroundColor': {'red': 0.8, 'green': 0.8, 'blue': 0.8},
                                    'textFormat': {'bold': True}
                                }
                            },
                            'fields': 'userEnteredFormat(backgroundColor,textFormat)'
                        }
                    },
                    # Auto-resize columns in Strains Data sheet
                    {
                        'autoResizeDimensions': {
                            'dimensions': {
                                'sheetId': strains_sheet_id,
                                'dimension': 'COLUMNS',
                                'startIndex': 0,
                                'endIndex': 8
                            }
                        }
                    }
                ]
                
                # Add column width adjustments for Instructions sheet if it exists
                if instructions_sheet_id is not None:
                    format_requests.extend([
                        # Set column A width (labels column) - wider for the labels
                        {
                            'updateDimensionProperties': {
                                'range': {
                                    'sheetId': instructions_sheet_id,
                                    'dimension': 'COLUMNS',
                                    'startIndex': 0,
                                    'endIndex': 1
                                },
                                'properties': {
                                    'pixelSize': 250  # Width for labels column
                                },
                                'fields': 'pixelSize'
                            }
                        },
                        # Set column B width (values column) - wider for content
                        {
                            'updateDimensionProperties': {
                                'range': {
                                    'sheetId': instructions_sheet_id,
                                    'dimension': 'COLUMNS',
                                    'startIndex': 1,
                                    'endIndex': 2
                                },
                                'properties': {
                                    'pixelSize': 500  # Width for content column
                                },
                                'fields': 'pixelSize'
                            }
                        },
                        # Format the headers in Instructions sheet
                        {
                            'repeatCell': {
                                'range': {
                                    'sheetId': instructions_sheet_id,
                                    'startRowIndex': 0,
                                    'endRowIndex': 1,
                                    'startColumnIndex': 0,
                                    'endColumnIndex': 2
                                },
                                'cell': {
                                    'userEnteredFormat': {
                                        'textFormat': {'bold': True}
                                    }
                                },
                                'fields': 'userEnteredFormat.textFormat'
                            }
                        },
                        {
                            'repeatCell': {
                                'range': {
                                    'sheetId': instructions_sheet_id,
                                    'startRowIndex': 5,
                                    'endRowIndex': 6,
                                    'startColumnIndex': 0,
                                    'endColumnIndex': 1
                                },
                                'cell': {
                                    'userEnteredFormat': {
                                        'textFormat': {'bold': True}
                                    }
                                },
                                'fields': 'userEnteredFormat.textFormat'
                            }
                        },
                        {
                            'repeatCell': {
                                'range': {
                                    'sheetId': instructions_sheet_id,
                                    'startRowIndex': 15,
                                    'endRowIndex': 16,
                                    'startColumnIndex': 0,
                                    'endColumnIndex': 1
                                },
                                'cell': {
                                    'userEnteredFormat': {
                                        'textFormat': {'bold': True}
                                    }
                                },
                                'fields': 'userEnteredFormat.textFormat'
                            }
                        },
                        {
                            'repeatCell': {
                                'range': {
                                    'sheetId': instructions_sheet_id,
                                    'startRowIndex': 20,
                                    'endRowIndex': 21,
                                    'startColumnIndex': 0,
                                    'endColumnIndex': 1
                                },
                                'cell': {
                                    'userEnteredFormat': {
                                        'textFormat': {'bold': True}
                                    }
                                },
                                'fields': 'userEnteredFormat.textFormat'
                            }
                        },
                        {
                            'repeatCell': {
                                'range': {
                                    'sheetId': instructions_sheet_id,
                                    'startRowIndex': 26,
                                    'endRowIndex': 27,
                                    'startColumnIndex': 0,
                                    'endColumnIndex': 1
                                },
                                'cell': {
                                    'userEnteredFormat': {
                                        'textFormat': {'bold': True}
                                    }
                                },
                                'fields': 'userEnteredFormat.textFormat'
                            }
                        }
                    ])
                
                self.sheets_service.spreadsheets().batchUpdate(
                    spreadsheetId=spreadsheet_id,
                    body={'requests': format_requests}
                ).execute()
            except Exception as format_error:
                logger.warning(f"Could not apply formatting: {format_error}")
            
            logger.info(f"Successfully set up strains template for {paper_id}")
            
        except Exception as e:
            logger.error(f"Error setting up template: {e}")
            # Try a simpler approach - just add the headers
            try:
                logger.info("Trying simpler template setup")
                headers = [[
                    'Strain Name', 'Genotype', 'Species',
                    'Background Strain', 'Outcrossed', 'Mutagen',
                    'Made By', 'Notes/Comments'
                ]]
                
                self.sheets_service.spreadsheets().values().update(
                    spreadsheetId=spreadsheet_id,
                    range='A1:H1',
                    valueInputOption='RAW',
                    body={'values': headers}
                ).execute()
                
                logger.info("Added basic headers to spreadsheet")
            except Exception as simple_error:
                logger.error(f"Even simple template setup failed: {simple_error}")

    def create_transgenes_spreadsheet(self, folder_id: str, paper_id: str,
                                      paper_title: str, author_name: str, pmid: str = None) -> str:
        """Create a new transgenes spreadsheet with template, or return existing one."""
        spreadsheet_name = f"Transgenes_Submission_{paper_id}"

        # First, check if spreadsheet already exists in the folder
        existing_url = self._find_existing_spreadsheet(folder_id, spreadsheet_name)
        if existing_url:
            logger.info(f"Found existing spreadsheet '{spreadsheet_name}' - returning existing URL")
            return existing_url

        try:
            # Create spreadsheet directly in Drive (Sheets API doesn't support parent folders)
            logger.info(f"Creating new spreadsheet '{spreadsheet_name}'")
            simple_body = {'properties': {'title': spreadsheet_name}}
            spreadsheet = self.sheets_service.spreadsheets().create(body=simple_body).execute()
            spreadsheet_id = spreadsheet['spreadsheetId']
            logger.info(f"Successfully created spreadsheet: {spreadsheet_id}")

            # CRITICAL: Move spreadsheet to the correct folder immediately
            # The Sheets API creates in root by default, so we must move it
            try:
                logger.info(f"Moving spreadsheet to folder: {folder_id}")

                # Get current parents first
                file_info = self.drive_service.files().get(
                    fileId=spreadsheet_id,
                    fields='parents'
                ).execute()

                previous_parents = ",".join(file_info.get('parents', ['root']))

                # Move file to the target folder and remove from all previous locations
                self.drive_service.files().update(
                    fileId=spreadsheet_id,
                    addParents=folder_id,
                    removeParents=previous_parents,
                    fields='id, parents'
                ).execute()

                logger.info(f"Successfully moved spreadsheet to folder {folder_id}")

                # Verify the move
                updated_file = self.drive_service.files().get(
                    fileId=spreadsheet_id,
                    fields='parents'
                ).execute()

                if folder_id in updated_file.get('parents', []):
                    logger.info(f"Verified: Spreadsheet is in folder {folder_id}")
                else:
                    logger.warning(f"Warning: Spreadsheet may not be in the correct folder")

            except HttpError as move_error:
                logger.error(f"Failed to move spreadsheet to folder: {move_error}")
                # Don't continue if we can't place it in the right folder
                raise Exception(f"Cannot place spreadsheet in correct folder: {move_error}")

            # Set up the spreadsheet template
            try:
                logger.info(f"Setting up spreadsheet template")
                self._setup_transgenes_template(spreadsheet_id, paper_id, paper_title, author_name, pmid)
            except Exception as template_error:
                logger.warning(f"Could not set up template: {template_error}")

            # Set sharing permissions
            try:
                logger.info(f"Setting sharing permissions")
                self._set_spreadsheet_permissions(spreadsheet_id)
            except Exception as perm_error:
                logger.warning(f"Could not set permissions: {perm_error}")

            # Get the web view URL
            file_info = self.drive_service.files().get(
                fileId=spreadsheet_id,
                fields='webViewLink'
            ).execute()

            logger.info(f"Created transgenes spreadsheet for {paper_id}: {spreadsheet_id}")
            return file_info['webViewLink']

        except HttpError as e:
            logger.error(f"Spreadsheet creation failed: {e}")
            raise

    def _setup_transgenes_template(self, spreadsheet_id: str, paper_id: str,
                                   paper_title: str, author_name: str, pmid: str = None):
        """Set up the transgenes spreadsheet template with headers and instructions."""

        try:
            # First, get the current spreadsheet to check existing sheets
            spreadsheet = self.sheets_service.spreadsheets().get(
                spreadsheetId=spreadsheet_id
            ).execute()

            sheets = spreadsheet.get('sheets', [])

            # Find or create the necessary sheets
            transgenes_sheet_id = None
            instructions_sheet_id = None

            for sheet in sheets:
                sheet_title = sheet['properties']['title']
                if sheet_title == 'Sheet1':
                    # Rename Sheet1 to Transgenes Data
                    transgenes_sheet_id = sheet['properties']['sheetId']
                elif sheet_title == 'Transgenes Data':
                    transgenes_sheet_id = sheet['properties']['sheetId']
                elif sheet_title == 'Instructions':
                    instructions_sheet_id = sheet['properties']['sheetId']

            requests = []

            # Rename Sheet1 to Transgenes Data if needed
            if transgenes_sheet_id is not None and 'Sheet1' in [s['properties']['title'] for s in sheets]:
                requests.append({
                    'updateSheetProperties': {
                        'properties': {
                            'sheetId': transgenes_sheet_id,
                            'title': 'Transgenes Data'
                        },
                        'fields': 'title'
                    }
                })

            # Create Instructions sheet if it doesn't exist
            if instructions_sheet_id is None:
                requests.append({
                    'addSheet': {
                        'properties': {
                            'title': 'Instructions',
                            'index': 0
                        }
                    }
                })

            # Execute the sheet creation/renaming requests
            if requests:
                self.sheets_service.spreadsheets().batchUpdate(
                    spreadsheetId=spreadsheet_id,
                    body={'requests': requests}
                ).execute()

                # Refresh sheet IDs after creation
                spreadsheet = self.sheets_service.spreadsheets().get(
                    spreadsheetId=spreadsheet_id
                ).execute()

                for sheet in spreadsheet['sheets']:
                    if sheet['properties']['title'] == 'Transgenes Data':
                        transgenes_sheet_id = sheet['properties']['sheetId']
                    elif sheet['properties']['title'] == 'Instructions':
                        instructions_sheet_id = sheet['properties']['sheetId']

            # Set up Transgenes Data sheet headers
            transgenes_headers = [[
                'Transgene Name',
                'Genotype/Construct',
                'Species',
                'Integrated/Extrachromosomal',
                'Expressed Gene(s)',
                'Promoter(s)',
                'Markers',
                'Notes/Comments'
            ]]

            self.sheets_service.spreadsheets().values().update(
                spreadsheetId=spreadsheet_id,
                range='Transgenes Data!A1:H1',
                valueInputOption='RAW',
                body={'values': transgenes_headers}
            ).execute()

            # Set up Instructions sheet data
            # Format IDs in Alliance xref curie format
            paper_id_formatted = f"WB:WBPaper{paper_id}"
            pmid_formatted = f"PMID:{pmid}" if pmid else "Not available"

            instructions_data = [
                ['Paper Information', ''],
                ['WB Paper ID:', paper_id_formatted],
                ['PMID:', pmid_formatted],
                ['Title:', paper_title],
                ['Author:', author_name],
                ['', ''],
                ['Instructions', ''],
                ['Column A - Transgene Name:', 'Enter the transgene name (e.g., eaIs15, sqEx67, ctIs40)'],
                ['Column B - Genotype/Construct:', 'Enter the construct details (e.g., [Ppie-1::HIM-5::GFP::pie-1])'],
                ['Column C - Species:', 'Species name (e.g., C. elegans)'],
                ['Column D - Integrated/Extrachromosomal:', 'Type: "Integrated" or "Extrachromosomal"'],
                ['Column E - Expressed Gene(s):', 'Genes expressed by the transgene (e.g., GFP, mCherry)'],
                ['Column F - Promoter(s):', 'Promoter(s) used (e.g., pie-1p, myo-3p, unc-119p)'],
                ['Column G - Markers:', 'Selectable markers if any (e.g., rol-6, unc-119(+))'],
                ['Column H - Notes/Comments:', 'Any additional information'],
                ['', ''],
                ['Examples', ''],
                ['Integrated transgene:', 'eaIs15, [Ppie-1::HIM-5::GFP::pie-1], C. elegans, Integrated, GFP::HIM-5, pie-1p, , '],
                ['Extrachromosomal array:', 'sqEx67, [rgef-1p::mCherry::GFP::lgg-1 + rol-6], C. elegans, Extrachromosomal, mCherry::GFP::LGG-1, rgef-1p, rol-6, Fluorescent autophagy marker'],
                ['Multi-gene construct:', 'ctIs40, [Punc-119::sid-1 + Punc-119::GFP], C. elegans, Integrated, SID-1::GFP, unc-119p, , Pan-neuronal expression'],
                ['', ''],
                ['How to import existing data:', ''],
                ['1. Use File > Import', ''],
                ['2. Select your CSV or Excel file', ''],
                ['3. Choose "Replace spreadsheet" or "Insert new sheet(s)"', ''],
                ['4. Map your columns to match the template headers', ''],
                ['', ''],
                ['Note:', 'For papers with many transgenes (>250), you can bulk import your transgene list'],
                ['', 'from an existing spreadsheet or database export.']
            ]

            self.sheets_service.spreadsheets().values().update(
                spreadsheetId=spreadsheet_id,
                range='Instructions!A1:B31',
                valueInputOption='RAW',
                body={'values': instructions_data}
            ).execute()

            # Apply formatting and column widths (optional, try but don't fail)
            try:
                format_requests = [
                    # Format headers in Transgenes Data sheet
                    {
                        'repeatCell': {
                            'range': {
                                'sheetId': transgenes_sheet_id,
                                'startRowIndex': 0,
                                'endRowIndex': 1,
                                'startColumnIndex': 0,
                                'endColumnIndex': 8
                            },
                            'cell': {
                                'userEnteredFormat': {
                                    'backgroundColor': {'red': 0.8, 'green': 0.8, 'blue': 0.8},
                                    'textFormat': {'bold': True}
                                }
                            },
                            'fields': 'userEnteredFormat(backgroundColor,textFormat)'
                        }
                    },
                    # Auto-resize columns in Transgenes Data sheet
                    {
                        'autoResizeDimensions': {
                            'dimensions': {
                                'sheetId': transgenes_sheet_id,
                                'dimension': 'COLUMNS',
                                'startIndex': 0,
                                'endIndex': 8
                            }
                        }
                    },
                    # Format Instructions sheet headers
                    {
                        'repeatCell': {
                            'range': {
                                'sheetId': instructions_sheet_id,
                                'startRowIndex': 0,
                                'endRowIndex': 1,
                                'startColumnIndex': 0,
                                'endColumnIndex': 2
                            },
                            'cell': {
                                'userEnteredFormat': {
                                    'textFormat': {'bold': True, 'fontSize': 12}
                                }
                            },
                            'fields': 'userEnteredFormat(textFormat)'
                        }
                    },
                    # Auto-resize columns in Instructions sheet
                    {
                        'autoResizeDimensions': {
                            'dimensions': {
                                'sheetId': instructions_sheet_id,
                                'dimension': 'COLUMNS',
                                'startIndex': 0,
                                'endIndex': 2
                            }
                        }
                    }
                ]

                self.sheets_service.spreadsheets().batchUpdate(
                    spreadsheetId=spreadsheet_id,
                    body={'requests': format_requests}
                ).execute()

                logger.info("Successfully formatted transgenes spreadsheet")

            except Exception as format_error:
                logger.warning(f"Could not apply formatting: {format_error}")

        except Exception as e:
            logger.error(f"Error setting up transgenes template: {e}")
            # If complex setup fails, try simple headers
            try:
                headers = [[
                    'Transgene Name', 'Genotype/Construct', 'Species',
                    'Integrated/Extrachromosomal', 'Expressed Gene(s)',
                    'Promoter(s)', 'Markers', 'Notes/Comments'
                ]]

                self.sheets_service.spreadsheets().values().update(
                    spreadsheetId=spreadsheet_id,
                    range='A1:H1',
                    valueInputOption='RAW',
                    body={'values': headers}
                ).execute()

                logger.info("Added basic headers to spreadsheet")
            except Exception as simple_error:
                logger.error(f"Even simple template setup failed: {simple_error}")

    def _set_spreadsheet_permissions(self, spreadsheet_id: str):
        """Set sharing permissions for the spreadsheet."""
        try:
            # Make it editable by anyone with the link
            permission = {
                'type': 'anyone',
                'role': 'writer'
            }
            
            # If domain is specified, restrict to domain
            if self.config.domain:
                permission = {
                    'type': 'domain',
                    'domain': self.config.domain,
                    'role': 'writer'
                }
            
            # Create permission with sendNotificationEmail=False to avoid errors
            self.drive_service.permissions().create(
                fileId=spreadsheet_id,
                body=permission,
                sendNotificationEmail=False,
                supportsAllDrives=True
            ).execute()
            
            logger.info(f"Set permissions for spreadsheet {spreadsheet_id} - anyone can edit")
            
        except HttpError as e:
            logger.error(f"Failed to set permissions for spreadsheet {spreadsheet_id}: {e}")
            # Try alternative permission setting
            try:
                # Try without supportsAllDrives parameter
                self.drive_service.permissions().create(
                    fileId=spreadsheet_id,
                    body={'type': 'anyone', 'role': 'writer'},
                    sendNotificationEmail=False
                ).execute()
                logger.info(f"Set permissions using fallback method")
            except Exception as fallback_error:
                logger.error(f"Fallback permission setting also failed: {fallback_error}")
            # Don't fail if permissions can't be set
